---
sidebar_position: 4
---

# Adding Analyzer

One of the main design goals was to make adding new analyzers
straightforward. In this subsection, we provide instructions how to add a new
TypeScript analyzer. We first describe the project setup, then how an
analyzer can be built in code. Lastly, we show what needs to be set in
the system configuration to run the new analyzer.

We recommend to use the TypeScript language for implementing new
analyzers since much helper functionality needed by all analyzers is
already provided by [Analyzer library](https://github.com/georgeus19/klofan/tree/main/packages/analyzer). Alternatively, it is possible
to create an analyzer in any language that implements consumption of a
Redis queue and the (HTTP) communication between the analyzer and the
other servers it has to communicate with. That mainly includes
communication with [Analysis Store](https://github.com/georgeus19/klofan/tree/main/apps/analysis-store) and sending analysis provenance.

## Project Setup

We need to create a new project in directory `apps/analyzers`. The best
way is to copy one of the existing projects and change the project name.
If that is not desired, there are three main things to set up. We need
the following dependencies in `package.json`.

```json
{
    "dependencies": {
        "@klofan/analyzer": "*",
        "@klofan/config": "*"
    },
    "devDependencies": {
        "@klofan/typescript-config": "*",
        "typescript": "^5.0.2"
    }
}
```

Package [`@klofan/analyzer`](https://github.com/georgeus19/klofan/tree/main/packages/analyzer) contains analysis definition and
functionality for building an analyzer server. Package `@klofan/config`
provides checking that environment variables are correctly specified and
access to them. Package `@klofan/typescript-config` contains TypeScript
configuration to reference in `tsconfig.json` such as below.

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

## Building Analyzer Server

With the new project set up, we start building the analyzer. We use the
described function from Analyzer library in that creates a full analyzer
server. We can see a mock implementation of an analyzer below. It is
only required to retrieve a queue name and a port from the system
configuration and then to implement a function that accepts a DCAT
dataset and produces internal analyses. An internal analysis differs
from the standardly used term analysis in that it is not required to
assign ID to the returned analysis or its provenance which is done for
us by the `runAnalyzerServer` function.

```typescript
    import { DcatDataset,fetchRdfData } from '@klofan/analyzer/dataset';
    import { runAnalyzerServer } from '@klofan/analyzer/communication';
    import { createLogger } from '@klofan/config/logger';
    import { Quad } from '@rdfjs/types';

    const logger = createLogger();
    const QUEUE_NAME = // <- Configuration
    const PORT = // <- Configuration

    const analyzeFunction =
      async (dataset: DcatDataset): Promise<InternalAnalysis[]> => {
        const quads: Quad[] = await fetchRdfData(dataset);
        const analyses: InternalAnalysis[] = // <- Quads
        return analyses;
    }

    // Run server only if QUEUE_NAME is set.
    if (QUEUE_NAME) {
      runAnalyzerServer(analyzeFunction, {
        port: PORT,
        jobQueue: QUEUE_NAME,
        analyzerIri: 'http://example.com/analyzer',
        logger: logger,
      });
    }
```

Note that although an analyzer does not need to be a server,
`runAnalyzerServer` for convenience creates additionaly a simple HTTP
server with a single endpoint that accepts datasets and returns analyses
using the provided `analyzeFunction`.

## Configuration

We now discuss what to add to the system configuration so that the
analyzer can be run. A pair of environment variables for the analyzer
queue and port must be set. The queue environment variable must have
prefix `ANALYZERS_` and suffix `_QUEUE`. File
`@klofan/config/src/env/server.ts` contains a [Zod](https://zod.dev/) schema for
the valid environment variables. The new variables must be added - copy
and rename how it is done for a different analyzer.

The environment variables can then be retrieved the following way and
plugged in the code shown above.

```typescript
import { SERVER_ENV } from '@klofan/config/env/server';

const QUEUE_NAME = SERVER_ENV.ANALYZERS_{NEW_ANALYZER_NAME}_QUEUE
const PORT = SERVER_ENV.ANALYZERS_{NEW_ANALYZER_NAME}_PORT
```
