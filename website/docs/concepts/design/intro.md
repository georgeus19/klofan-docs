---
sidebar_position: 1
---

# Intro

In this series of sections, we divulge the main reasoning behind the klofan system. That includes listing the main components and their functions, the architecture of the whole system and the representation of data inside Editor. It may a useful starting point when you want to contribute to the code.

Before we can design anything, we need to define what our system should be. We start by pointing out a few current challenges that one encounters when they want to represent structured data to RDF. Then, we provide the idea of what the system should do based on the challenges defined. The original full analysis and full design chapters can be found in the thesis text available from our github.

## Challenge One - No Single System for Transforming and Recommending

Consider a user with some structured data which they want to transform
to RDF. If they know what vocabulary to represent the data in, they can
use interactive [Karma](https://usc-isi-i2.github.io/karma/) software or any other
transformation tool to perform the transformation. However, when the
user does not know a target vocabulary, there is no tool which the user
could load the data into and it would recommend relevant target
vocabularies (or their terms).

While both Karma and [Silk](http://silkframework.org/) provide term
recommendations when transforming the structured data, they only do so
from known vocabularies provided to the programs by the user. Other
described transformation tools are focused on completely manual
transformation without taking account of vocabularies.

In contrast, using vocabulary search tools such as [LOV](https://lov.linkeddata.es/dataset/lov/) or
[BioPortal](https://bioportal.bioontology.org/) web applications requires the
user to create keyword queries based on the input data. While these
tools curate the vocabularies and provide advanced search capabilities,
they are not capable of search based on structured data nor provide
transformations based on search results.

Moreover, sometimes using standard web search engine such as Google is
required to find the most relevant vocabulary.

### Our System for Transforming and Recommending

To summarize, such user always needs to shift between a place where they
search for vocabularies and a place where they transform. Therefore, we
aim to provide a system which is capable of both recommending
vocabularies based on structured data and data transformation.

In addition, while recommending vocabularies and their terms by itself
is useful and letting the user transform data manually, we consider a
vocabulary recommendation to also propose a way how transform the
current version of data and execute the transformation on user accepting
it.

Rather than focusing on creating a recommendation which is capable of
transforming the whole data to the target vocabulary and which might not
be even feasible, we focus on smaller or even unit recommendations
considering only a part of the data. For example, we mean a
recommendation which recommends to set the URI of a property in the
source structured data to a vocabulary property.

![Transform Workflow](/img/concepts/editor-workflow.png)

The whole process of data transformation is meant to be semi-automatic
and user guided. The workflow of the proposed system is shown in the picture above. The
user loads structured data based on which a model is inferred that
represents the RDF representation of the loaded data. The model contains
a schema capturing the structure of the loaded data which is presented
to the user. The system creates recommendations suggesting
transformations of the model such as recommending to use vocabulary
terms in a part of the model but it can even suggest structural changes
along with vocabulary terms. The user then interactively updates the
model until they are satisfied and export the desired representation of
the loaded structured data to RDF. The user can either update the model
manually or use the recommendations which are capable of automatically
transforming the model. The user can also just investigate the
recommendations for recommended and related terms and decide to add the
terms manually.

Compared to Karma where the structure of the initial input data is not
considered for the initial model, we make the assumption that the
original data are represented in a conceptual structure mirroring to
some extent the real world. For example, we suppose that an object in
JSON represents a concept and its JSON properties also relate to the
concept. Therefore, the model contains a schema accounting of the
structure of the data.

## Challenge Two - Many Recommended Terms

Consider a user in a process of transforming structured data to RDF and
one of available search methods such as LOV or TermPicker return matched vocabulary terms
to represent a part of their data. All of these methods are general and
can be used on any data. However, the discussed methods typically match
many results which are ranked using a collection of general purpose
metrics such as term popularity. Therefore, even terms that are ranked
at the top might not be the most relevant out of the matched results and
a result investigation as well as result browsing is often necessary.

While this by itself might not be an issue when performing one search
with a specific keyword, recommending based on input data using possibly
many keywords searches would result in even more matched results. It
seems infeasible and inconvenient for the user to have to browse through
many term options.

### Recommending More Than Vocabulary Terms

Furthermore, the discussed vocabulary recommendation methods and tools
(Karma, TermPicker, LOV, BioPortal) recommend only
strict vocabulary terms defined by RDFS or OWL or a similar ontology
definition vocabulary. However, recommending other terms for the
representation of data is also important. For example, the data can contain a literal reference "United States". One possible recommendation is to replace
the literal with a code list value from [European Data Portal](https://data.europa.eu/en). Another use case is linking to [DBpedia](https://www.dbpedia.org/) resources representing real world entities. Not only do
we want to support recommending from code lists or DBpedia but also from
all possible such sources.

### Expert recommending

Instead of primarily using general recommendation methods generating
many recommendations, we propose to recommend based on many small
recommenders specific to a certain domain using expert domain knowledge
to provide term recommendations. Each recommender recognizes whether it
can recommend something from its domain and if not, it outputs nothing.
Therefore, such recommenders only produce results if they are fairly
certain that the input data are relevant to their domain. Each
recommender also has access to RDF data (e.g. LOD cloud) in
preprocessing to extract whatever necessary data it needs.

This way of recommending also alleviates the other issue of recommending
only strict vocabulary terms. For example, there can be an expert
recommender for code lists which searched the whole LOD cloud for code
lists and recommends their values. The recommenders can even use the
general search methods and quickly limit the results based on their
expert domain knowledge.

Obviously, this approach to recommending is only useful if there are
recommenders of high-quality for the domains of the imported user data.
Therefore, it is necessary to design a solution which enables adding new
recommenders to the system easily.

## Challenge Three - No System for Multiple Methods

Lastly, paper recommendation methods are usually implemented for
the evaluation of the said methods but not released with enough
documentation or maintained. Some prominent examples which are
maintained are [LOV](https://lov.linkeddata.es/dataset/lov/), [Karma](https://usc-isi-i2.github.io/karma/), [Silk](http://silkframework.org/) or
[BioPortal](https://bioportal.bioontology.org/). But even then, they implement their method
and do not take account of other methods whose implementation could make
their service better.

Although we preferred to use the expert recommendation idea to these
general methods in the challenge two section, we do not dismiss their
value. Therefore, we expect the system to have support for adding such
general purpose methods for both a recommendation improvement and a
method comparison. This goes in hand with expert recommendations which
are small self-contained recommendation methods.

## Summary

We stated three challenges related to transforming structured data to
RDF and our ideas for solving them. In this subsection we merge the
presented ideas to provide a summary of our approach based on which we
can design our system in the following chapter.

We start by summarizing. We propose to provide an interactive
environment (i.e. system) which a user can use to transform structured
data to RDF semi-automatically. The environment lets user import
structured data based on which their model representing their RDF
representation is inferred. The model contains a schema capturing the
structure of the imported data as well as the underlying imported data
values that the user can browse. The model can be exported to RDF. The
user can manipulate the schema (i.e. the structure) and add RDF
artifacts (such as RDF types, resource and property URIs) to influence
how the data should be represented in exported RDF. This can either be
done manually or by using transformation recommendations. These
recommendations suggest how the parts of the model should be represented
in RDF. They can be used for automatically transforming the model based
on the suggestions or for searching for fitting vocabulary terms which
the user can then use manually. The workflow is captured in the picture above in challenge one subsection.

How exactly recommendations work is discussed in challenge two subsection. Recommendations are
generated by recommenders having some built-in expert domain knowledge
they use to produce recommendations for the specific domains. The
recommenders have access to the imported data as well as external RDF
data serving as a knowledge base (e.g. LOD cloud). The recommenders only
produce recommendations for the domain and if the imported data are
outside it, they produce nothing. Also, it is important that new
recommenders can be added fairly easily since they are typically small
and domain focused.

The last challenge subsection then specifies that we want our system to support creating
recommendations based on general purpose search or recommendation
methods.

We identify the main functional components and design the system
architecture based on the described approach. We iteratively analyze and design the system. Both the architectural and
data representation sections introduce the requirements based on which
the architecture or data representation are designed. These requirements
are typically influenced by some design decisions made in the previous
sections; therefore, we do not employ the classical approach
of defining all system requirements beforehand.
