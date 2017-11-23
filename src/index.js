/**
 * Created by ghiassi on 11/19/17.
 */

let Genetic = require("genetic-js");


// normalize choices values
let normalizeChoices = function (Model, Choices) {

    return Choices.map(function (cv) {
        let normed = [];
        cv.forEach(function (iv, i) {
            if (Model[i].type == 'numerical') {
                let max = Math.max.apply(Math, Choices.map(function (v) {
                    return v[i]
                }));
                let min = Math.min.apply(Math, Choices.map(function (v) {
                    return v[i]
                }));
                if (min == max) {
                    normed.push(0.0);
                } else {
                    normed.push((cv[i] - min) / (max - min))
                }
            } else if (Model[i].type == 'ordered') {
                let len = Model[i].categories.length;
                let dto = Model[i].categories.findIndex(function (val) {
                    return val == cv[i];
                });
                normed.push(dto / len);
            }
        }, [normed, Choices]);
        return normed;
    });

};

// score choices
let scoreChoices = function (normchoices, Model) {
    let scores = [];
    normchoices.forEach(function (chs) {
        let score = 0.0;
        Model.forEach(function (m, j) {
            score += m.shouldbe == 'min' ? m.weight * chs[j] : m.weight * (1.0 - chs[j]); // all data are in range [0,1]
            // console.log([m.shouldbe, m.weight, chs[j], score]);
        }.bind(score));
        // console.log(score);
        scores.push(score);
    }.bind(scores));
    return scores;
};

// find best choice
let findBest = function (scores) {
    return scores.findIndex(function (val) {
        return val == Math.min.apply(Math, scores);
    });
};

/*
 This function uses Linear Scalarization technique of multi-objective optimization
 model includes : {
 label of the parameter
 weight is the array of positive values
 shouldbe is the array of the target that should be 'min' or 'max'
 type : 'numerical', 'ordered'
 categories: ['val1', 'val2', 'val3', ...] only for ordered type
 }
 choices is an array of data point (each data point is an array too)
 return an object that includes 'BestIndex' : the index of the best choice (the data with lowset score)
 and 'Scores' : scores of the others
 return value is zero-based index
 */

let chooseLinear = function (Model, Choices) {
    // nomalize
    let normchoices = normalizeChoices(Model, Choices);
    // console.log((normchoices));

    // Score data
    let scores = scoreChoices(normchoices, Model);

    // select best choice
    let best = findBest(scores);

    return {BestIndex: best, Scores: scores};
};

/*
 To find the best matching model of our oppinion in selecting products we define this function.
 This function should find the weight of a model using optimization algortihm like genetic
 The weights find appropriate to a ordered list of choices. The first item of the list is the best choices
 of us and the last one is the worst.
 The resulting Model (cost function) can be use in chooseLinear function to select best choice on some other
 products.
 */
let findLinearModelWeights = function (ZeroWeightModel, OrderedBestChoices, iteration) {
    console.log('here findLinearModelWeights');
    let genetic = Genetic.create();
    genetic.optimize = Genetic.Optimize.Minimize;
    genetic.select1 = Genetic.Select1.Tournament2;
    genetic.select2 = Genetic.Select2.FittestRandom;
    genetic.seed = function () {

        let a = [];
        // create coefficients for model with values between (0.0, 1.0)

        let ZWM = this.userData["ZeroWeightModel"];

        let degree = ZWM.length; // length of an individual
        let i;
        for (i = 0; i < degree; ++i) {
            a.push(Math.random() + 0.000001); //for non zero weight
        }

        // console.log('seed : ' + a);

        return a;
    };

    genetic.mutate = function (entity) {

        // allow chromosomal drift with this range (-0.05, 0.05)
        let drift = ((Math.random() - 0.5) * 2) * 0.05;

        let i = Math.floor(Math.random() * entity.length);
        entity[i] += drift;

        return entity;
    };
    genetic.crossover = function (mother, father) {
        // crossover via interpolation
        function lerp(a, b, p) {
            return a + (b - a) * p;
        }

        let len = mother.length;
        let i = Math.floor(Math.random() * len);
        let r = Math.random();
        let son = [].concat(father);
        let daughter = [].concat(mother);

        son[i] = lerp(father[i], mother[i], r);
        daughter[i] = lerp(mother[i], father[i], r);

        return [son, daughter];
    };

    genetic.normalizeChoices = normalizeChoices;
    genetic.scoreChoices = scoreChoices;
    genetic.findBest = findBest;
    genetic.fitness = function (entity) {

        let ZWM = this.userData["ZeroWeightModel"];
        let OBC = this.userData["OrderedBestChoices"];


        let NewModel = Object.assign([], ZWM);
        // console.log("ZWM : " + JSON.stringify(ZWM));
        // console.log("NewModel : " + JSON.stringify(NewModel));

        NewModel.forEach(function (m, j) {
            m.weight = entity[j];
        });

        // console.log('NewModel : ' + JSON.stringify(NewModel));

        let errors = 0;
        let bests = [];
        let normchoices = this.normalizeChoices(NewModel, OBC);
        for (let i = 0; i < OBC.length; i++) {
            let nOBCS = normchoices.slice(i, OBC.length);
            let scores = this.scoreChoices(nOBCS, NewModel);
            let best = this.findBest(scores);

            // console.log('scores : ' + scores);

            bests.push(i + best);
            errors += (best == 0) ? 0.0 : 1.0;
        }

        return (errors / OBC.length);

    };
    genetic.generation = function (pop, generation, stats) {
    };

    genetic.finalresult = [];
    genetic.notification = function (pop, generation, stats, isFinished) {

        // console.log('generation+1 : ' + generation+1);
        // console.log('pop[0].entity : ' + pop[0].entity);
        // console.log('pop[0].fitness : ' + pop[0].fitness);
        // console.log('stats.mean.toPrecision(4) : ' + stats.mean.toPrecision(4));
        // console.log('stats.stdev.toPrecision(4) : ' + stats.stdev.toPrecision(4));

        // console.log('pop[0] : ' + JSON.stringify(pop[0]));
        // console.log('isFinished : ' + isFinished);
        if (isFinished) {

            let ZWM = this.userData["ZeroWeightModel"];
            let NewModel = Object.assign([], ZWM);
            NewModel.forEach(function (m, j) {
                m.weight = pop[0].entity[j];
            }.bind(pop[0]));

            genetic.finalresult = {Model: NewModel, fitness: pop[0].fitness};
            console.log('stats : ' + JSON.stringify(stats));
            console.log('generation : ' + JSON.stringify(generation));

        }
    };

    let config = {
        "size": 100,
        "crossover": 0.01,
        "mutation": 0.2,
        "iterations": iteration,
        "fittestAlwaysSurvives": true,
        "maxResults": 100,
        "webWorkers": true,
        "skip": 10
    };
    let userData = {
        "ZeroWeightModel": ZeroWeightModel,
        "OrderedBestChoices": OrderedBestChoices
    };
    genetic.evolve(config, userData);

    genetic.finalresult.best = chooseLinear(genetic.finalresult.Model, OrderedBestChoices);

    return genetic.finalresult;
};

/*
 Note : The diffrence of this function with 'findLinearModelWeights' is that this function find a model such that
 the score of choices in ordered list be as largest as possible. But it take long time to converge, although may not
 be efficient

 To find the best matching model of our oppinion in selecting products we define this function.
 This function should find the weight of a model using optimization algortihm like genetic
 The weights find appropriate to a ordered list of choices. The first item of the list is the best choices
 of us and the last one is the worst.
 The resulting Model (cost function) can be use in chooseLinear function to select best choice on some other
 products.
 */
let findLinearModelWeightsWithLargDist = function (ZeroWeightModel, OrderedBestChoices, iteration) {
    console.log('here findLinearModelWeights');
    let genetic = Genetic.create();
    genetic.optimize = Genetic.Optimize.Minimize;
    genetic.select1 = Genetic.Select1.Tournament2;
    genetic.select2 = Genetic.Select2.FittestRandom;
    genetic.seed = function () {

        let a = [];
        // create coefficients for model with values between (0.0, 1.0)

        let ZWM = this.userData["ZeroWeightModel"];

        let degree = ZWM.length; // length of an individual
        let i;
        for (i = 0; i < degree; ++i) {
            a.push(Math.random() + 0.000001); //for non zero weight
        }

        // console.log('seed : ' + a);

        return a;
    };

    genetic.mutate = function (entity) {

        // allow chromosomal drift with this range (-0.05, 0.05)
        let drift = ((Math.random() - 0.5) * 2) * 0.05;

        let i = Math.floor(Math.random() * entity.length);
        entity[i] += drift;

        return entity;
    };
    genetic.crossover = function (mother, father) {
        // crossover via interpolation
        function lerp(a, b, p) {
            return a + (b - a) * p;
        }

        let len = mother.length;
        let i = Math.floor(Math.random() * len);
        let r = Math.random();
        let son = [].concat(father);
        let daughter = [].concat(mother);

        son[i] = lerp(father[i], mother[i], r);
        daughter[i] = lerp(mother[i], father[i], r);

        return [son, daughter];
    };

    genetic.normalizeChoices = normalizeChoices;
    genetic.scoreChoices = scoreChoices;
    genetic.findBest = findBest;
    genetic.fitness = function (entity) {

        let ZWM = this.userData["ZeroWeightModel"];
        let OBC = this.userData["OrderedBestChoices"];

        let NewModel = Object.assign([], ZWM);
        NewModel.forEach(function (m, j) {
            m.weight = entity[j];
        });
        // console.log("NewModel : " + JSON.stringify(NewModel));

        // add minimization of wrong order of choices
        let errors = 0;
        let bests = [];
        let normchoices = this.normalizeChoices(NewModel, OBC);
        for (let i = 0; i < OBC.length; i++) {
            let nOBCS = normchoices.slice(i, OBC.length);
            let scores = this.scoreChoices(nOBCS, NewModel);
            let best = this.findBest(scores);
            bests.push(i + best);
            errors += (best == 0) ? 0.0 : 1.0;
        }

        // add maximization of distance
        let scores = this.scoreChoices(normchoices, NewModel);
        let dist = 0.0;
        for (let i = 0; i < scores.length - 1; i++) {
            let d = (scores[i + 1] - scores[i]);
            dist += Math.exp(-(d * d));
        }
        let sdist = (dist / scores.length);

        // add minimization of wieghts
        // constraint : sum of weights is 1
        let ws = 0.0;
        for (let i = 0; i < entity.length; i++) {
            ws += (entity[i]);
        }
        let d = (ws - 1);
        let sws = 1 - Math.exp(-(d * d));

        // console.log('bests : ' + bests);
        // console.log('errors : ' + errors);
        // console.log('sdist : ' + sdist);
        // console.log('err: ' + (errors / OBC.length) + ' sdist: ' + sdist + ' sws: ' + sws);

        // return (.5*(errors / OBC.length) + .4*sdist + .1*sws);
        return (.5 * (errors / OBC.length) + .5 * sdist + .0 * sws);

    };
    genetic.generation = function (pop, generation, stats) {
    };

    genetic.finalresult = [];
    genetic.notification = function (pop, generation, stats, isFinished) {

        // console.log('generation+1 : ' + generation+1);
        // console.log('pop[0].entity : ' + pop[0].entity);
        console.log(((generation / iteration) * 100).toPrecision(2) + '% -> fitness : ' + pop[0].fitness);
        // console.log('stats.mean.toPrecision(4) : ' + stats.mean.toPrecision(4));
        // console.log('stats.stdev.toPrecision(4) : ' + stats.stdev.toPrecision(4));

        // console.log('pop[0] : ' + JSON.stringify(pop[0]));
        // console.log('isFinished : ' + isFinished);
        // console.log('stats : ' + JSON.stringify(stats));
        // console.log('generation : ' + JSON.stringify(generation));
        if (isFinished) {
            let ZWM = this.userData["ZeroWeightModel"];
            let NewModel = Object.assign([], ZWM);
            NewModel.forEach(function (m, j) {
                m.weight = pop[0].entity[j];
            }.bind(pop[0]));

            genetic.finalresult = {Model: NewModel, fitness: pop[0].fitness};
        }
    };

    let config = {
        "size": 200,
        "crossover": 0.01,
        "mutation": 0.2,
        "iterations": iteration,
        "fittestAlwaysSurvives": true,
        "maxResults": 100,
        "webWorkers": true,
        "skip": 10
    };
    let userData = {
        "ZeroWeightModel": ZeroWeightModel,
        "OrderedBestChoices": OrderedBestChoices
    };
    genetic.evolve(config, userData);

    genetic.finalresult.best = chooseLinear(genetic.finalresult.Model, OrderedBestChoices);

    return genetic.finalresult;
};

module.exports = {
    all: ['chooseLinear(model, choices)',],
    chooseLinear: chooseLinear,
    findLinearModelWeights: findLinearModelWeights,
    findLinearModelWeightsWithLargDist: findLinearModelWeightsWithLargDist
};