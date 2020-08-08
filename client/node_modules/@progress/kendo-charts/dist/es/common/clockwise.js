export default function clockwise(angle1, angle2) {
    // True if angle2 is clockwise of angle1
    // assuming angles grow in clock-wise direction
    // (as in the pie and radar charts)
    return -angle1.x * angle2.y + angle1.y * angle2.x < 0;
}