import { Chart } from './chart';

export class Navigator {
    redrawSlaves(): void;
}

export class StockChart extends Chart {
    navigator: Navigator;
}