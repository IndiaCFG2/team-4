import Ring from './ring';

class Sector extends Ring {
    constructor(center, radius, startAngle, angle) {
        super(center, 0, radius, startAngle, angle);
    }

    expand(value) {
        return super.expand(value);
    }

    clone() {
        return new Sector(this.center, this.radius, this.startAngle, this.angle);
    }

    setRadius(newRadius) {
        this.radius = newRadius;

        return this;
    }
}

export default Sector;