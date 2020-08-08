import ChartElement from './chart-element';
import TextBox from './text-box';

import { X, BLACK, TOP, CENTER } from '../common/constants';
import { getSpacing, setDefaultOptions } from '../common';

var Title = (function (ChartElement) {
    function Title(options) {
        ChartElement.call(this, options);

        this.append(
            new TextBox(this.options.text, Object.assign({}, this.options, {
                vAlign: this.options.position
            }))
        );
    }

    if ( ChartElement ) Title.__proto__ = ChartElement;
    Title.prototype = Object.create( ChartElement && ChartElement.prototype );
    Title.prototype.constructor = Title;

    Title.prototype.reflow = function reflow (targetBox) {
        ChartElement.prototype.reflow.call(this, targetBox);
        this.box.snapTo(targetBox, X);
    };

    Title.buildTitle = function buildTitle (options, parent, defaultOptions) {
        var titleOptions = options;

        if (typeof options === "string") {
            titleOptions = { text: options };
        }

        titleOptions = Object.assign({ visible: true }, defaultOptions, titleOptions);

        var title;
        if (titleOptions && titleOptions.visible && titleOptions.text) {
            title = new Title(titleOptions);
            parent.append(title);
        }

        return title;
    };

    return Title;
}(ChartElement));

setDefaultOptions(Title, {
    color: BLACK,
    position: TOP,
    align: CENTER,
    margin: getSpacing(5),
    padding: getSpacing(5)
});

export default Title;