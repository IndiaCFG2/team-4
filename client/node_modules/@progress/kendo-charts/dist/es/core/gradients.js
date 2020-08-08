import { WHITE } from '../common/constants';

var LINEAR = "linear";
var RADIAL = "radial";

var GRADIENTS = {
    glass: {
        type: LINEAR,
        rotation: 0,
        stops: [ {
            offset: 0,
            color: WHITE,
            opacity: 0
        }, {
            offset: 0.25,
            color: WHITE,
            opacity: 0.3
        }, {
            offset: 1,
            color: WHITE,
            opacity: 0
        } ]
    },
    sharpBevel: {
        type: RADIAL,
        stops: [ {
            offset: 0,
            color: WHITE,
            opacity: 0.55
        }, {
            offset: 0.65,
            color: WHITE,
            opacity: 0
        }, {
            offset: 0.95,
            color: WHITE,
            opacity: 0.25
        } ]
    },
    roundedBevel: {
        type: RADIAL,
        stops: [ {
            offset: 0.33,
            color: WHITE,
            opacity: 0.06
        }, {
            offset: 0.83,
            color: WHITE,
            opacity: 0.2
        }, {
            offset: 0.95,
            color: WHITE,
            opacity: 0
        } ]
    },
    roundedGlass: {
        type: RADIAL,
        supportVML: false,
        stops: [ {
            offset: 0,
            color: WHITE,
            opacity: 0
        }, {
            offset: 0.5,
            color: WHITE,
            opacity: 0.3
        }, {
            offset: 0.99,
            color: WHITE,
            opacity: 0
        } ]
    },
    sharpGlass: {
        type: RADIAL,
        supportVML: false,
        stops: [ {
            offset: 0,
            color: WHITE,
            opacity: 0.2
        }, {
            offset: 0.15,
            color: WHITE,
            opacity: 0.15
        }, {
            offset: 0.17,
            color: WHITE,
            opacity: 0.35
        }, {
            offset: 0.85,
            color: WHITE,
            opacity: 0.05
        }, {
            offset: 0.87,
            color: WHITE,
            opacity: 0.15
        }, {
            offset: 0.99,
            color: WHITE,
            opacity: 0
        } ]
    },
    bubbleShadow: {
        type: RADIAL,
        center: [ 0.5, 0.5 ],
        radius: 0.5
    }
};

export default GRADIENTS;