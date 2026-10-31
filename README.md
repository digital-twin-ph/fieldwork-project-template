# A Fieldwork project, as a repository several people can own

Start a project from this template when more than one person will work on it.

A Fieldwork project exports as one gzipped file. That is a good export — one file a practitioner
downloads and re-imports is the offline-first guarantee working — and it is the wrong shape for
co-ownership: two authors editing different workflows produce a conflict on the same blob, git
cannot diff it, and `git log` says only that 400 kB changed. This layout is the same project with
the parts separated, so that two people can change different things without changing the same
bytes.

> **Nothing in Fieldwork reads or writes this layout yet.** The application imports and exports
> `fieldwork-project.json.gz`; the converter between that and these files is unbuilt. A repository
> made from this template is a place to put work and to review it, not yet a thing the application
> can open. This is recorded rather than implied because the gap is the whole of the remaining
> work. See experiment 150 in the Fieldwork repository.

## The layout

```
project.json            the project: name, subject, authors, when it began, its workflow list
workflows/<key>.json    one workflow graph per file          ← the unit of collaboration
notes/<id>.json         one note per file
assets/manifest.json    every payload, by path + sha256 + bytes, or as a declaration
assets/…                payloads small enough to commit, as text that diffs
NOTICE.txt              third-party terms, including any that reach this repository
.fieldwork/format.json  the version of this layout
```

## Why a file is a workflow

Because **there is no merge base in a browser**. Fieldwork runs offline-first and cannot shell out
to `git`, so three-way merge is unavailable at any granularity. What a browser *can* do was
measured against GitHub on 2026-10-29: the Contents API answers `access-control-allow-origin: *`,
takes a blob `sha` as a precondition on `PUT`, and exposes `ETag` — so a stale write is refused by
GitHub rather than detected by us, **per file**.

That makes granularity the merge strategy. It follows that the unit should be what people edit:

- **Two authors on different workflows must not conflict.** Separate files, separate preconditions.
- **Two authors on the same workflow should.** A canvas is a graph, and a silently merged graph is
  a graph neither author drew.
- **A conflict should be legible.** *"You both changed this note"* is a thing an epidemiologist can
  adjudicate. A conflict inside a gzip cannot even be expressed.

## Why payloads are not in the graph

Measured on the South London example, eight workflows, 2,415,185 bytes of JSON: with payloads
externalised the graphs come to about 92 kB — **under four per cent**. The rest was data, and much
of it was stored twice, once inlined in the bundle and once as a plain file in the same repository.

| workflow | in the bundle | graph alone |
| --- | ---: | ---: |
| Snow's Map 2, as published | 351,988 | 4,593 |
| The ground | 287,964 | 8,370 |
| Deaths per 1,000 people, mapped | 465,822 | 11,119 |
| The river as it runs | 1,247,622 | 40,942 |

So a node names a payload; it does not carry one. See `assets/README.md`, including what happens
to a payload too large to commit.

**One asset this layout cannot externalise yet:** a study area's geometry. `AreaParams` declares no
payload reference, so geometry is inlined — 85,435 bytes on one node of that example, which is why
the mapped workflow above is 11 kB rather than 5 kB. It is a known gap, not a choice.

## The discussion, and who governs it

A project repository is also where the investigation is argued out. GitHub Discussions is a
joint public record of that argument — attributed, timestamped, linkable, and readable by anyone
with no credential — which is what an open-source project has always had and most published
research does not.

**The governance is yours, not the application's.** Fieldwork reads nothing here and enforces
nothing. What it ships is one form, `.github/DISCUSSION_TEMPLATE/decisions.yml`, and the reason it
is a file rather than a setting is that a file is version-controlled: you change how your project
deliberates by opening a pull request against it, and the change is reviewable like any other.

**One form, for decisions only.** Structure imposed on exploration is friction, and the point of
this application is to decrease friction. A decision is the one kind of post that must be written
down, so it is the one kind with required fields — including the two that are the governance
rather than the record:

- **Where the ruling lands.** A decision that reaches only the thread has not been acted on.
- **Who carries it out.** Attribution is a claim about who did the work, so it is asked for.

Everything else stays open text.

**To turn it on:** enable Discussions in this repository's settings and create a category whose
slug is `decisions`. The form binds to the category by file name, so a category by any other name
needs the file renamed to match.

**Not verified, and worth checking the first time you generate a project from this template:**
whether discussion *categories* come across. The form is a file and certainly travels; categories
are repository settings and may not. If they do not, creating the category is a one-time step per
project.

## Before you share this

- **Add a licence.** There is deliberately no `LICENSE` here: a template that picks one picks it for
  every project copied from it. Until you add one, this repository is all rights reserved.
- **Fill in `NOTICE.txt`** for anything third-party. Some terms — share-alike data licences in
  particular — reach the repository itself and not only the figures made from it.
- **Add your co-authors as collaborators.** Co-ownership is GitHub's model; Fieldwork implements no
  permission model and a write it is not entitled to make is refused by GitHub.
- **If you will write back from the application**, the token specification is in experiment 150:
  a fine-grained token, one repository, **Contents: Read and write and nothing else**, short
  expiry. Not a classic token, whose `repo` scope reaches every repository you can see. Do not
  grant Workflows.
