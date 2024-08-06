---
sidebar_position: 3
---

# Architecture

In this section we design the architecture of the system based on the
identified main components. We first specify the goals based on which we
evaluate any proposed architectures. Then we explore iteratively various
simplified architectures and arrive at the one fitting the requirements
the most. We subsequently take the chosen simplified architecture and
remove simplifications to derive the final architecture based on which
the system is implemented. The simplifications typically concern
communication between one and more components or communication with
databases whose exact description would unnecessarily complicate the
idea of the simplified architectures.

We model all architectures in the [C4 model](https://c4model.com/). The
terminology is slightly different from other models. Components are
static blocks of related functionality encapsulated by a well-defined
interface. Containers are runtime deployable units that execute codes or
store data. Containers typically consist of components.

Note that when we mention the term **dataset** in the following
sections, we mean a DCAT dataset not the actual data which would be a
distribution in the DCAT terminology.

## Architecture Design Goals

We develop the simplified architectures based on the four main defined
components. Editor lets users interactively transform structured data to
RDF and requests recommendations from Recommenders. Recommender takes
the Editor data as an input, optionally fetches any required analyses
from Analyzers and produces recommendations. Analyzers create analyses
based on RDF data inserted into Catalog in the form of DCAT datasets.
Note that terms Recommenders and Analyzers mean the groups of all
Recommender or Analyzer components.

The goal is to find an simplified architecture that supports the
following.

-   Adding new Recommender or Analyzer is possible and fairly easy.

-   Multiple Recommenders can use analyses of multiple Analyzers.

-   While Recommenders are closely knit to Editor and its data format,
    analyzers analyze any RDF data to infer knowledge that may be useful
    in other applications. Therefore, a minor goal is to be able to
    reuse analyzers in different contexts.

-   Very subjective implementation simplicity.

## Catalog Monolith With RDF Triplestore Architecture

Perhaps the simplest architecture is to group the main components in a
single container and have only one store for all kinds of data. The
architecture in the picture below groups Catalog, Analyzers and Recommenders into a single
container named Catalog whose main function is to let administrators
upload datasets for analysis and provide recommendations for Editor. Any
data used by Catalog is stored in a RDF triplestore.

![Catalog Monolith Container View](/img/concepts/monolith-container-view.png)

Having the three main components in one container does not mean that the
respective functionality is interlinked in a black box. Instead, the
Catalog container contains Dataset Manager, Analyzers and Recommenders
components as shown in the picture below. Dataset Manager receives any uploaded dataset
by a user, retrieves its data and saves both in the triplestore.
Afterwards, it notifies Analyzers that new data were uploaded, where
they are in the triplestore (e.g. identified by graph URIs) and that
they are ready to be analyzed. Each Analyzer then accesses the uploaded
data in the triplestore and performs analysis whose results (i.e.
analyses) the Analyzer saves in the triplestore as well. While all these
different kinds of data (datasets, their data, analyses) are saved in
different RDF graphs, they contain links among them. For example, an
analysis can have a link to the data created from or the dataset it is
meant for.

Recommender components are responsible for providing recommendations to
Editor. Each Recommender takes the Editor data as input, optionally
fetches analyses from the triplestore and produces recommendations as
output.

![Catalog Monolith Component View](/img/concepts/monolith-component-view.png)

### Architecture Evaluation

We first consider the single storage being a RDF triplestore and then
the monolithic nature of the architecture. The RDF graph model in a
triplestore is quite powerful for representing any kind of information.
Each analyzer can choose an arbitrary graph structure of analyses it
produces and can link and reuse original data instead of having to store
them which would be necessary if another database type such as a
relational database was used to store analyses. Moreover, graph
databases can store the data close to conceptual reality as opposed to
other types of databases which can restrict the structure of the data
such as to relational tables. Since analyses are in the RDF database, a
recommender can write SPARQL queries to access multiple types of
analyses and convert them to its desired output even in the query.

While relying heavily on RDF is highly flexible, adding a new analyzer
or recommender requires knowing SPARQL and writing non-trivial SPARQL
queries. Based on personal experience, the result of SPARQL - bindings
or triples - also requires some grouping and merging work to convert it
into a suitable structure usable from code in comparison to retrieving
simple JSON documents from a document database. Therefore, the
complexity is shifted onto the programmers of analyzers and recommenders
making adding new analyzers or recommenders difficult.

Another problem with the single triplestore is that any dataset data or
analyses must be in RDF. In the presented workflow, we cannot consume
non-RDF datasets. Furthermore, if we want to recommend using a full text
search or using the discussed TermPicker (), we would need to somehow
fit their recommendation support structures (i.e. analyses) in RDF or
add data stores in a custom way not represented in the architecture.

For these reasons we might want to split the catalog storage and
analysis storage which we consider in the next presented architecture.

Now we consider the catalog monolith and how it fits out predetermined
goals. There the main advantages lies in its (runtime) simplicity and
deployment. The main disadvantage of the approach is that a new analyzer
or recommender must be statically included. Therefore, it must be
implemented in the same language as the rest of the code or use language
bindings which increases the difficulty of adding new analyzers or
recommenders. Moreover, reusing analyzers and their analyses is not
readily possible apart from including and referencing the Analyzer
components in code.

Hence, we shift to more runtime architecture approaches.

## Recommender Container Architecture

This architecture is based on the proposed architecture changes for the
monolithic architecture. The previous Catalog monolith container is
split into new containers - Catalog container and a group of Recommender
containers. Since we found having a single RDF triplestore non-optimal,
we consider a triplestore only for datasets and separate stores for
analyses. This architecture is shown in the picture below. Catalog provides API for
uploading datasets which are forwarded to each Recommender container and
saved in Dataset Triplestore. A Recommender container fetches dataset
data and analyses them. Created analyses are saved in Recommendation
Analyses Store. Not to lose track of which analysis was created for
which dataset, provenance about each analysis such as who created it and
where it is located is sent back to Catalog.

![Recommender Architecture Container View](/img/concepts/recommenders-container-view.png)

Similarly to before, Editor requests recommendations from Recommender
containers which use Recommendation Analyses Store containers to get
analyses. There is a group of containers for analyses stores since each
Recommender might have different requirements for storing analyses.
While most could be satisfied with a key value store or a document
store, there may be a need to store data, for example, in an information
retrieval system.

Since a Recommender container has both analyze and recommend
responsibilities, it consists of Analyzer and Recommender component
which handle their corresponding responsibilities (see the picture below).

![Recommender Component View](/img/concepts/recommenders-component-view.png)

### Architecture Evaluation

We evaluate the presented architecture. Let us reiterate the main issues
identified in Catalog Monolith Architecture. We could not add an
analyzer or a recommender in a language independent way and all analyses
were required to be stored in RDF. That also implied that each
recommender retrieving analyses would have to retrieve the analyses from
the triplestore typically using SPARQL and do some processing of the
query results to get a structure suitable for doing the actual
recommending. Despite the approach being flexible and powerful, we opt
to make implementing new analyzers and recommenders simple.

These issues are now resolved. A new analyzer or recommender can be
added implemented in any language added as a runtime container. Analyses
also do not have to be stored in RDF and an analyzer creator can choose
to store analyses in existing stores or add a new analysis store.

Another benefit is that the cataloging functionality is in a runtime
container designed for cataloging datasets which makes it simpler to
understand and implement. Moreover, the cataloging part can be replaced
by connecting an existing external catalog application to the
Recommender containers. Or there does not even have to be a catalog to
begin with and the administrator can directly send datasets to
Recommender containers to get analyses for them. However, the entire
Recommender containers would have to be taken for such use cases which
might be inelegant if the main focus is to get analyses to be used in
different contexts.

Even if no such reuses were considered, coupling both analyzer and
recommender functionality in one container is a bit incomprehensible
when adding either a recommender or an analyzer. For example, there can
be an already mentioned recommender for recommending converting dates in
czech format to a `xsd:dateTime` compatible format. This recommender
does not require any analysis or analyzer implementation. Should the
resulting container have an analyzer producing always no analyses?

What about implementing an analyzer for multiple recommenders? Should
there be a Recommender container with an empty recommender that does
nothing? Should the analyzer be coupled to one recommender that uses the
analyzer's analyses? In that case the other recommenders using the same
analyses would be tied indirectly to the recommender as well.

While at least partial answers to these questions can be found on a
technical level by, for example, providing guidelines how such things
should be done, they cannot be reflected in the proposed architecture.
We want to solve this issue on an architectural level; therefore, we
discuss one last architecture where no such problem occurs.

## Analyzer Container Architecture

In this architecture we build on top of Recommender Container
Architecture and resolve its discussed problem of coupling analyzer and
recommender functionality together in one runtime container. Therefore,
we have a group of Analyzer containers which perform analyses and save
them in Analyses Stores as well as a group of Recommender containers
which can retrieve said analysis from the stores and provide
recommendations for Editor. This architecture is shown in the picture below. The rest is
the same as before in Recommender Container Architecture; hence, we skip
further description.

![Analyzer Architecture Container View](/img/concepts/analyzers-container-view.png)

We now evaluate the architecture in terms of our given goals to make
sure there are no major issues. New analyzers and recommenders can be
added by adding a runtime container implementing analyzer or recommender
well-defined API using a language of preference. It is clear that adding
only an analyzer or recommender is supported. Recommenders are not
coupled to analyzers but rather to their specified types of analyses;
therefore, they can use the analyses of multiple analyzers of their
choice. Moreover, since analyzers are completely split off of Editor and
are standalone containers, they can be reused in different contexts.
This flexibility adds, however, some runtime complexity in terms of
communication and deployment.

To sum up, this architecture supports the main defined goals with the
trade-off of having increased runtime complexity in comparison to the
architectures discussed before.

## Final Architecture

In this subsection, we derive the final architecture of the system. All of
the previous architectures were focused on how to represent the main
components and on the high-level communication among them. While
drafting architectures on such a level is useful for presenting the main
ideas, the drafts are too high-level to present the complete picture
from which the system can be implemented. Therefore, we delve deeper and
arrive at the final architecture based on which we implemented our
system.

We first identify the vague places in Analyzer Container Architecture,
where more detail is necessary to describe how it should work without
relying on ambiguous simplifications, and propose our solutions. Then we
showcase the whole architecture.

### Communication between Catalog and Analyzers

In Analyzer Container Architecture, Catalog sends datasets to Analyzers
in order to get dataset analyses. It is not clear how exactly the
communication happens. Based on the brief explanation it seems the
Catalog must know of all Analyzers and send a request to each. However,
knowing the addresses of Analyzers and handling communication with all
of them should not be Catalog's responsibility. Therefore, we introduce
a container named Analyzer Manager with such responsibility. It provides
an endpoint that accepts datasets and on accepting its requests, the
manager sends the datasets to all Analyzers. Catalog then only needs to
send datasets to Analyzer Manager.

Each analyzer can run analysis of a dataset for a significant amount of
time. Moreover, requesting analyses of many datasets at once (such as
uploading a large DCAT catalog) can throttle the performance and memory
consumption. Therefore, there is a queue for each Analyzer from which
the Analyzer retrieves datasets to analyze. An item in such a queue is
called an analysis job and it contains one dataset among other things
discussed later.

One question still remains. How does Analyzer Manager keep track of
available Analyzers? There are dynamic and static solutions. An example
of a dynamic solution is to have Analyzers register to Analyzer Manager
at runtime. An example of a static solution is to have analyzer queue
locations be a part of the configuration of Analyzer Manager. We choose
the static configuration approach for the sake of simplicity.

### Sending Analysis Provenance

In Analyzer Container Architecture, we mentioned that each Analyzer
container sends analysis provenance to Catalog. The provenance includes
information about the analyzed dataset, the analysis creator or the URI
of the analysis for retrieving it. It can be sent to Catalog when
Analyzer has analyzed a dataset and stored it. Since each analyzer can
run for long time and we employ queues to submit datasets to analyze,
the provenance information cannot be sent as a response to Catalog
sending datasets to analyze.

Hence, analyzer sends provenance to Catalog in a separate request after
creating analysis. We could include the Catalog address in configuration
and hardcode sending provenance. However, there may be another pieces of
information that analyzer can send to not only Catalog. For example, if
Catalog does not receive any analysis provenance for a dataset, it can
be due to various reasons. Either the dataset contains no suitable data
for analysis or the analyzer crashed and subsequently a potential
analysis was lost. Or we could send information about when analysis of a
dataset was started.

Therefore, we consider the notion of sending general notifications.
Catalog can pass a list of notification requirements along with datasets
to Analyzer Manager. An example of such a requirement could be that
Catalog wants to receive provenance in [PROV Ontology](https://www.w3.org/TR/prov-o/) when
analysis is done. Each such requirement must contain the address of the
target and when the notification should be sent. These requirements are
passed to the analyzer queue along with datasets. Then, when an analyzer
is done, it reads the requirements and sends `analysis done`
notifications.

### Communication between Editor and Recommenders

Editor requests recommendations from multiple Recommenders; therefore,
it needs to know their locations. This is a similar problem as sending
datasets to multiple Analyzers and we employ a similar solution. We
create a container Recommender Manager whose responsibility is to keep
track of Recommenders and provide an endpoint for requesting
recommendations from all Recommenders. Recommender addresses are a part
of the manager configuration similarly to how analyzer queues are part
of the configuration of Analyzer Manager. No queues are used in this
case since recommendations are demanded from user and should be provided
as soon as possible. To summarize, Editor needs to only communicate with
Recommender Manager to get recommendations from all Recommenders.

### Storing and Retrieving Analyses

In Analyzer Container Architecture, each Analyzer stored its analyses in
a analysis database of its choice and each Recommender requiring
analyses retrieved them from the databases. Instead of requiring each
Analyzer and Recommender to access databases directly using special
clients and know where each analysis should be stored, we add a
container Analyses Store that is responsible for storing analyses and
retrieving them as well as providing standard HTTP endpoints for these
operations. In background, it can manage multiple databases no one else
has access to. At the cost of more runtime complexity this solution
ensures that adding analyzers and recommenders means focusing largely on
their main responsibility and not having to resolve implementation
details related to storing analyses.

The only exception is when the essence of an analyzer or a recommender
is dependent on a external system such as recommending based on
full-text search using an information retrieval system such as [Elasticsearch](https://www.elastic.co/elasticsearch). However, analyses from such an
analyzer are still always sent to Analyses Store describing, for
example, the full-text index name that a recommender should use.

### Architecture Presentation

Having discussed the vague parts of Analyzer Container Architecture, we
present the final architecture. We take the introduced containers from
this subsection and include them in Analyzer Container Architecture to
provide a clear summary of the architecture. No new containers or
concepts are added.

![Final Architecture of the System](/img/concepts/final-architecture.png)

The architecture is shown in the picture above. There are two main workflows - uploading
datasets to Catalog in order to analyze them and requesting
recommendations from Editor. A system administrator uploads DCAT
datasets to Catalog which stores them and sends them to Analyzer
Manager. Notification requirements for sending analysis provenance to
Catalog are sent along with the datasets. Analyzer Manager then parses
and validates the request and all datasets are subsequently added to all
analyzer queues named Analysis Job Queues in the figure. Afterwards,
Analyzer Manager immediately sends response to Catalog that datasets
were submitted for analysis.

Each Analyzer then retrieves and analyzes datasets from its
corresponding queue. It saves any resulting analyses by sending them to
Analyses Store which stores them in a persistent storage. Once the
analyses are stored, the Analyzer sends their provenance based on
received notification requirements.

The other workflow starts with User requesting recommendations via
Editor. Editor sends a request to Recommender Manager which in turn
requests recommendations from all Recommenders in its configuration.
Recommenders can get analyses from Analyses Store and return
recommendations in response to Recommendation Manager which groups all
recommendations and subsequently returns them to Editor.
