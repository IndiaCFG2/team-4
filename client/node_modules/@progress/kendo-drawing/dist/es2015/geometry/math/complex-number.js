import { PRECISION } from '../constants';
import { Class } from '../../common';
import { round } from '../../util';

class ComplexNumber extends Class {

    constructor(real = 0, img = 0) {
        super();

        this.real = real;
        this.img = img;
    }

    add(cNumber) {
        return new ComplexNumber(round(this.real + cNumber.real, PRECISION), round(this.img + cNumber.img, PRECISION));
    }

    addConstant(value) {
        return new ComplexNumber(this.real + value, this.img);
    }

    negate() {
        return new ComplexNumber(-this.real, -this.img);
    }

    multiply(cNumber) {
        return new ComplexNumber(this.real * cNumber.real - this.img * cNumber.img,
            this.real * cNumber.img + this.img * cNumber.real);
    }

    multiplyConstant(value) {
        return new ComplexNumber(this.real * value, this.img * value);
    }

    nthRoot(n) {
        const rad = Math.atan2(this.img, this.real);
        const r = Math.sqrt(Math.pow(this.img, 2) + Math.pow(this.real, 2));
        const nthR = Math.pow(r, 1 / n);

        return new ComplexNumber(nthR * Math.cos(rad / n), nthR * Math.sin(rad / n)); //Moivre's formula
    }

    equals(cNumber) {
        return this.real === cNumber.real && this.img === cNumber.img;
    }

    isReal() {
        return this.img === 0;
    }
}

export default ComplexNumber;