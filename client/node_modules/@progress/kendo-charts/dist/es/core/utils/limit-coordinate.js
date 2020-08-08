import { COORDINATE_LIMIT } from '../constants';

export default function limitCoordinate(value) {
    return Math.max(Math.min(value, COORDINATE_LIMIT), -COORDINATE_LIMIT);
}