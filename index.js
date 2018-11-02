/**
 * Created by ghiassi on 11/19/17.
 */


let LinearModel = require('./src/LinearChoiceModel.js');
let BayesianInference = require('./src/BayesianInference.js');

module.exports = {
    chooseLinear: LinearModel.chooseLinear,
    findLinearModelWeights: LinearModel.findLinearModelWeights,
    findLinearModelWeightsWithLargDist: LinearModel.findLinearModelWeightsWithLargDist,
    findProbability4Bayes: BayesianInference.findProbability4Bayes,
    inferBayesian: BayesianInference.inferBayesian,
};
