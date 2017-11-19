# dm4js

This library is a library for customer to make better decision.

Currently the linear scalarization multi objective optimization is added to the library. This technique score chices based on pre-defined wiegth vector and the minimize a linear function and select the lowest score. Each value can be select to be maximize or minize.

* The chooseLinear(.,.) function first normalize the choices vector and then select the best.

To know how algorithm find best choice use [this link](https://en.wikipedia.org/wiki/Multi-objective_optimization#Scalarizing)

## Usage example
A simple usage example is as below :

```
let dmjs = require('dm4js');

let model = [
    {
        label: 'price',
        weight: .5,
        way: 'min',
        type: 'numerical'
    },
    {
        label: 'capacity',
        weight: .4,
        way: 'max',
        type: 'numerical'
    },
    {
        label: 'lifetime',
        weight: .6,
        way: 'max',
        type: 'numerical'
    },
    {
        label: 'flashtype',
        weight: .3,
        way: 'max',
        type: 'ordered',
        categories: ['', 'TLC', '3D NAND', 'MLC', 'SLC'] // latest is the best
    }
];
let choices = [
    [361000, 240, 1000000, 'TLC'], // SSD Panther AS330
    [425000, 240, 1750000, 'MLC'], // SSD San Disk SSD PLUS
    [300000, 240, 1500000, 'TLC'], // SSD Pioneer APS-SL2
    [395000, 240, 2000000, '3D NAND']  // SSD Adata SU650
];

dmjs.chooseLinear(model, choices);
```

## Adding library
```
npm i --save dm4js
```
