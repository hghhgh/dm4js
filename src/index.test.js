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
            expect(dm4js.chooseLinear(model, choices)).to.satisfy(function (res) {
                return res == 2;
            });

        });
    });

});