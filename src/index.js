/**
 * Created by ghiassi on 11/19/17.
 */

// let Genetic = require("genetic-js");


// normalize choices values
let normalizeChoices = function (model, choices) {

    return choices.map(function (cv) {
        let normed = [];
        cv.forEach(function (iv, i) {
            if (model[i].type == 'numerical') {
                let max = Math.max.apply(Math, choices.map(function (v) {
                    return v[i]
                }));
                let min = Math.min.apply(Math, choices.map(function (v) {
                    return v[i]
                }));
                if (min == max) {
                    normed.push(0.0);
                } else {
                    normed.push((cv[i] - min) / (max - min))
                }
            } else if (model[i].type == 'ordered') {
                let len = model[i].categories.length;
                let dto = model[i].categories.findIndex(function (val) {
                    return val == cv[i];
                });
                normed.push(dto / len);
            }
        }, [normed, choices]);
        return normed;
    });

};

/*
 This function uses Linear Scalarization technique of multi-objective optimization
 model includes : {
 label of the parameter
 weight is the array of positive values
 way is the array of the target that should be 'min' or 'max'
 type : 'numerical', 'ordered'
 categories: ['val1', 'val2', 'val3', ...] only for ordered type
 }
 choices is an array of data point (each data point is an array too)
 return the index of the best choice (means that the data with lowset score)
 return value is zero-based index
 */
let chooseLinear = function (model, choices) {
    // nomalize
    let normchoices = normalizeChoices(model, choices);
    // console.log((normchoices));


    // Score data
    let scores = [];
    normchoices.forEach(function (chs) {
        let score = 0.0;
        model.forEach(function (m, j) {
            score += m.way == 'min' ? m.weight * chs[j] : m.weight * (1.0 - chs[j]); // all data are in range [0,1]
            // console.log([m.way, m.weight, chs[j], score]);
        }.bind(score));
        // console.log(score);
        scores.push(score);
    }.bind(scores));

    // select best choice
    return scores.findIndex(function (val) {
        return val == Math.min.apply(Math, scores);
    });
};


module.exports = {
    all: 'nothing',
    chooseLinear: chooseLinear
};