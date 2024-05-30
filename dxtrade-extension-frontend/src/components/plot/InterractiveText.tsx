import * as React from "react";
import { getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";

export interface InteractiveTextProps {
    readonly bgFillStyle: string;
    readonly bgStrokeWidth: number;
    readonly bgStroke: string;
    readonly defaultClassName?: string;
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly fontWeight: number | string;
    readonly fontStyle: string;
    readonly onDragStart?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDrag?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onUnHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onClick?: (e: React.MouseEvent, moreProps: any) => void;
    readonly position?: [number | Date | null, number | null];
    readonly positionScaled?: [number | null, number | null];
    readonly interactiveCursorClass?: string;
    readonly selected: boolean;
    readonly text: string;
    readonly textFill: string;
    readonly tolerance: number;
    readonly minWidth: number;
    readonly width?: number;
    readonly align: 'top' | 'bottom' | 'middle';
}

export class InteractiveText extends React.Component<InteractiveTextProps> {
    public static defaultProps = {
        type: "SD", // standard dev
        fontWeight: "normal", // standard dev
        tolerance: 4,
        selected: false,
        minWidth: 0,
        align: 'top'
    };

    private calculateTextWidth = true;
    private textWidth?: number;

    public componentDidUpdate(previousProps: InteractiveTextProps) {
        this.calculateTextWidth =
            previousProps.text !== this.props.text ||
            previousProps.fontStyle !== this.props.fontStyle ||
            previousProps.fontWeight !== this.props.fontWeight ||
            previousProps.fontSize !== this.props.fontSize ||
            previousProps.fontFamily !== this.props.fontFamily;
    }

    public render() {
        const { selected, interactiveCursorClass } = this.props;
        const { onHover, onUnHover, onClick } = this.props;
        const { onDragStart, onDrag, onDragComplete } = this.props;
        return (
            <GenericChartComponent
                isHover={this.isHover}
                canvasToDraw={getMouseCanvas}
                canvasDraw={this.drawOnCanvas}
                interactiveCursorClass={interactiveCursorClass}
                selected={selected}
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragComplete={onDragComplete}
                onHover={onHover}
                onUnHover={onUnHover}
                onClickWhenHover={onClick ?? (() => {})}
                drawOn={["mousemove", "mouseleave", "pan", "drag"]}
            />
        );
    }

    private readonly isHover = (moreProps: any) => {
        const { onHover } = this.props;

        if (onHover !== undefined && this.textWidth !== undefined && !this.calculateTextWidth) {
            const { rect } = this.helper(moreProps, this.textWidth);
            const {
                mouseXY: [x, y],
            } = moreProps;

            if (x >= rect.x && y >= rect.y && x <= rect.x + rect.width && y <= rect.y + rect.height) {
                return true;
            }
        }
        return false;
    };

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { bgFillStyle, bgStrokeWidth, bgStroke, textFill, fontFamily, fontSize, fontStyle, fontWeight, text, align, width } =
            this.props;

        if (this.calculateTextWidth) {
            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
            const { width } = ctx.measureText(text);
            this.textWidth = width;
            this.calculateTextWidth = false;
        }

        const { selected } = this.props;

        const { x, y, rect } = this.helper(moreProps, this.textWidth ?? 0);

        ctx.fillStyle = bgFillStyle;

        ctx.beginPath();
        ctx.fillRect(rect.x, rect.y, width ?? rect.width, rect.height);

        if (selected) {
            ctx.strokeStyle = bgStroke;
            ctx.lineWidth = bgStrokeWidth;
            ctx.strokeRect(rect.x, rect.y, width ?? rect.width, rect.height);
        }

        ctx.fillStyle = textFill;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

        ctx.beginPath();
        ctx.fillText(text, rect.x + (width ?? rect.width) / 2 , y + (align === 'top' ? -fontSize : align === 'bottom' ? fontSize : 0));
    };

    private readonly helper = (moreProps: any, textWidth: number) => {
        const { position, positionScaled, fontSize, minWidth, align } = this.props;

        const {
            xScale,
            chartConfig: { yScale },
        } = moreProps;

        const [xValue, yValue] = position || [];
        const [xScaled, yScaled] = positionScaled || [];
        const x = xScaled ?? xScale(xValue);
        const y = yScaled ?? yScale(yValue);

        const rect = {
            x: x - Math.max(minWidth / 2, textWidth / 2 - fontSize),
            y: y - fontSize + (align === 'top' ? - fontSize : align === 'bottom' ? fontSize : 0),
            width: Math.max(minWidth, textWidth + fontSize * 2),
            height: fontSize * 2,
        };

        return {
            x,
            y,
            rect,
        };
    };
}