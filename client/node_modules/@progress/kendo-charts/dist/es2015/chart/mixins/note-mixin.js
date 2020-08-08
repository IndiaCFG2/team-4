import { Note } from '../../core';
import { defined } from '../../common';

const NoteMixin = {
    createNote: function() {
        const options = this.options.notes;
        const text = this.noteText || options.label.text;

        if (options.visible !== false && defined(text) && text !== null) {
            this.note = new Note({
                value: this.value,
                text: text,
                dataItem: this.dataItem,
                category: this.category,
                series: this.series
            }, this.options.notes, this.owner.chartService);

            this.append(this.note);
        }
    }
};

export default NoteMixin;