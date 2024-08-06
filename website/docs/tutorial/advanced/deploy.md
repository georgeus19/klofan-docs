---
sidebar_position: 3
---

# Deployment

In this section, we discuss the development and production deployment.
We first need to describe the configuration of the system. Then we
discuss the production deployment and development deployment.

## Configuration

The runtime configuration of the system is done using environment
variables. The list of used environment variables can be found in
`data/example/dev-env` for the development configuration and in
`data/example/docker-env` for the production configuration. These files
can be used as they are without any further configuration needed.

We still provide an overview of the environment variables for a possible
customization. The environment variables can be split into three groups

-   general, analyzer and recommender environment variables.

### General Environment Variables

Environment variables in the general group define ports and URLs of all
databases and apps apart from analyzer and recommenders. Note that the
port must match the port in the corresponding URL. It also possible to
set size request limits for individual apps. The probably three most
configurable environment variables are the following.

```bash
# Timeout for fetching dataset data in milliseconds
ANALYZER_GET_DATASET_DATA_TIMEOUT=5000
# Timout for sending notifications in milliseconds
# Value 0 means no timeout
NOTIFICATION_TIMEOUT=0
# Base when creating IRIs e.g. for provenance activity
BASE_IRI=http://example.com/
```

### Analyzer Environment Variables

This group of environment variables specifies analyzer ports and
analysis job queue names. The queue environment variable name must have
prefix `ANALYZERS_` and suffix `_QUEUE`. By using this pattern Analyzer
Manager knows the names of the queues to send analysis jobs to.

### Recommender Environment Variables

This group of environment variables specifies recommender ports and
URLs. The port and the port in the corresponding URL must be the same.
The URL environment variable name must have prefix `RECOMMENDERS_` and
suffix `_URL`. By using this pattern Recommender Manager knows URLs of
recommenders to which they forward recommendation requests.

## Production

There is a docker compose file `compose.yaml` in the root of the
repository. It contains all required databases and apps defined as
services. The data of each database are persisted as a docker volume
defined in its compose file in `databases/{db}/compose.yaml`. The
following commands can be executed to run the system.

```bash
# Run all these commands from the repository root

# Copy configuration for production
#   - must be in the root dir and named '.docker-env'
cp ./data/example/docker-env ./.docker-env

# Build images
sudo docker compose --env-file .docker-env build --no-cache

# Run system
sudo docker compose --env-file .docker-env  up
```

Note that the environment file is passed to `docker compose` and also
MUST be in the root of the repo with name `.docker-env`.

### Running New Analyzer

Running a new analyzer in production requires adding a service into the
`compose.yaml` file in the root of the repository.

The service needs to have a port and some additional environment
variables to give to the specified dockerfile. Provide the configured
port environment variable as port and add default port - take the
highest number of analyzer default ports and add one. The additional
environment variables are `APP_PROJECT_NAME` and `APP_DIRECTORY`. Paste
the template below to the `compose.yaml` as a new service and fill out
the squared brackets.

```
{new-analyzer-name}:
    build:
        context: ./
        dockerfile: backend-dockerfile.dockerfile
    restart: always
    environment:
        APP_PROJECT_NAME: {analyzer-project-name}
        APP_DIRECTORY: analyzers/{analyzer-project-directory}
    env_file: .docker-env
    ports:
        - "${{conf-port}:-{inc-port}}:${{conf-port}:-{inc-port}}"
```

### Running New Recommender

Running a new recommender in production requires adding a service to the
`compose.yaml` file in the root of the repository.

This new service must have set exposed port and a few environment
variables for Dockerfile. The template of the service is shown below.
When something is in curly brackets, that means to substitute its value.
`conf-port` means the configured recommender port and `inc-port` is a
default port that must be set as unique among the services. The
convention for the value of the `inc-port` is to take the maximum
default port of recommender services and increment it by one.

```
{new-recommender-name}:
    build:
        context: ./
        dockerfile: backend-dockerfile.dockerfile
    restart: always
    environment:
        APP_PROJECT_NAME: {recommender-project-name}
        APP_DIRECTORY: recommenders/{recommender-project-directory}
    env_file: .docker-env
    ports:
        - "${{conf-port}:-{inc-port}}:${{conf-port}:-{inc-port}}"
```

## Development

The system is run in development using [Turborepo](https://turbo.build/repo) to run
apps and docker compose to run databases. The following commands
describe how to run the system in development.

```bash
# Run all these commands from the repository root

# Copy configuration for development
#   - must be in root dir and named '.env'
cp ./data/example/dev-env ./.env

# Run databases in using docker
sudo docker compose -f db-compose.yaml --env-file .env up

# Wait until databases are running

# Install dependencies
npm ci # or npm install

# Run services in dev mode
npm run dev
```

Note that the environment file is passed to `docker compose` and also
MUST be in the root of the repo with name `.env`.

If new analyzers or recommenders are added, `npm install` must be run
from the repository root to have Turporepo notice the new applications.
It then runs them automatically if their configuration is set correctly.
