/**
 * Created by ghiassi on 11/19/17.
 */

let expect = require('chai').expect;
let dm4js = require('./index');


describe('dm4js', function () {
    describe('chooseLinear', function () {
        it('should select best SSD drive : index 2', function () {

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
            expect(dm4js.chooseLinear(model, choices)).to.satisfy(function (res) {
                return res.BestIndex == 2;
            });

        });
    });

    describe('findLinearModelWeights', function () {
        this.timeout(10000);

        it('should extract the values', function () {

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
            let orderedchoices = [
                [300000, 240, 1500000, 'TLC'], // SSD Pioneer APS-SL2
                [425000, 240, 1750000, 'MLC'], // SSD San Disk SSD PLUS
                [395000, 240, 2000000, '3D NAND'],  // SSD Adata SU650
                [361000, 240, 1000000, 'TLC'], // SSD Panther AS330
            ];
            expect(dm4js.findLinearModelWeights(model, orderedchoices)).to.satisfy(function (res) {
                console.log('res = ' + JSON.stringify(res));
                // [.5, .4, .6, .3]
                return res.fitness <= 0.00001;
            });
        });
    });

});