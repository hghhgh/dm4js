# dm4js

This library is a library for customer to make better decision.

- Currently the linear scalarization multi objective optimization is added to the library. This technique score chices based on pre-defined wiegth vector and the minimize a linear function and select the lowest score. Each value can be select to be maximize or minize.

    * The chooseLinear(.,.) function first normalize the choices vector and then select the best.
    To know how algorithm find best choice use [this link](https://en.wikipedia.org/wiki/Multi-objective_optimization#Scalarizing).

- and Bayesian inference for diagnosis

## Adding library
npm library > [here](https://www.npmjs.com/package/dm4js)
```
npm i --save dm4js
```
## Dependency
Currently there is only one dependecy for optimization algoritm. The library is 'genetic-js' witch can be find [here](https://github.com/subprotocol/genetic-js).
To install dependency use command below :
```
npm install genetic-js
```


## Usage example
See test file for more examples !.

A simple usage of 'chooseLinear' is as below :

```
let dmjs = require('dm4js');

let model = [
    {
        label: 'price',
        weight: .5,
        shouldbe: 'min',
        type: 'numerical'
    },
    {
        label: 'capacity',
        weight: .4,
        shouldbe: 'max',
        type: 'numerical'
    },
    {
        label: 'lifetime',
        weight: .6,
        shouldbe: 'max',
        type: 'numerical'
    },
    {
        label: 'flashtype',
        weight: .3,
        shouldbe: 'max',
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

let bestChoice = dmjs.chooseLinear(model, choices).BestIndex;
```
bestChoice is 2 which means SSD Pioneer APS-SL2 is the best.

## Extracting a Model
We use genetic algorithm to find desired model. The genetic algorithm is a global optimizer that means if there is a solution it can find it, and the result model is global optimum if the algorithm runs enough iterations.
To find a model that fits on an ordered choices is as below :
```
let model = [
    {
        label: 'price',
        // weight: .5,
        weight: .0,
        shouldbe: 'min',
        type: 'numerical'
    },
    {
        label: 'capacity',
        // weight: .4,
        weight: .0,
        shouldbe: 'max',
        type: 'numerical'
    },
    {
        label: 'lifetime',
        // weight: .6,
        weight: .0,
        shouldbe: 'max',
        type: 'numerical'
    },
    {
        label: 'flashtype',
        // weight: .3,
        weight: .0,
        shouldbe: 'max',
        type: 'ordered',
        categories: ['', 'TLC', '3D NAND', 'MLC', 'SLC'] // latest is the best
    }
];
let choices = [
    [300000, 240, 1500000, 'TLC'], // SSD Pioneer APS-SL2
    [425000, 240, 1750000, 'MLC'], // SSD San Disk SSD PLUS
    [395000, 240, 2000000, '3D NAND'],  // SSD Adata SU650
    [361000, 240, 1000000, 'TLC'], // SSD Panther AS330
];
let themodel = dm4js.findLinearModelWeights(model, choices, 1000);
```
This function map our oppinion in prioritising products, it means that if we create a list of our faivorit products and this list will be ordered from best to worst, in fact we have an oppinion in our mind that make us to create these list. This oppinion can be modeled linearly as a weights of a linear model. The function : findLinearModelWeights can find this model.

## Other Functions
There are more functions in the library as below :

```
/*
 Note : The diffrence of this function with 'findLinearModelWeights' is that this function find a model such that
 the score of choices in ordered list be as largest as possible. But it take long time to converge, although may not
 be efficient
*/
findLinearModelWeights(ZeroWeightModel, OrderedBestChoices, iteration)
```

# My steps to Publish
code => test => publish => revise code => test => publish new version ...