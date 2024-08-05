---
sidebar_position: 3
---

# Install

In this section we describe how to get the application running locally. If you are using the live version of the app, you can skip the step and go directly to [Transformation](transformation) section. Note that using the live version may provide a bit different recommended data transformations. The manual part is the same as when using a local version.

There are two steps. We need to install the application itself and then load data based on which recommended transformations are suggested.

## Run Klofan Locally

First, we download the application to `klofan` directory.

```bash
# Either download https://github.com/georgeus19/klofan/archive/refs/heads/main.zip and extract or use the following command.
git clone https://github.com/georgeus19/klofan.git
cd klofan
```

The application can be run using `docker`. We need to copy the configuration file from `klofan/data/example/docker-env` to the `klofan` directory. Then we can use `docker compose` to build and run the application.

```bash
# Run all these commands from `klofan` directory

# Copy configuration for production
#   - must be in `klofan` root directory and named '.docker-env'
cp ./data/example/docker-env ./.docker-env

# Build
sudo docker compose --env-file .docker-env build --no-cache

# Start
sudo docker compose --env-file .docker-env  up
```

Note that the configuration file is passed to `docker compose` and also
MUST be in the root of the repo with name `.docker-env`. Go to `localhost/index.html` to open Editor which should look the same as in the live instance.

## Upload Datasets

The datasets needed for the tutorial are saved at `klofan/data/example/catalog.ttl` or [https://github.com/georgeus19/klofan/blob/main/data/example/catalog.ttl](https://github.com/georgeus19/klofan/blob/main/data/example/catalog.ttl). If the default configuration file is used, the following command can be used to load the datasets to the system.

```bash
# Run from `klofan` directory
curl \
  --verbose \
  --url "http://localhost:7000/rdf-graph-store?default" \
  -X POST \
  -T data/example/catalog.ttl
```

Note that one of the datasets is a code list of countries that has around `2MB` and if the network is slow, it may fail to be fetched and analyzed due to a timeout. Therefore, if there is a different number of recommendations related to code lists than in the screenshots during the tutorial, run the command again. Running the command again makes any newly created analyses overwrite the ones created in previous runs, hence; there is no data duplication. If there are still no recommendations for the countries code list, set `ANALYZER_GET_DATASET_DATA_TIMEOUT` in the configuration file to a higher number than default `5000`. It sets the timeout in milliseconds for the request fetching dataset data.
