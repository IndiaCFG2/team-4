export default function categoriesCount(series) {
    const seriesCount = series.length;
    let categories = 0;

    for (let i = 0; i < seriesCount; i++) {
        categories = Math.max(categories, series[i].data.length);
    }

    return categories;
}