---
sidebar_position: 4
---

# Structured Data Representation

In this section, we discuss how to represent input structured data by a
model which would represent their RDF representation. We first define
what we consider the structured data to be. Then we list requirements
based on which we design the model. Then we follow with the design of
the model. Then we split the model functionality into static components
and present the component view.

## Structured Data Definition

We already mentioned that we help a user transform structured data to
RDF. However, we did not define what exactly we consider the structured
data to be. Knowing exactly what we aim to support is crucial when
designing its representation that is used throughout the system.
Therefore, we explicitly state what the structured data mean in the
context of our application.

Simply said, we consider anything that can be converted to one or more
JSON files structured data that can be loaded to Editor and transformed
to RDF. That means hierarchical data consisting of arrays, objects with
properties and literals. The common formats such as XML, CSV or JSON are
the target. Graph data would have to be split into blocks of
hierarchical data and loaded by itself and subsequently joined in Editor
by for example using a join mapping.

## Representation Requirements

We present the requirements that we have for the representation of the
input data (i.e. model). Based on the discussed architecture the data are used
in Editor and Recommender containers. Editor is meant to be a JavaScript
frontend application.

-   The model captures the structure of the input data in a schema so
    that the user can view the structure and make structural changes on
    all underlying data.

-   The model supports adding and manipulating resource URIs, RDF types,
    language tags or data types to literals.

-   The model supports structural changes and value changes.

-   The model can be stored as a state in Editor.

-   The model must be serializable and deserializable or convertable to
    such a data structure since it is sent between Editor and
    Recommenders when recommendation are requested.

-   The user can interactively change the model; therefore, support an
    efficient integration with history (undo/redo) functionality.

-   Transformation of large data to RDF must be supported. For example,
    large data that would be unwieldy to work with due to them
    overflowing memory and slowing performance.

## Representation Model Design

In this subsection, we design the model based on the specified
requirements.

Since the input data can be quite large and might no fit in memory or at
least significantly slow performance, we split the model into two parts

-   schema and instances (of the schema). Schema represents the structure
    of the input data without any raw data values while instances represent
    the raw data. Therefore, schema is small and can always be kept in
    memory. It can be always presented to the Editor user in full to let
    them browse and change data structure. Instances (of schema) represent
    the potentially large data structure with data values that does not
    necessarily need to be kept in memory and is materialized on demand.

We continue with the design of schema and of instances separately.

### Schema

Schema captures the schema of the structure of the input data. We
mentioned that the input data consists of arrays, objects with
properties and literals. If there are no arrays, we deem that the schema
representing the structure of the data should structurally mirror the
data. If there are arrays, consider the example below. There is a root
object with property `products` targeting an array of objects. These
objects then represent food products and they can have different
properties such as the latter having property `vegan`. Note that the
there are also different properties in objects targeted by properties
`nutriments`. If schemas were created for the product objects in the
array, they would be different. The former would contain
`carbohyrates_100g` in `nutriments` while the latter `energykcal_100g`
in `nutriments`.

```json
{
    "products": [
        {
            "product_name": "Thai peanut noodle",
            "countries": "United States",
            "nutriments": { "carbohydrates_100g": 71.15 }
        },
        {
            "product_name": "Pasta",
            "countries": ["United States", "Canada"],
            "vegan": true,
            "nutriments": { "energykcal_100g": 300.0 }
        }
    ]
}
```

We define the schema of the array to be a schema created by merging the
schemas of all array elements by including all of their objects and
properties. The schema of the example data could have the following
structure. `<Literal>` term represents that there are only literals in
the corresponding position in the underlying data.

```json
    {
      "products": {
        "product_name": <LITERAL>,
        "countries": <LITERAL>,
        "vegan": <LITERAL>,
        "nutriments": {
          "carbohydrates_100g": <LITERAL>,
          "energykcal_100g": <LITERAL>
        }
      }
    }
```

The schema consists of three different elements - objects, properties
and literals. We define Entity Set to be an object in such a schema. It
conceptually represents a set of objects in the input data at the same
position as it is in the schema. Such objects are then named Entities.
We define Literal Set to be represent a place of `<Literal>` in the
schema which represents the set of literals at the corresponding
position in the data. Lastly, we define Property Set corresponding to a
property in the schema which represents the set of properties at the
corresponding position in the data.

This presented schema structure can be encoded in multiple ways. We
discuss these ways with respect to the requirements above. A
straightforward solution is to represent exactly as it is shown above by
having a tree of objects representing entity sets where its properties
are property sets. This representation, however, does not allow storing
anything else in the objects outside the structure of the data.

If the model is to be converted to RDF, it needs to support adding URIs
to data objects and properties, assigning RDF types to objects, adding
language tags or types to literals. While the schema is not suitable for
storing individual entity URIs, language tags or data types, it is the
place to set something for all underlying entities of entity sets or
properties of property sets. All such entities might share the same RDF
types and all such properties might share URIs. Therefore, the
straightforward representation is not suitable.

To solve this issue, we create explicit interfaces for the schema
elements as shown below. All of the elements contain id to be
referencable. As we discussed, it is possible to set URIs for all
properties of a property set and types for all entities of an entity
set.

```typescript
interface EntitySet {
    id: string;
    types: string[];
    properties: PropertySet[];
}
interface LiteralSet {
    id: string;
}
interface PropertySet {
    id: string;
    uri?: string;
    value: EntitySet | LiteralSet;
}
```

This representation of a data schema suffers, however, when something,
for example, a property set URI of property set `A` is changed. If we
want to keep versions of the schema for undo and redo operations as we
mention in the requirements, then we have to store a copy of the schema
and then update the URI in `A` in case all of the objects are mutable.
If they are immutable, then a new property set `A’` with the updated URI
must be created from `A`. This new property set must be added to
`properties` fields of entity sets that contained `A` and `A` must be
deleted from them. Therefore, new entity sets with updated properties
must be created. However, the old entity set objects were contained in
`value` of property sets which must be subsequently changed. It is also
necessary to handle a graph schema which could recursively update schema
indefinitely in a circle. Therefore, a simple change requires copying of
possibly the entire schema.

Hence, we need to introduce less coupling between entity sets and
property sets. Instead of entity sets and property sets containing
objects, they can contain only ids of other entity sets or property
sets. If a property set or entity set is updated then, its id stays the
same. It is only necessary to create the new updated object and other
objects automatically point to the new objects. However, the old and the
new object have the same id. Therefore, we need to remember which
objects are in the current schema which are old. We solve this by
storing all property sets, entity sets and literals set in one object
which defines a version of the schema. The new schema representation can
be seen below. Note that to be more general about the content of the
schema, we say it consist of items and relations between items. Items
then are entity and literal sets. Relations are property sets.

```typescript
interface EntitySet {
    id: identifier;
    types: string[];
    properties: PropertySet[];
}
interface LiteralSet {
    id: string;
}
interface PropertySet {
    id: identifier;
    uri?: string;
    value: EntitySet | LiteralSet;
}
interface RawSchema {
    items: { [key: identifier]: EntitySet | LiteralSet };
    relations: { [key: identifier]: PropertySet };
}
```

If something changes in the presented schema, the items and relations of
`RawSchema` only need to be shallow copied (e.g. using spread operator)
to a new schema object and updated or new items or relations just have
to be set in the `items` or `relations` object maps which overwrites
their old versions by default. Therefore, the integration with undo and
redo operations is fairly easy.

We did not consider more object oriented representation for two reasons.
First, the schema must be somehow stored as a state and storing classes
with functions in states is not recommended. Another reason is that the
schema is shared between Editor and Recommenders; therefore, using
simple objects makes serialization and deserialization straightforward.

The schema is not large even for large data since it only captures the
structure; therefore, no special handling is done.

We encapsulate the internal structures of the schema (i.e. `RawSchema`)
and provide an interface for accessing the schema. Schema can be
transformed only by using transformation objects. Its endpoint accepts
an array of transformation objects and returns a transformed version of
the schema. This is useful for implementing undo/redo operations on top
of the schema since many small update operations can be merged to one
operation. Another advantage is that Recommenders can send
recommendations containing only defined schema transformations instead
of an internal schema state. Note that the interface also needs to
provide the raw internal state of data so that Editor can store it as a
state.

### Instances

Instances represent the original data. Since the structure of the data
is represented by the schema, it is not necessary to handle it here.
Instances need to remember for each entity its properties and its
values. It should be also possible to add language tags or data types to
literals and URIs to entities. The representation could be done using
the same structure as was used in schema - having an entity object with
properties linking to either literal values or other entities.

However, performing a the same conceptual transformation in the
instances can be more difficult than in the schema. For example,
changing a property set source to a different entity set requires
updating all old and new source entities while the update in schema is
done only one new and old entity set. Basically, the transformation done
for schema would be repeated here for every entity. Since implementing
transformations in this representation is quite complex, we choose
instead to rely on schema representing structures and implement more
column database approach and perform operations not on single entities
or properties but on arrays of entities or properties.

For each property set with its source entity set, we store an array of
properties. Each property contains an array of literals and an array of
indices of entities of the target entity set. Moving a property set
transformation is then easy to implement in the representation. It is
only required to move the literal and entity arrays to be under the new
source entity set. As for entities, we need to be able to assign URIs to
them. The representation in code is shown below. The keys of the objects
are IDs from schema which is entity set id for representing entities and
a combination of source entity set id and property set for properties.

```typescript
interface Literal {
    value: string;
    type: string;
    language?: string;
}
interface Property {
    targetEntities: number[];
    literals: Literal[];
}
interface RawInstances {
    entities: { [key: identifier]: { uri?: string }[] };
    properties: { [key: identifier]: Property[] };
}
```

Each change in instances then again requires to shallow copy entities
and properties object maps in `RawInstances` to create a new version of
the instances and set new entity arrays or property arrays in the object
maps.

Now we discuss the rest of the requirements. Using the same arguments as
in schema this representation can be used to store the state as well as
it is easily serializable. Similar argument can be made with the history
since copying the instances requires only shallow copying the root
objects in `RawInstances` and then immutable changes can be done locally
by setting array of properties or array of entities.

The remaining requirement to fulfill is supporting transformations of
large data. We actually design two different solutions. The
transformations work the same way as for schema. There are
transformation objects passed to instances based on which transformation
is done on a shallow copied instances object. The simple solution is to
have the instances API asynchronous. The actual data can then be stored
somewhere on a server and only a proxy can be part of the editor.

The other solution is a clever definition of transformation operations.
The idea is that the user can upload only example data with the same
structure and therefore the same schema as the full data. They could
then perform the entire transformation on the example data and export
all transformations. Then the exported transformations could be run on
the original large large data. Therefore, it is necessary to define
transformations in a way not dependent on any set number of entities or
properties or on any references to another entity by its index in the
list of the entities of its entity set. For example, if a new property
set is created between two entity sets, the property mapping between
underlying source and target entities must be defined. A simple
definition is to list the pairs of entities to be linked by a property.
However, the pairs would contain only properties between the entities in
the example which would not work when run on large data. Instead, a
mapping must be specified based on some rules so that the transformation
can be run on any data with the same schema. For example, a join,
preservation, one-to-one mapping options.

## Data Model Component View

In the last subsection, we discussed that the model representing the
structured data is split into a schema and instances. We discussed
mainly the low level representation. In this subsection we discuss how
the model and related features are split into components. We summarize
communication among the components and their main interfaces.

Both schema and instances are encapsulated into their own components
that provide API for querying, transforming, exporting and loading. The
API for schema is synchronous since we expect the schema to be small and
sent whole if needed elsewhere while the API for instances is
asynchronous. Export means producing the desired RDF representation.

The loading functionality means creating a schema and instances.
Creating schema and instances separately from the structured data would
require a synchronization between both the loading algorithms so that
they work the same way for shared areas such as an id assignment.
Therefore, there is a component Parse whose function is to parse the
input structured data into a tree data structure that contains both the
structure (i.e. schema) of the data and the actual data values. Schema
and Instances component then supports loading (i.e. creating) schema and
instances from this tree.

There is also a component Transform providing transformations for both
schema and instances. While both Schema and Instances components support
transformations as we discussed it before, if one conceptual
transformation is done across both schema and instances, separate
different transformations objects must be created for both schema and
instances and the user (e.g. UI code in this case or a recommender) is
responsible for that the correct transformation is done in both. Since
transformation creation is an important part of many places in Editor
and Recommenders, we do not want to burden these places with
synchronization of the states of schema and instances. Moreover, the
code for common transformation such as moving a property set in both
schema and instances is always the same, so there would be a code
duplication.

Therefore, we the component Transform that provides factory methods
creating schema and instance transformations together for various
conceptual transformations such as updating literals or moving
properties. Note that one such one conceptual transformation can consist
of multiple schema transformations and multiple instance
transformations. The correct synchronization of schema and instances is
then done by this component and consumers need only to call the factory
methods to create desired transformations objects.

These components are shown in the picture below. Unsuprisingly, Transform is needs to
access schema and instances to create their transformation and both
Schema and Instances are loaded from a tree structure that is created by
Parse. Instances does not include the structure of the structured data
and is dependent on the ids from of the corresponding schema that it
stores its data under. Therefore, it needs access to Schema.

![Data Model Component View](/img/concepts/data-representation-components.png)
