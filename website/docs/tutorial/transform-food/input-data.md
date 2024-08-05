---
sidebar_position: 2
---

# Input Data

In this tutorial section, we describe the input structured data to load to Editor that we will convert to RDF. The data are food product data from [Open Food Facts](https://world.openfoodfacts.org/) which were slightly trimmed for convenience. The data are shown below and can be downloaded from [https://github.com/georgeus19/klofan/blob/main/data/example/food3.json](https://github.com/georgeus19/klofan/blob/main/data/example/food3.json).

There is a global array of some objects that contain a property `product` linking to a food product object. Each food product object has an identifier, name, list of countries where it is sold and its nutrient information.

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
