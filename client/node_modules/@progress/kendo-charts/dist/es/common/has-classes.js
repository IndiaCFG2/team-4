export default function hasClasses(element, classNames) {
    if (element.className) {
        var names = classNames.split(" ");
        for (var idx = 0; idx < names.length; idx++) {
            if (element.className.indexOf(names[idx]) !== -1) {
                return true;
            }
        }
    }
}