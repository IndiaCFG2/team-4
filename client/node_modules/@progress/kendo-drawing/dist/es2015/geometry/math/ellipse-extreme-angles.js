export default function ellipseExtremeAngles(center, rx, ry, matrix) {
    let extremeX = 0;
    let extremeY = 0;

    if (matrix) {
        extremeX = Math.atan2(matrix.c * ry, matrix.a * rx);
        if (matrix.b !== 0) {
            extremeY = Math.atan2(matrix.d * ry, matrix.b * rx);
        }
    }

    return {
        x: extremeX,
        y: extremeY
    };
}