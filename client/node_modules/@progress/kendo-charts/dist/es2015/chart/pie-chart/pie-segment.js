import { drawing as draw, geometry as geom, Color } from '@progress/kendo-drawing';

import { ChartElement, ShapeBuilder, TextBox, Box } from '../../core';

import PointEventsMixin from '../mixins/point-events-mixin';

import { OUTSIDE_END, INSIDE_END, PIE, FADEIN, TOOLTIP_OFFSET } from '../constants';
import hasGradientOverlay from '../utils/has-gradient-overlay';

import { TOP, BOTTOM, LEFT, RIGHT, DEFAULT_FONT, CIRCLE, WHITE, BLACK, CENTER, DEFAULT_PRECISION } from '../../common/constants';
import { setDefaultOptions, getSpacing, getTemplate, deepExtend, round, rad } from '../../common';

class PieSegment extends ChartElement {
    constructor(value, sector, options) {
        super(options);

        this.value = value;
        this.sector = sector;
    }

    render() {
        const labels = this.options.labels;
        const chartService = this.owner.chartService;
        let labelText = this.value;

        if (this._rendered || this.visible === false) {
            return;
        }
        this._rendered = true;

        const labelTemplate = getTemplate(labels);
        const pointData = this.pointData();

        if (labelTemplate) {
            labelText = labelTemplate(pointData);
        } else if (labels.format) {
            labelText = chartService.format.auto(labels.format, labelText);
        }

        if (labels.visible && (labelText || labelText === 0)) {
            if (labels.position === CENTER || labels.position === INSIDE_END) {
                if (!labels.color) {
                    const brightnessValue = new Color(this.options.color).percBrightness();
                    if (brightnessValue > 180) {
                        labels.color = BLACK;
                    } else {
                        labels.color = WHITE;
                    }
                }
                if (!labels.background) {
                    labels.background = this.options.color;
                }
            } else {
                const themeLabels = chartService.theme.seriesDefaults.labels;
                labels.color = labels.color || themeLabels.color;
                labels.background = labels.background || themeLabels.background;
            }


            this.label = new TextBox(labelText, deepExtend({}, labels, {
                align: CENTER,
                vAlign: "",
                animation: {
                    type: FADEIN,
                    delay: this.animationDelay
                }
            }), pointData);

            this.append(this.label);
        }
    }

    reflow(targetBox) {
        this.render();
        this.box = targetBox;
        this.reflowLabel();
    }

    reflowLabel() {
        const { options: { labels: labelsOptions }, label } = this;
        const sector = this.sector.clone();
        const labelsDistance = labelsOptions.distance;
        const angle = sector.middle();

        if (label) {
            const labelHeight = label.box.height();
            const labelWidth = label.box.width();
            let lp;

            if (labelsOptions.position === CENTER) {
                sector.radius = Math.abs((sector.radius - labelHeight) / 2) + labelHeight;
                lp = sector.point(angle);
                label.reflow(new Box(lp.x, lp.y - labelHeight / 2, lp.x, lp.y));
            } else if (labelsOptions.position === INSIDE_END) {
                sector.radius = sector.radius - labelHeight / 2;
                lp = sector.point(angle);
                label.reflow(new Box(lp.x, lp.y - labelHeight / 2, lp.x, lp.y));
            } else {
                let x1;
                lp = sector.clone().expand(labelsDistance).point(angle);
                if (lp.x >= sector.center.x) {
                    x1 = lp.x + labelWidth;
                    label.orientation = RIGHT;
                } else {
                    x1 = lp.x - labelWidth;
                    label.orientation = LEFT;
                }
                label.reflow(new Box(x1, lp.y - labelHeight, lp.x, lp.y));
            }
        }
    }

    createVisual() {
        const { sector, options } = this;

        super.createVisual();

        if (this.value) {
            if (options.visual) {
                const startAngle = (sector.startAngle + 180) % 360;
                const visual = options.visual({
                    category: this.category,
                    dataItem: this.dataItem,
                    value: this.value,
                    series: this.series,
                    percentage: this.percentage,
                    center: new geom.Point(sector.center.x, sector.center.y),
                    radius: sector.radius,
                    innerRadius: sector.innerRadius,
                    startAngle: startAngle,
                    endAngle: startAngle + sector.angle,
                    options: options,
                    sender: this.getSender(),
                    createVisual: () => {
                        const group = new draw.Group();
                        this.createSegmentVisual(group);

                        return group;
                    }
                });

                if (visual) {
                    this.visual.append(visual);
                }
            } else {
                this.createSegmentVisual(this.visual);
            }
        }
    }

    createSegmentVisual(group) {
        const { sector, options } = this;
        const borderOptions = options.border || {};
        const border = borderOptions.width > 0 ? {
            stroke: {
                color: borderOptions.color,
                width: borderOptions.width,
                opacity: borderOptions.opacity,
                dashType: borderOptions.dashType
            }
        } : {};
        const color = options.color;
        const fill = {
            color: color,
            opacity: options.opacity
        };
        const visual = this.createSegment(sector, deepExtend({
            fill: fill,
            stroke: {
                opacity: options.opacity
            },
            zIndex: options.zIndex
        }, border));

        group.append(visual);

        if (hasGradientOverlay(options)) {
            group.append(this.createGradientOverlay(visual, {
                baseColor: color,
                fallbackFill: fill
            }, deepExtend({
                center: [ sector.center.x, sector.center.y ],
                innerRadius: sector.innerRadius,
                radius: sector.radius,
                userSpace: true
            }, options.overlay)));
        }
    }

    createSegment(sector, options) {
        if (options.singleSegment) {
            return new draw.Circle(new geom.Circle(new geom.Point(sector.center.x, sector.center.y), sector.radius), options);
        }

        return ShapeBuilder.current.createRing(sector, options);
    }

    createAnimation() {
        const { options, sector: { center } } = this;

        deepExtend(options, {
            animation: {
                center: [ center.x, center.y ],
                delay: this.animationDelay
            }
        });

        super.createAnimation();
    }

    createHighlight(options) {
        const highlight = this.options.highlight || {};
        const border = highlight.border || {};

        return this.createSegment(this.sector, deepExtend({}, options, {
            fill: {
                color: highlight.color,
                opacity: highlight.opacity
            },
            stroke: {
                opacity: border.opacity,
                width: border.width,
                color: border.color
            }
        }));
    }

    highlightVisual() {
        return this.visual.children[0];
    }

    highlightVisualArgs() {
        const sector = this.sector;

        return {
            options: this.options,
            radius: sector.radius,
            innerRadius: sector.innerRadius,
            center: new geom.Point(sector.center.x, sector.center.y),
            startAngle: sector.startAngle,
            endAngle: sector.angle + sector.startAngle,
            visual: this.visual
        };
    }

    tooltipAnchor() {
        const sector = this.sector.clone().expand(TOOLTIP_OFFSET);
        const midAndle = sector.middle();
        const midPoint = sector.point(midAndle);

        return {
            point: midPoint,
            align: tooltipAlignment(midAndle + 180)
        };
    }

    formatValue(format) {
        return this.owner.formatPointValue(this, format);
    }

    pointData() {
        return {
            dataItem: this.dataItem,
            category: this.category,
            value: this.value,
            series: this.series,
            percentage: this.percentage
        };
    }
}

const RAD_30 = round(rad(30), DEFAULT_PRECISION);
const RAD_60 = round(rad(60), DEFAULT_PRECISION);

function tooltipAlignment(angle) {
    const radians = rad(angle);
    const sine = round(Math.sin(radians), DEFAULT_PRECISION);
    const cosine = round(Math.cos(radians), DEFAULT_PRECISION);


    let horizontal;
    if (Math.abs(sine) > RAD_60) {
        horizontal = CENTER;
    } else if (cosine < 0) {
        horizontal = RIGHT;
    } else {
        horizontal = LEFT;
    }

    let vertical;
    if (Math.abs(sine) < RAD_30) {
        vertical = CENTER;
    } else if (sine < 0) {
        vertical = BOTTOM;
    } else {
        vertical = TOP;
    }

    return {
        horizontal: horizontal,
        vertical: vertical
    };
}

setDefaultOptions(PieSegment, {
    color: WHITE,
    overlay: {
        gradient: "roundedBevel"
    },
    border: {
        width: 0.5
    },
    labels: {
        visible: false,
        distance: 35,
        font: DEFAULT_FONT,
        margin: getSpacing(0.5),
        align: CIRCLE,
        zIndex: 1,
        position: OUTSIDE_END
    },
    animation: {
        type: PIE
    },
    highlight: {
        visible: true,
        border: {
            width: 1
        }
    },
    visible: true
});

deepExtend(PieSegment.prototype, PointEventsMixin);

export default PieSegment;