#!/usr/bin/env node
/** WHAT THIS REPOSITORY CLAIMS ABOUT ITSELF, CHECKED.
 *
 *  The layout's whole argument is that a project can be distributed and proved: a payload is
 *  named by path and digest, an acquired one by the declaration that rebuilds it, and a workflow
 *  by a file somebody can read. None of that is worth anything if nothing checks it, and the
 *  failure it prevents is specific: a co-author commits a graph that references an asset they
 *  forgot to add, and the project is broken for everybody else rather than for them.
 *
 *  It needs no dependencies and no Fieldwork. A project repository stands on its own.
 *
 *  Run: node scripts/validate-project.mjs
 */
import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';

const problems=[];
const complain=(what)=>problems.push(what);
const read=(p)=>JSON.parse(readFileSync(p,'utf8'));
const sha=(p)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const listing=(dir)=>existsSync(dir)?readdirSync(dir).filter(f=>f.endsWith('.json')):[];

if(!existsSync('project.json')){
  console.error('No project.json. This is the file that says what the project is.');
  process.exit(1);
}
const project=read('project.json');
for(const field of ['schema','id','name','subject','workflows'])
  if(project[field]===undefined)complain(`project.json has no \`${field}\`.`);
if(!Array.isArray(project.workflows))complain('project.json `workflows` is not a list.');

// BOTH DIRECTIONS. A file nobody lists is as broken as a listing with no file: the first is work
// that will not open, the second is an entry that opens nothing.
const onDisk=new Set(listing('workflows').map(f=>f.replace(/\.json$/,'')));
const listed=new Set(project.workflows||[]);
for(const key of listed)
  if(!onDisk.has(key))complain(`project.json lists "${key}" and workflows/${key}.json does not exist.`);
for(const key of onDisk)
  if(!listed.has(key))complain(`workflows/${key}.json exists and project.json does not list it.`);

const manifest=existsSync('assets/manifest.json')?read('assets/manifest.json'):{assets:{},acquired:{}};
const assets=manifest.assets||{}, acquired=manifest.acquired||{};

for(const [path,declared] of Object.entries(assets)){
  if(!existsSync(path)){complain(`assets/manifest.json names ${path}, which does not exist.`);continue;}
  const bytes=statSync(path).size, digest=sha(path);
  if(declared.bytes!==undefined&&declared.bytes!==bytes)
    complain(`${path} is ${bytes} bytes and the manifest says ${declared.bytes}.`);
  if(declared.sha256&&declared.sha256!==digest)
    complain(`${path} does not match its digest. Expected ${declared.sha256}, computed ${digest}.`);
}
// A declaration has to be able to rebuild what it stands in for, so the fields that make that
// possible are required rather than conventional.
for(const [name,decl] of Object.entries(acquired))
  for(const field of ['source','sha256','bytes'])
    if(decl[field]===undefined)complain(`acquired "${name}" has no \`${field}\`, so nothing can rebuild it.`);

let nodes=0,referenced=0;
for(const key of onDisk){
  const path=join('workflows',key+'.json');
  let doc;
  try{doc=read(path);}catch(e){complain(`workflows/${key}.json is not readable JSON: ${e.message}`);continue;}
  if(!Array.isArray(doc.nodes))complain(`workflows/${key}.json has no \`nodes\`.`);
  if(!Array.isArray(doc.edges))complain(`workflows/${key}.json has no \`edges\`.`);
  const ids=new Set((doc.nodes||[]).map(n=>n.id));
  for(const edge of doc.edges||[]){
    if(!ids.has(edge.from))complain(`workflows/${key}.json: an edge comes from "${edge.from}", which is not a node here.`);
    if(!ids.has(edge.to))complain(`workflows/${key}.json: an edge goes to "${edge.to}", which is not a node here.`);
  }
  for(const node of doc.nodes||[]){
    nodes++;
    const from=node.params?.dataFrom;
    if(!from)continue;
    referenced++;
    if(from.path){
      if(!assets[from.path])complain(`workflows/${key}.json: node "${node.id}" uses ${from.path}, which assets/manifest.json does not name.`);
      else if(from.sha256&&assets[from.path].sha256&&from.sha256!==assets[from.path].sha256)
        complain(`workflows/${key}.json: node "${node.id}" names a different digest for ${from.path} than the manifest does.`);
    }else if(from.acquired){
      if(!acquired[from.acquired])complain(`workflows/${key}.json: node "${node.id}" rebuilds from "${from.acquired}", which is not declared in assets/manifest.json.`);
    }else if(!from.rebuiltFrom)
      complain(`workflows/${key}.json: node "${node.id}" has a \`dataFrom\` that names neither a path, an acquired read, nor what it is rebuilt from.`);
  }
}

let notes=0;
for(const file of listing('notes')){
  const path=join('notes',file);
  let note;
  try{note=read(path);}catch(e){complain(`${path} is not readable JSON: ${e.message}`);continue;}
  notes++;
  if(!note.id)complain(`${path} has no \`id\`.`);
  else if(note.id!==file.replace(/\.json$/,''))
    complain(`${path} holds a note whose id is "${note.id}". A note is named by its id, so one of the two is wrong.`);
  if(!note.kind)complain(`${path} has no \`kind\`.`);
}

const counted=`${onDisk.size} workflows, ${nodes} nodes (${referenced} referencing a payload), `
  +`${notes} notes, ${Object.keys(assets).length} assets, ${Object.keys(acquired).length} declared reads`;
if(problems.length){
  console.error(`${project.name||project.id||'This project'} — ${counted}\n`);
  for(const p of problems)console.error('  '+p);
  console.error(`\n${problems.length} problem${problems.length===1?'':'s'}.`);
  process.exit(1);
}
console.log(`${project.name||project.id||'This project'} — ${counted}. Everything it claims checks out.`);
