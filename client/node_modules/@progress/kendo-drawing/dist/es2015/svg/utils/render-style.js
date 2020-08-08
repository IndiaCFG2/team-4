import { defined } from '../../util';

export default function renderStyle(attrs) {
    let output = "";
    for (let i = 0; i < attrs.length; i++) {
        let value = attrs[i][1];
        if (defined(value)) {
            output += attrs[i][0] + ":" + value + ";";
        }
    }

    if (output !== "") {
        return output;
    }
}