---
sidebar_position: 2
---

# Main Components

In this section, we identify the main components of the designed system
based our proposed approach from Analysis. We consider a component to
represent a group of semantically related functionality without
specified runtime allocation.

The proposed approach proposes to create an interactive environment
where a user imports their structured data and lets the user manually or
by using transformation recommendations transform the data represented
in an internal model into a state from which the user can export RDF
representing the data using suitable vocabulary terms. There are two
main components hidden. One is the application providing the environment
that the user interacts with which we identify as the **Editor**
component and the other is a component producing the recommendations
which we consider to be the **Recommendation Provider** component.

When a user imports structured data to **Editor**, Editor transforms the
data into a model representing the RDF representation of the data
containing the aforementioned schema that captures the structure of the
original data and information about the original data. The model also
contains RDF related artifacts such as RDF types or URIs assignable to
the data. The model's design is described in . The user then can
iteratively make transformations of the model such as changing the
structure of the data, changing data values, adding RDF types, assigning
URIs and when they are satisfied, export to the desired RDF. These
transformations can be done manually or by using recommendations that
suggest how to transform the model. The user can investigate the any
recommendation to see what terms it recommends using, its description
and visual changes of the internal model. The user can either apply the
recommendation which means its suggested transformations are done or use
the gathered information from the recommendation and do the changes
manually.

**Recommendation Provider** is responsible for creating transformation
recommendations for the current version of the Editor model. Therefore,
when recommendations are requested, the current Editor data (e.g. the
model or a structure derived from it) must be given to Recommendation
Provider. The component consists of smaller recommenders responsible for
creating recommendations that are based on expert knowledge or on
general-purpose search or recommendation methods. We also mentioned that
each recommender can use external RDF data as a knowledge base to create
recommendations. It can precompute any kind of index from these data to
later use it to create recommendations for the Editor data. To bring
more clarity to what a recommender can be, we define the following types
of recommenders based on what kind of input they use along with
recommender examples.

Editor Data & Expert Knowledge

: This kind of recommender uses only the Editor data and some built-in
expert domain knowledge to create recommendations. We include
example below.

    Suppose that in the imported structured data there is a country
    specific date string such as `"DD.MM.YYYY"` for Czechia which does
    not conform to `xsd:dateTime`. A recommender for czech dates could
    recognize czech date time string and provide recommendations for
    their transformation to a format compatible with `xsd:dateTime`.

    A recommender does not need to work on the level of literal value
    change but can be capable of transforming a part of the Editor data,
    even transforming the structure. Such example can be recommending
    terms from a certain vocabulary as such Food Ontology
    [@food-purl-vocabulary-web] used in the motivating example (). It
    has predicates for nutrient information of a food product (e.g.
    carbohydrates). A recommender then could try to find nutrient
    information strings using simple or advanced text similarity in the
    Editor data and if any part of the data matched, it would provide
    recommendations for transforming that part of data to the Good
    Relations [@gr-vocabulary-web] model that Food Ontology is based on
    for adding quantitative properties along with any nutrition
    predicates from Food Ontology.

    An even more complex example that works on the whole Editor data
    could be a recommender that is capable of detecting statistical data
    and provides recommendation for transforming them to a Data Cube
    [@data-cube-web] model.

Editor Data & RDF Data

: This type of recommender produces recommendations for any Editor
data independently of the data domain using the external RDF data
(e.g. LOD cloud) preprocessed to some kind of index. It can, for
example, be based on a general recommendation or search method
discussed in Analysis (). We again include example below.

    An example of such a recommender is a recommender that preprocesses
    the external RDF data to a full-text index. Then, when it receives
    the Editor data, it finds the best matches between the index and the
    Editor data. It can then recommend to represent the matched Editor
    parts by vocabulary terms used by the matched data from the index.

    Another example is a recommender that when recommendations are
    requested, it uses the LOV [@lov-web] public API to perform search
    for RDF terms in LOV vocabularies based on the received Editor data
    and subsequently creates recommendations based on the top results.

    While these recommenders can change the structure of the Editor
    data, they typically only recommend predicate or type URIs along
    with description of why they are recommended.

Editor Data & RDF Data & Expert Knowledge

: The last type of recommender uses both an index created from
external RDF Data and expert knowledge. We again include examples
below.

    An example of such a recommender is a recommender for code lists.
    There is a code list for currencies published by Publications Europa
    Portal [^1]. If this code list is provided to the code list
    recommender, then it can compare the currency codes from the code
    list to literals in the Editor data when recommendations are
    requested. If there are literals matching codes, the recommender can
    suggest to replace the literals with the well-known URIs of the
    codes.

    Another example is a recommender that saves triple that contain RDFS
    vocabulary terms from any RDF data provided to the recommender. The
    recommender could then compare the Editor data with the saved
    triples and produce recommendations assigning RDF types or property
    URIs to matched parts of the Editor data.

We mention that these recommenders can process external RDF data and
create supporting structures for recommending. It is not clear what
these RDF data are, where they are taken from, how they are processed
and when recommenders have access to them.

One option is that RDF data can be collected by crawling (such as in
Swoogle - - or in Falcons - ) and then provided to all recommenders (of
the second and third type that require external RDF data) either before
the system is live or when the system is running to update their
recommendation data structures. This approach makes us search for the
data to use.

An alternative to this approach is to create a catalog where RDF data
can be uploaded. The catalog would then notify recommenders of new RDF
data. This approach is used in LOV [@lov-web] where they curate the
uploaded vocabularies. Moreover, RDF data can be sent to the catalog in
a standard and efficient way using RDF dataset vocabularies such as DCAT
or VOID. There are many external catalog services that provide dataset
records; therefore, it is a quite elegant way to get inputs to out
system.

If we compare the options in terms of data quality, there are no
guarantees in the case of the crawler unless we explicitly implement
data quality filtering functionality. In the catalog approach the
responsibility for providing high-quality data is on the user uploading
the data to the catalog. Moreover, the quality can be offloaded to the
external catalogs that curate their datasets. Therefore, we can choose
which catalogs we trust to use their data.

Comparing the crawling and catalog approaches in terms of handling data
updates favours the catalog. Again the catalog could rely on the
external catalogs tracking updates or on dataset metadata to check
update dates. Therefore, it would refetch only dataset data for changed
datasets. In the crawling approach, the crawler would need to retrieve
all data again and compare them against the last crawled version (or
just update all system data). We choose the catalog approach for the
aforementioned reasons as well as it being less complex solution in
terms of implementation. Since the Recommendation Provider would have
many responsibilities, we define a component **Catalog** that is
responsible for managing datasets. If a dataset is uploaded, it stores
it and notifies all recommenders that there is a new dataset they can
process.

Each defined recommender (and thus Recommendation Provider) recommending
based on external RDF data still does two tasks - process external RDF
(dataset data) to create internal structures for recommending and
provide recommendation based on the Editor data. If these tasks are
combined in one component, then the produced internal structure is
likely to be heavily optimized for the recommendation task. However,
splitting each task into a component forces the RDF processing task to
create a well-defined structure that can be reused by other
recommenders.

Therefore, we replace Recommendation Provider from the main components
by a group of **Recommender** components and a group of **Analyzer**
components. Analyzer performs the processing of datasets producing
analysis (i.e. the originally called internal structures). The analysis
are well-defined and not tightly connected to a recommender. Recommender
does the recommending task. We prefer to call them a group of components
instead of creating one component for the whole group since we then can
reason based on the individual Recommenders and Analyzers.

Recommender can be dependent on analysis of one and more Analyzers. This
solution is also more flexible, since new Analyzers can be added using
some already existing analysis definition to seamless make its analysis
usable in Recommenders using the analysis definition. And new
Recommender can be added and use already defined Analyzers and analyses
created by them.
