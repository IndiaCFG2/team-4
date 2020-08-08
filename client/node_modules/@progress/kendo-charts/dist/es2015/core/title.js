import ChartElement from './chart-element';
import TextBox from './text-box';

import { X, BLACK, TOP, CENTER } from '../common/constants';
import { getSpacing, setDefaultOptions } from '../common';

class Title extends ChartElement {
    constructor(options) {
        super(options);

        this.append(
            new TextBox(this.options.text, Object.assign({}, this.options, {
                vAlign: this.options.position
            }))
        );
    }

    reflow(targetBox) {
        super.reflow(targetBox);
        this.box.snapTo(targetBox, X);
    }

    static buildTitle(options, parent, defaultOptions) {
        let titleOptions = options;

        if (typeof options === "string") {
            titleOptions = { text: options };
        }

        titleOptions = Object.assign({ visible: true }, defaultOptions, titleOptions);

        let title;
        if (titleOptions && titleOptions.visible && titleOptions.text) {
            title = new Title(titleOptions);
            parent.append(title);
        }

        return title;
    }
}

setDefaultOptions(Title, {
    color: BLACK,
    position: TOP,
    align: CENTER,
    margin: getSpacing(5),
    padding: getSpacing(5)
});

export default Title;