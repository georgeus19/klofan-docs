---
sidebar_position: 5
---

# Adding Recommender

One of the main design goals was to make adding new recommenders
straightforward. A recommender is a server with a single endpoint that
accepts the Editor schema and instances and returns recommendations. In
this subsection we provide instructions how to add a new TypeScript
recommdender. We first describe the project setup, then how a
recommender can be built in code. Lastly, we show what needs to be set
in the system configuration to run the new recommender.

We recommend to use the TypeScript language for implementing new
recommenders since much helper functionality needed by all recommenders
is already provided by the [Recommender library](https://github.com/georgeus19/klofan/tree/main/packages/recommender). Alternatively, it is
possible to create a recommender in any language that implements the
(HTTP) communication between between the recommender and the other
servers it needs to communicate with. This is mainly [Recommender Manager](https://github.com/georgeus19/klofan/tree/main/apps/recommender-manager) that sends requests to recommenders' endpoints to get
recommendations.

## Project Setup

To add a new recommender, we need to create a new project in directory
`apps/recommenders`. The best way is to copy an existing recommender
project and change the project name. If the prefferred option is to
create a project from scratch, there are two things to set up. The
following dependencies in `package.json` are typically necessary for any
recommender.

```json
{
    "dependencies": {
        "@klofan/analyzer": "*",
        "@klofan/config": "*",
        "@klofan/instances": "*",
        "@klofan/transform": "*",
        "@klofan/recommender": "*",
        "@klofan/schema": "*",
        "@klofan/server-utils": "*",
    },
    "devDependencies": {
        "@klofan/typescript-config": "*"
        "typescript": "^5.0.2"
    }
}
```

Packages [`@klofan/instances`](https://github.com/georgeus19/klofan/tree/main/packages/instances), [`@klofan/transform`](https://github.com/georgeus19/klofan/tree/main/packages/transform) and
[`@klofan/schema`](https://github.com/georgeus19/klofan/tree/main/packages/schema) provide functionality for working with Editor data.
Package `@klofan/config` validates configured environment variables and
gives access to them. Package [`@klofan/analyzer`](https://github.com/georgeus19/klofan/tree/main/packages/analyzer) contains analysis
interfaces in case the new recommender is to recommend based on
analyses. Package [`@klofan/recommender`](https://github.com/georgeus19/klofan/tree/main/packages/recommender) provides the recommendation
interface and functionality for building a recommender server. The other
important thing to set up is `tsconfig.json`. An example working setup
is below.

```json
{
    "extends": "@klofan/typescript-config/base.json",
    "compilerOptions": {
        "rootDir": "./src",
        "outDir": "./dist"
    },
    "include": ["src/**/*"]
}
```

## Building Recommender Server

With the project setup, we can build a recommender.
[`@klofan/recommender` package](https://github.com/georgeus19/klofan/tree/main/packages/recommender) provides a function that creates a full
recommender server. There is a mock implementation of a recommender
below. It is only required to retrieve a port and request limit from the
system configuration and implement a function that accepts the editor
schema and instances and returns recommendations.

```typescript
import { runRecommenderServer } from '@klofan/recommender/server';
import { getAnalyses } from '@klofan/recommender/analysis';
import { Analysis } from '@klofan/analyzer/analysis';
import { createLogger } from '@klofan/config/logger';

const logger = createLogger();
const PORT = // <- Configuration
const REQUEST_LIMIT = // <- Configuration

const recommendFunction = async ({
    schema,
    instances,
}): Promise<Recommendation[]> => {
    const analyses: Analysis[] =
    await getAnalyses(['code-list-analysis'], { logger });
    const recommendations: Recommendation[] = // <- schema + instances
    return recommendations;
}

// Run server only if PORT is set
if (PORT) {
    runRecommenderServer(recommendFunction, {
    port: PORT,
    requestLimit: REQUEST_LIMIT,
    logger: logger,
    });
}
```

## Configuration

We now discuss what to add to the system configuration so that the
recommender can be run. A pair of environment variables for the
recommender port and URL must be set. The URL environment serves for
Recommender Manager to know how to send requests to the new
recommender. The URL environment variables must have prefix
`RECOMMENDERS_` and suffix `_URL`. File
`@klofan/config/src/env/server.ts` contains a [Zod](https://zod.dev/) schema
which validates set environment variables. These two new environment
variables must be added to the schema. There are already ports and URLs
for other recommenders; therefore, copy how it is done for one of them.

We also showed that request limit needs to be retrieved from the system
configuration. It is already set under `RECOMMENDER_REQUEST_LIMIT`.

```typescript
import { SERVER_ENV } from '@klofan/config/env/server';

const PORT = SERVER_ENV.RECOMMENDERS_{NEW_RECOMMENDER_NAME}_PORT;
const REQUEST_LIMIT = SERVER_ENV.RECOMMENDER_REQUEST_LIMIT;
```
