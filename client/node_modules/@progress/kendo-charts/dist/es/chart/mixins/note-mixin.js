import { Note } from '../../core';
import { defined } from '../../common';

var NoteMixin = {
    createNote: function() {
        var options = this.options.notes;
        var text = this.noteText || options.label.text;

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