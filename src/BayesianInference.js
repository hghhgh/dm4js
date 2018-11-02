
/**
 * Baysian inference functions
 * target is P(Hypothesis | Evidence) = P(H and E) / P(E)
 * H+(or Hp) means the target is sick
 * H-(or Hn) means the target is healthy
 * E+(or Ep) means the Evidence is occured
 * E-(or En) means the Evidence isn't occured
 *
 * P_Hp = .0; // from our knowledge or litrature of prevalence of Hypothesis
 * P_Ep_Hp = .0; // from sensitivity  of the test that provides the evidence
 * P_En_Hn = .0; // from specification of the test that provides the evidence
 */
function findProbabilities(P_Hp, P_Ep_Hp, P_En_Hn) {
    //  if P(H+)
    //  P_Hp
    //  P_Ep_Hp
    let P_En_Hp = 1 - P_Ep_Hp;

    // if P(H-)
    let P_Hn = 1.0 - P_Hp;
    //  P_Tn_Hn
    let P_Ep_Hn = 1 - P_En_Hn;

    let res = {
        P_Hp: P_Hp,
        P_Ep_Hp: P_Ep_Hp,
        P_En_Hp: P_En_Hp,
        P_Hn: P_Hn,
        P_Ep_Hn: P_Ep_Hn,
        P_En_Hn: P_En_Hn
    };

    // console.log('res', res);


    return res;

}

/**
 * Infer based on Bayes rule
 *
 * return : the probability of being sick given positive evidence
 */
function inferBayesian(probs) {
    let P_HpEp = probs.P_Hp * probs.P_Ep_Hp;
    let P_HnEp = probs.P_Hn * probs.P_Ep_Hn;

    let denom = P_HpEp + P_HnEp;

    // console.log('P_HpEp', P_HpEp);
    // console.log('P_HnEp', P_HnEp);
    // console.log('denom', denom);
    // P_Hp_Ep
    return P_HpEp / denom;
}

module.exports = {
    // all: ['chooseLinear(model, choices)',],
    findProbability4Bayes: findProbabilities,
    inferBayesian: inferBayesian
};
