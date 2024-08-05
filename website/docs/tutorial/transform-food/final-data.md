---
sidebar_position: 5
---

# Final RDF Data

The produced RDF is shown below - we include a manually prettified
version and only for the first food product.

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
