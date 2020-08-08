export class Gauge {
    constructor(element: any, options: any, theme: any, context: any);

    public redraw(): void;
    public resize(): void;
    public noTransitionsRedraw(): void;

    public setOptions(options: any, theme: any): void;
}

export class RadialGauge extends Gauge {
}

export class LinearGauge extends Gauge {
    setDirection(rtl: boolean): void;
}

export class ArcGauge extends Gauge {
    currentColor(): string;

    centerLabelPosition(width: number, height: number): any;
}