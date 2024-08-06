---
sidebar_position: 2
---

# Catalog Communication

In this section we describe how to communicate with Catalog - mainly how to upload new datasets that the application uses for creating recommendations.

## Uploading Datasets for Analysis

Uploading datasets for analysis is done through Catalog app which
supports [SPARQL Graph Store HTTP Protocol](https://www.w3.org/TR/sparql11-http-rdf-update/) on
endpoint `/rdf-graph-store`. Since Catalog proxies all requests to
[Virtuoso](https://github.com/openlink/virtuoso-opensource), the support is as complete as Virtuoso's.
That, for example, means that some responses might have not spec
compliant return codes. Catalog app typically runs on URL specified by
`CATALOG_URL` environment variable.

The protocol allows update and fetch RDF graph data in RDF Graph store
using HTTP. We only highlight the main features that are used to upload,
update and retrieve datasets.

Uploading a dataset can be done using HTTP POST or HTTP PUT request on
`/rdf-graph-store` endpoint. Datasets are uploaded as a RDF files to
either a default graph or a graph specified by URI. Using HTTP PUT
request replaces the graph content while HTTP POST adds the data to the
graph. Note that in our case specifying the default graph option results
in Catalog generating a random graph URI that the RDF data are placed
in. The generated graph URI is then returned in response header
`Graph-URI`. Uploaded RDF data are sent to Analyzer Manager that
retrieves DCAT datasets which are then analyzed.

The RDF data can sent in multipart/form-data under name `res-file`
otherwise Virtuoso fails. Alternatively, it can be done using curl program as shown below. Graph data can be retrieved using
HTTP GET (also shown below).

```{.bash language="bash"}
# Add datasets to a random graph.
curl \
  --verbose \
  --url "http://{catalog-domain:port}/rdf-graph-store?default" \
  -X POST \
  -T {dcat-dataset-file}

# Add datasets to graph {URI}.
curl \
  --verbose \
  --url "http://{catalog-domain:port}/rdf-graph-store?graph={URI}" \
  -X POST \
  -T {dcat-dataset-file}

# Update graph {URI} with new datasets.
curl \
  --verbose \
  --url "http://{catalog-domain:port}/rdf-graph-store?graph={URI}" \
  -X PUT \
  -T {dcat-dataset-file}

# Get graph {URI}.
curl \
  --url "http://{catalog-domain:port}/rdf-graph-store?graph={URI}"
```

If one dataset is submitted multiple times, its older analyses are
overwritten with new ones.

## Browsing Catalog Data

Virtuoso also provides a SPARQL endpoint outside the context of Catalog
which administrator can use to browse datasets and related analysis
provenance. Virtuoso's URL is set in `VIRTUOSO_URL` environment
variable. The SPARQL endpoint would then be available at
`{VIRTUOSO_URL}/sparql/`.

Analysis provenance is specified using the [PROV ontology](https://www.w3.org/TR/prov-o/).
The provenance data represent an analysis as `prov:Entity`. Its IRI is
dereferenceable and leads to the full analysis content. Analysis is
connected to the `prov:Activity` that generated it using
`prov:wasGeneratedBy`. The activity is linked to the analyzed dataset
using `prov:used` and to the analyzer that created the analysis using
`prov:wasAssociatedWith`.
