export default function hasClasses(element, classNames) {
    if (element.className) {
        const names = classNames.split(" ");
        for (let idx = 0; idx < names.length; idx++) {
            if (element.className.indexOf(names[idx]) !== -1) {
                return true;
            }
        }
    }
}