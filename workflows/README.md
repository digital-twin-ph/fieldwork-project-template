# Workflow graphs

One file per workflow. The file name is the workflow key named in `../project.json`.

A graph is small: measured across the eight workflows of the South London example, with payloads
externalised, each is between 4.6 kB and 41 kB of readable JSON. The largest is largest because it
carries a *decision* — 859 OpenStreetMap feature ids a practitioner set aside — which is exactly
what a reviewer should see in a diff.

Each file holds the workflow document the application already writes:

```json
{ "schema": "fieldwork/workflow/1", "id": "", "workflowKey": "", "name": "",
  "nodes": [], "edges": [] }
```

with one difference: a node that would inline a payload names one in `../assets/manifest.json`
instead.
