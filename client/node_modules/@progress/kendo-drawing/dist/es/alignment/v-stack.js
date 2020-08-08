import stackElements from './stack-elements';
import createStackElements from './create-stack-elements';

export default function vStack(elements) {
    stackElements(createStackElements(elements), "y", "x", "height");
}