# Transformation

In this section we present how the whole transformation of the food data
to RDF can be done in Editor in the form of a work along tutorial. There
are Editor screenshots showing the Editor states as we perform actions
in Editor. They are listed chronologically from top to bottom. While the
screenshots are referenced as figures by numbers, the reference
typically points the closest figure above or below the reference point.
The text on the following pages might end prematurely with blank space
filling the rest of a page so that texts for multiple screenshots are
not hoarded next to each other with figures following in the next pages.

## How are input data represented in the system?

We start by opening Editor on `localhost/index.html`. shows the initial
state of Editor with no data after opening it.

![Initial State](/img/tutorial/editor-start.png)

We use the `Import` button in the header on the top of the page and
upload the file with the food product data described in the previous
section located at `{repository}/data/example/food3.json`. The import
functionality currently supports uploading JSON and CSV files.

The import produces some boxes and arrows that are stacked on top of
each other. We hover on the `Auto Layout` button and choose
`horizontal layout` which layouts the boxes and arrows as shown in (the
pane on the right should not be visible nor the yellow coloring). The
rest of the options layout the boxes using different algorithms.
Alternatively, we can manually drag and drop the boxes to create the
desired layout.

Now each box and arrow is visible; therefore, we can explain what they
mean and how to view the original data. Each box represents an object or
an array of objects at a given position in the input JSON file. For
example, the box `product` represents the array of three products or the
box `nutriments` represents the three nutrient objects linked to each
product object using the `nutriments` property. If a food product object
contained an array of two nutrient objects in the `nutriments` property,
then the `nutrient` box would represent four objects. Note that the
arrow between the boxes (from `product` to `nutriments`) has name
`nutriments`. All of the arrows were created from properties to other
objects. The other properties containing a literal value (e.g. string or
number) are listed directly in the boxes such as `product` containing
`product_name`.

The original data can be viewed by clicking on the boxes. For example,
we click on `product` and a pane on the right should appear as in . The
pane has several drop-down sections that expand/shrink when clicked on.
They are identified by the black triangles. We also close the
`properties` drop-down by clicking it. There are a few terms such as
`Entities` that will be explained in due time.

![Product
Detail](/img/tutorial/editor-load-detail.png)

The original data are visible under the `Entities` drop-down. We can see
the literal values of `product` objects in the read-only inputs with
blue backgrounds. The inputs with pink backgrounds represent how the
object references another one. For example, the visible input is for the
`nutriments` property that points to the corresponding nutrient object
in the original data. That is represented with value `nutriments.0`
which means that the nutrient object is the first object (indexed at 0)
in the array of nutrient objects represented by `nutriments` box.

To summarize, the diagram of boxes and arrows represents the structure
of the data where boxes are arrays of objects (or single objects) and
arrows represent their relationships. We provide a specialised
terminology used throughout Editor so that we do not have to use terms
such as boxes and arrows which represent mainly the visual
representation. Terms Entity, Literal, Property represent original data.
Terms Entity Set, Literal Set and Property Set describe the data
structure.

Entity
: Entity corresponds to an object within a box of objects (i.e. an object in the original data). The content of the drop-down `Entities` is a visual of. Each can have its specific URI set.

Literal
: Literal represents a literal value (e.g. string, number) - the input with a blue background.

Property
: Property is created from an object property from the original data. Each property points to either a literal or an entity.

Entity Set
: Entity Set corresponds to the described box. It represents a set of entities. An entity set also contains property sets. For example, `product` in the diagram is an entity set.

Literal Set
: Literal Set corresponds to a set of literals where the literals are values of properties with the same name for the entities of the same entity set. For example, a set of product names.

Property Set
: Property Set corresponds to the described arrow - a set of properties. The value of property set is either a literal set or an entity set. All of the properties in a property set point to literals or entities of the value of the property set. For example, both `nutriments` and `product_name` are property sets.

Entity sets and property sets are shown in the diagram. Entities,
properties and literals can be viewed in the pane on the right in the
`Entities` section. Any transformation operation a user can do is based
on these terms. Note that even if we say that the defined terms
represent the original data, the original uploaded data are converted to
the described model and not preserved. Another terms used further in the
tutorial are nodes which represent the diagram boxes (resp. entity sets)
and edges which represent diagram arrows (resp. entity property sets).

## Export to RDF without any changes

Currently, if we exported the data to RDF, each entity would be
represented by a blank node and some example property URIs based on
property set names would be used to represent their properties.
Therefore, one of the goals of the transformation is to assign URIs to
both entities and properties. Setting a property set URI makes all its
properties have the set URI when transformed to RDF. Entity URIs can be
set in two ways. Either we can set an entity set URI which results in
entities using the URI as a base to create their URIs or we can set
entity URIs explicitly. We also typically want to set RDF types to
entities which is done by adding a type to an entity set in the
`EntitySet` pane (currently shown in ). Moreover, we typically want to
change the structure of the data and add language tags or types to
literals. How all of these manual actions are done along with some
additional features is described in the rest of the section.

## Transformation

Now that we described how Editor works with data, we can start the
actual transformation to RDF. Editor supports the concept of
recommendations. A recommendation provides a suggestion on how to
transform the data in Editor. For example, it can recommend to change
the structure of the data represented in the diagram or change literal
values. We try to see first if there are any recommendations available
by clicking on the `Get Recommendations` button on the left pane called
`Recommendations`. Note that this operation can take some time. We did
not implement messaging the user that recommendations are being fetched
since it is done instantly for us. The outcome is shown on .

![Recommendations
Fetched](/img/tutorial/editor-getrecs.png)

The Recommendations pane in shows a list of suggested transformation
recommendations. The recommendations can either be expert or general
each displayed when its tab is open. Both types work the same way in
Editor. Expert recommendations should be more targeted to a use case
while general recommendations are more general-purpose. Rather than
describing recommendations and their features in text, we click on the
`Description` button of the first recommendation to view what the
recommendation does. The outcome is shown in the picture below.

![Country Code List Recommendation Description View](/img/tutorial/editor-codelist-desc.png)

The picture above shows the description view layout and content on an example of a code
list recommedation suggesting to use code URIs from the code list in
`Related` section. Each recommandation description typically contains
three sections: `Description`, `Recommended Terms` and `Related`. The
first is `Description` which provides some information about what each
recommendation suggests. `Recommended Terms` section contains a list of
URIs that the recommendation suggests using. `Related` section contains
links to concepts mentioned in `Description` and any related terms. All
URIs are clickable for dereferencing.

The description view is meant to provide an overview about the
recommendation and provide links to terms that the user can investigate
and decide if they want to use them. For more detailed information about
suggested data transformation, we click on the corresponding `Diff`
button yellowed in the picture below to get a difference view of the recommendation.

![Code List Difference View - `codeSet` Entity Set
Detail](/img/tutorial/editor-codelist-diff-entity-alone.png)

The picture above shows the difference view of the recommendation. There are two diagrams
with exactly the same meaning (i.e. showing data structure) as the main
diagram from before. The left diagram shows the state of data as they
are now. The right side diagram shows the state were we to transform the
data according to the recommendation. The red entity sets and property
sets represent changes between the two states. Any nodes and edges in
the diagrams can be clicked on to view their data. A yellow color is
used for the currently selected (i.e. clicked) diagram elements whose
detail is shown above the corresponding diagram. In the figure, the
`product` entity set contains changes as well as its property
`countries`. We see that in the new state there is a new entity set
`codeSet` and entity property set `countries` while the original literal
property set `countries` is missing.

To get to the same screen as is portrayed in the figure, we click on
`codeSet` which results in a pane appearing above the diagram which
shows what the added entity set represents and what entities it
contains. We see that its entities are countries and their URIs
correspond to the URIs of Publications Europa country code list[^2].

We investigate the changes further by clicking on `countries` in both
diagrams ().

![Code list Difference View - `countries` Property
Sets](/img/tutorial/editor-codelist-diff-property.png)

shows the difference between the original literal property set
`countries` and the new entity property set `countries`. We can see that
the countries represented originally by literals such as
`"United States"` are represented by entities representing countries
with well-known URIs such as `country:USA`[^3].

We deem that representing countries using well-known URIs is better than
using literals; therefore, we click on the `Accept` button of the
recommendation which triggers the suggested transformation to be done on
our data. With some manual layouting and by clicking on the newly
created `codeSet` entity set node, we get the view presented by . In the
figure there are URIs represented using a prefix. It was not done
automatically. Instead, we manually added a prefix for the code list
after applying the recommendation.

![Applied Country Code List
Recommendation](/img/tutorial/editor-codelist-after-view.png)

Adding a prefix can be done by clicking on the `Prefixes` button in the
top header and filling out the `Add Prefix` form to get the view as in .
The prefixes are then used instead of the full URIs whenever any URI is
shown. Moreover, when setting URIs manually in inputs, available
prefixes are suggested in a drop-down and user can write the usual
prefix syntax to set URIs. After creating the prefix, the Editor should
be the same as in after clicking again on `codeSet` entity set node.

![Country Code List Prefix
Added](/img/tutorial/editor-add-prefix.png)

We continue with the transformation of data. We click on the button
`Get Recommendations` again to get recommendations. Note that the code
list recommendations are not present since our data not longer contain
country literals. The topmost recommendation has category `Nutrients`.
Since our data contain nutrient information we investigate the
recommendation and click on `Diff` to view its difference view ( without
the detail panes on the top).

![Carbohydrates Nutrient Recommendation Difference
View](/img/tutorial/editor-carbs-rec-entity.png)

shows the difference view for the topmost recommendation that suggests
how to represent the data about carbohydrates. We can see that the
carbohydrates value and unit property sets are recommended to be moved
to a separate entity set. We click on the new entity set with the
carbohydrates property sets and on the `nutriments` node as shown in the
figure (our Editor view should be the same now as in the figure).

By comparing the detail panes, we see that `_carbohydrates` entity set
contains type `QuantitativeValueFloat`[^4] from Good Relations
[@gr-vocabulary-web] vocabulary and that the literal for unit changed
from `"g"` to `"GRM"`.

When we click on the property `carbohydrates` that points to
`_carbohydrates`, we can see that its URI is set to
`carbohydratesPer100g`[^5] from Food Ontology vocabulary
[@food-purl-vocabulary-web]. Clicking on literal property sets of
`_caborhydrates` shows that they also have URIs from Good Relations
vocabulary.

Since we do not have to know these vocabularies, we investigate further
by clicking on the `Description` button of the recommendation which
results in Editor showing a description view shown in .

![Carbohydrates Nutrient Recommendation
Description](/img/tutorial/editor-carbs-rec-desc.png)

provides of a brief explanation of the recommendation for Food Ontology
vocabulary and provides links for the recommended and related terms. We
can either trust the recommendation and accept it or investigate the
links. The investigation yields that Food Ontology (`food` prefix) is
based on Good Relations (`gr` prefix) and that there is a type
`food:Food` that is a subclass of `gr:ProductOrService`. Moreover, we
find out that nutrition properties should be added to a resource with
`food:Food` type. The model of Food Ontology is described in the
Motivating Example (. We accept the recommendation and add prefixes for
both vocabularies. The types of `_carbohydrate` and URIs of its
properties are accessible in its detail pane that is shown when the node
is clicked on ().

![Editor After Carbohydrate Recommendation with
Prefixes](/img/tutorial/editor-carbs-after-wprefix.png)

We continue by again clicking on the `Get Recommendations` button and
select the new topmost nutrient recommendation's difference view. If it
does not look like in , then use the other nutrient recommendation
(there should be two). It is similar to the previous carbohydrate
recommendation but for the other property sets related to energy.

![Editor Energy Nutrient Recommendation Difference
View](/img/tutorial/editor-nutr-rec-diff.png)

We accept the recommendation the get the Editor diagram view as in
without the right pane. Note that the diagram does not show property set
names but rather prefixed URIs if property sets have URIs and the
corresponding prefixes are set. Based on our investigation we know that
the nutrient properties should origin in a food product entities.
Currently, their origin is the `nutriments` entity set. Therefore, we
want to move them to the `product` entity set. We start by clicking on
`nutriments` showing its detail ().

![Editor after Nutrient
Recommendations](/img/tutorial/editor-move-carbs.png)

Then, we click on the `Move` button under the section `Properties` for
the property set (and its underlying properties) `carbohydrates`. The
right pane changes and `Move PropertySet` pane appears. We click on the
section `Original Mapping` and get to the same state as is shown in
without the bottom diagram having any edges (i.e. arrows).

![Move Carbohydrates Property
Sets](/img/tutorial/editor-move-carbs-property.png)

shows how property sets and their properties are moved from one source
or target entity set to another. The section `Original Mapping`
represents how the properties between source and target entities are
linked (mapped) which is represented by the diagram. The section
`New Mapping` allows us to specify a new source or a new target or both.
We click on the button `Select` next to the `Source` and click on the
`product` node. By doing this the source is set to `product` as it is
shown in the figure. The target remains the same. We also need to
specify how the properties between the selected source' and target'
entities are mapped.

There are generally six options out of which only the four are available
in this case. The `Manual` option lets us drag edges manually. However,
if we only loaded some small example data and we potentially want to run
the same transformations on larger data in future (executed
transformations can be exported and imported), using the manual option
is not feasible. The other options are suitable even for that purpose
since they provide a rule based mapping to the underlying transformation
algorithm. Mapping options `OneOne`, `OneAll`, `AllOne` are simple and
work as one would expect. The `Join` mapping provides an option to map
entities based on inner join of literal properties of the source and
target. The option that we actually need in this scenario is named
`Preserve`. The preserve option checks that the original and new sources
have the same number of entities as well as that the original and new
targets have the same number of entities. If so, it copies the mapping
based on the original mapping shown in the diagram above. Both
`nutriments` and `product` have both three entities and there is the
property set `nutriments` between them which assigns each product one
entity (i.e. the mapping is one to one). Therefore, we use the preserve
option by clicking on the `Preserve` button and scroll down to click on
the `Ok` button.

We also move the property set `food:energyPer100g` to `product` which
gives us the diagram shown in .

![Editor After Move Carbs and Energy to
Food](/img/tutorial/editor-after-move-rm-nutr.png)

We now see that `nutriments` entity set is useless and we delete it. We
click on it and click on the section `Operations` in the right pane.
There should be a button `Delete` in the section `Operations` that is
shown in . We click on it and the `nutriments` entity set along with all
associated property sets are deleted.

The nutrients properties (property sets) are now connected to the
`product` entity set. We know that the sources of these properties
should have types `food:Food`. So we click on `product` and click on
`Add Type` and write `food:Food` into the appeared input and hit enter.
The end result is shown in . Adding a type to an entity set means that
all underlying entities will have the type in the final RDF.

![Added Food Type](/img/tutorial/editor-add-food.png)

We have yet to set URIs to the `product` literal property sets `_id` and
`product_name`. We do it manually to show how it is done. When we did
our investigation of Food Ontology while deciding whether to apply the
carbohydrates recommendation, we found that `gr:ProductOrService` can
have a property `gr:name` defining a product name and that
`gr:ProductOrService` is the same as `schema:Product` which has a
`schema:ProductID` property for defining a product ID.

Therefore, we click on `product` to open its detail and write the URIs
in the corresponding property sets' inputs. The end result is shown in .

![Editor Add Schema
ProductID](/img/tutorial/editor-add-sId.png)

We are almost done. We delete `root`. Then, we need to assign URIs to
the `product` entities, assign language tags and set the URI of the
`countries` property set. We start by setting URIs of `product`
properties. We click on the `Uris` button in the header and the right
pane should change to `Update Entity Uris`. There we click on `Select`
and then on `product`. We can now set the URI pattern that is applied to
all entities. We can compose it of text strings and literal property
values. The inputs can be dragged over each other to change the
ordering. We fill out the pattern according to how it is done in .
Below, we can see the entities' URIs. Then we click on `Ok` to set the
URIs.

![Set Food Product
URIs](/img/tutorial/editor-set-food-uris.png)

We continue by assigning language tags. The only literals that need a
language tag set are literals of the property set `gr:name`. We click on
`product` again and click on the `Update` button next to the property
set `gr:name`. We should be able to see the pane `Update Literals` ().
We write `en` to the input for `Language` and click on `Ok` to set the
language tag `en` to all literals.

![Set Language Tag for Product
Names](/img/tutorial/editor-set-lang.png)

Finally, we need to set the URI of the `countries` properties. We click
on `product` and fill in `http://example.com/soldInCountries` to the URI
input for the property set `countries` (). We can scroll the pane to
check that language tags, URIs and the URI for `countries` are set
correctly.

![Set Countries
Property](/img/tutorial/editor-set-countries.png)

The only thing left to do now is to export the data to RDF. We click on
`Export` and choose `Instances`. The `Export Instances` pane should
appear (). It validates all URIs and provides options to set URIs for
all entity sets. Since the URIs for `product` and `codeSet` are set
directly on entities and the other entities should be blank nodes which
is the default, we can click on `Ok`. A TTL file with the RDF is
downloaded to our file system.

![Export to RDF](/img/tutorial/editor-export.png)

We are at the end of the tutorial. Editor also supports `Undo` and
`Redo` operations for convenience.

## Final RDF Data {#s:final-rdf}

The produced RDF is shown below. We include a manually prettified
version and only the first food product.

```ttl
    @prefix schema: <https://schema.org/> .
    @prefix food: <http://purl.org/foodontology#> .
    @prefix gr: <http://purl.org/goodrelations/v1#> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    @prefix ex: <http://example.com/> .
    @prefix ex-food: <http://example.com/food> .

    ex-food:0737628064502 a food:Food ;
      schema:productID "0737628064502" ;
      gr:name "Thai peanut noodle kit"@en ;
      ex:soldInCountries
        <http://publications.europa.eu/resource/authority/country/USA> ;
      food:carbohydratesPer100g [
        a gr:QuantitativeValueFloat ;
        gr:hasValueFloat "71.15"^^xsd:double ;
        gr:hasUnitOfMeasurement "GRM"
      ];
      food:energyPer100g [
        a gr:QuantitativeValueFloat ;
        gr:hasValueFloat 385 ;
        gr:hasUnitOfMeasurement "K51"
      ].
```

<!-- [^1]: <https://docs.docker.com/compose/>
[^2]: <https://op.europa.eu/en/web/eu-vocabularies/dataset/-/resource?uri=http://publications.europa.eu/resource/dataset/country>
[^3]: <https://publications.europa.eu/resource/authority/country/USA>
[^4]: <http://purl.org/goodrelations/v1#QuantitativeValueFloat>
[^5]: <http://purl.org/foodontology#carbohydratesPer100g> -->
