# Install

In this section we describe how to get the application running locally. If you are using the live version of the app, you can skip the step and go directly to [Transformation](transformation) section. Note that using the live version may provide a bit different recommended data transformations. The manual part is the same as when using a local version.

There are two steps. We need to install the application itself and then load data based on which recommended transformations are suggested.

## Run Application

## Upload Datasets

The datasets needed for the tutorial are saved at
`data/example/catalog.ttl` from the root of the repository. If Catalog
is running on its default port `7000`, the datasets can be uploaded by
running the following command (shorten it to one line or add `backslash`
on line ends) from the repository root.

```{.bash language="bash"}
curl
  --verbose
  --url "http://localhost:7000/rdf-graph-store?default"
  -X POST
  -T data/example/catalog.ttl
```

Note that one of the datasets is a code list of countries that has
around `2MB` and if the network is slow, it may fail to be fetched and
analyzed due to a timeout. Therefore, if there is a different number of
recommendations related to code lists than in the screenshots during the
tutorial, run the command again. Running the command again makes any
newly created analyses overwrite the ones created in previous runs,
hence; there is no data duplication. If there are still no
recommendations for the countries code list, set
`ANALYZER_GET_DATASET_DATA_TIMEOUT` environment variables to a higher
number than default `5000`. It sets the timeout in milliseconds for the
request fetching dataset data.
