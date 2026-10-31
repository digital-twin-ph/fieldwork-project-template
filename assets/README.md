# Assets

Payloads a node refers to, plus `manifest.json`, which is the index.

## What is committed

A payload small enough to belong in a repository, as plain text that diffs — a boundary file, a
table, a traced layer. It is listed in `manifest.json` under `assets`, by path, `sha256` and
`bytes`. That is the same vocabulary `widgets/examples.json` already uses to pin a worked example,
reused here rather than invented.

## What is NOT committed

A payload that was read out of a large source: an OpenStreetMap extract, a raster, a downloaded
street network. Those are hundreds of megabytes and nobody should commit them. What is committed
is the **declaration that reproduces the read**, under `acquired`:

```json
{ "acquired": {
    "<name>": {
      "source": "openstreetmap-extract",
      "from": "greater-london-261028.osm.pbf",
      "bytes": 129877457,
      "sha256": "…",
      "bbox": [-0.34, 51.38, 0.03, 51.52],
      "kinds": ["water"],
      "kept": 866,
      "dropped": { "outsideBox": 2559 },
      "licence": "ODbL-1.0",
      "attribution": "© OpenStreetMap contributors"
    } } }
```

The application already records exactly this on the node that made the read, so the declaration is
read off the work rather than written by hand.

**The cost of this choice, stated rather than discovered later.** A clone rebuilds by reading the
extract again, so reproducibility depends on that extract still being obtainable — and Geofabrik
rotates its extracts. The digest proves you got the right file; it does not get you the file. A
project that needs to survive the source going away should commit the read as an asset and accept
the size.

## Licences travel with the payload

An asset carries its own terms, and some of them reach this repository. Data under a share-alike
licence — the ODbL, for instance — makes the repository a Derivative Database in part. Record it
in `NOTICE.txt`; do not assume the project licence covers it.
