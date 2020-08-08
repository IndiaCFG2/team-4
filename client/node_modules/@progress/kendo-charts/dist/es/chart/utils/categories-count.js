export default function categoriesCount(series) {
    var seriesCount = series.length;
    var categories = 0;

    for (var i = 0; i < seriesCount; i++) {
        categories = Math.max(categories, series[i].data.length);
    }

    return categories;
}