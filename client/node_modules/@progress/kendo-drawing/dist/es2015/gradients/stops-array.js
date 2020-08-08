import ElementsArray from '../shapes/elements-array';

class StopsArray extends ElementsArray {
    _change() {
        this.optionsChange({
            field: "stops"
        });
    }
}

export default StopsArray;