# Notes

One note per file, named by its id.

Notes merge. `notes/snow-quotations.json` in the South London example took nine edges as a
readable diff on 2026-10-29, while the same notes inside the project bundle could not be diffed at
all — and the two copies then diverged, which is the defect this layout exists to prevent.

A note is one of four kinds — `quoted`, `authored`, `derived`, `machined` — and only an `authored`
note carries an author, because a quoted note belongs to its source and a derived or machined one
to the widget that produced it.

Measured: a note averages 646 bytes.

**Machined and derived notes do not belong here.** A run produces them and the node that produced
them owns them, so they are rebuilt rather than stored.
