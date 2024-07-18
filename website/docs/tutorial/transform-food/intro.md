---
sidebar_position: 1
---

# Intro

In this chapter we illustrate how the system is used to handle its main
functionality - enabling the transformation of structured data to RDF in
an interactive environment while suggesting transformation
recommendations. We take the food data used in Motivating Example () and
showcase in the form of a tutorial how to transform them to RDF using
our system, namely Editor application.

Before the tutorial begins, the system must be deployed locally.
Therefore, in we link deploy description and provide the datasets based
on which recommendations are done and which; therefore, must be loaded
into the system before any step in the tutorial is done.

Once the system is running, the tutorial can be done. It consists of
three main parts described in separate sections. First, we describe the
input data we later load to Editor in . Then, in we show how Editor is
used to transform the data to RDF using screenshots from Editor. Lastly,
we provide the result RDF data in . We run Editor in Firefox.

## Deploy System Locally and Upload Datasets {#s:run}

In this section we describe how the system can be locally deployed and
which datasets should be loaded to it to be able to reproduce the steps
in the upcoming tutorial.

### Deploy System Locally

The system can be deployed using docker compose[^1]. The exact details
are discussed in .

## Input Data {#s:input-data}

In this first tutorial section, we describe the input structured data to
load to Editor. The data are the same food data as in Motivating Example
() with the exception of having not one food product but three in order
to show how data with multiple instances (e.g. arrays with more than one
element) can be manipulated and browsed in Editor.

The data are available at `data/example/food3.json` from the repository
root and they are also shown below. There is a global array of some
objects that contain a property `product` linking to a food product
object. Each food product object has an identifier, name, list of
countries where it is sold and its nutrient information. The data are
from OpenFoodFacts [@open-food-facts-web] and we kept the original
structure shown below.

```json
[
    {
        "product": {
            "_id": "0737628064502",
            "product_name": "Thai peanut noodle kit",
            "countries": ["United States"],
            "nutriments": {
                "carbohydrates_100g": 71.15,
                "carbohydrates_unit": "g",
                "energy-kcal_100g": 385.0,
                "energy-kcal_unit": "kcal"
            }
        }
    },
    {
        "product": {
            "_id": "0737628064503",
            "product_name": "Snickers bar",
            "countries": ["Canada", "Czechia"],
            "nutriments": {
                "carbohydrates_100g": 90.15,
                "carbohydrates_unit": "g",
                "energy-kcal_100g": 383.0,
                "energy-kcal_unit": "kcal"
            }
        }
    },
    {
        "product": {
            "_id": "0737628064504",
            "product_name": "Milka chocolate",
            "countries": ["Canada", "Czechia"],
            "nutriments": {
                "carbohydrates_100g": 52.15,
                "carbohydrates_unit": "g",
                "energy-kcal_100g": 343.0,
                "energy-kcal_unit": "kcal"
            }
        }
    }
]
```
