import ChartAxis from './chart-axis';

export default function findAxisByName(name, axes) {
    for (let idx = 0; idx < axes.length; idx++) {
        if (axes[idx].options.name === name) {
            axes[idx].prepareUserOptions();
            return new ChartAxis(axes[idx]);
        }
    }
}