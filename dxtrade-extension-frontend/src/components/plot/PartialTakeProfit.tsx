import React, { useState } from "react"
import { PatialTakeProfitProps } from "./plot.interfaces"
import { PriceLine, PriceLineProps } from "./PriceLine";
import { format } from "d3-format";
import { GenericChartComponent, getMouseCanvas } from "react-financial-charts";

export class PartialTakeProfit extends React.Component<PatialTakeProfitProps> {
    private price: number;
    private dragStartValue: number | null = null;
    private isDragging: boolean = false;

    constructor(props: PatialTakeProfitProps) {
        super(props);
        this.price = props.edge.close;
    }

    private readonly onHover = () => {

    }

    private readonly isHover = (moreProps: any) => {
        const {
            chartConfig: { yScale },
        } = moreProps;
        const yVal = yScale(this.price);

        const {
            mouseXY: [x, y],
        } = moreProps;

        if (y >= yVal - 10 && y <= yVal + 10) {
            return true;
        }
        return false;
    };

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const props: PriceLineProps = {
            at: "right",
            orient: "right",
            price: this.price,
            stroke: "#aaaaff",
            lineStroke: '#aaaaff',
            strokeWidth: 0.5,
            fill: "#aaaaff",
            textFill: "white",
            strokeDasharray: "Solid",
            displayFormat: format(".3f")
        }
        const line = new PriceLine(props);
        line.drawOnCanvas(ctx, moreProps)
    }

    private readonly onDrag = (e: React.MouseEvent, moreProps: any) => {
        const startValue = this.dragStartValue;

        const {
            chartConfig: { yScale },
        } = moreProps;
        const { startPos, mouseXY } = moreProps;
        const baseY = yScale(this.props.edge.close);
        const prevY = yScale(startValue);
        const dy = startPos[1] - mouseXY[1];
        const newY = this.props.position.isLong ? Math.min(baseY, prevY - dy) : Math.max(baseY, prevY - dy);
        const newTakeProfitValue = yScale.invert(newY);
        this.price = newTakeProfitValue;
        console.log(newTakeProfitValue)
    }

    private readonly onDragComplete = (e: React.MouseEvent, moreProps: any) => {
        this.dragStartValue = null;
        this.isDragging = false;
        const event = new CustomEvent('partialTp', { detail: { position: this.props.position, price: this.price, positionId: this.props.positionId } });
        window.dispatchEvent(event);
    }

    private readonly onDragStart = () => {
        console.log('onDragStart')
        this.dragStartValue = this.price ? this.price : this.props.edge.close;
    }

    public render() {
        return (
            <g>
                {/* <PriceLine
                    at="right"
                    orient="right"
                    price={this.price}
                    stroke="#aaaaff"
                    lineStroke='#aaaaff'
                    strokeWidth={0.5}
                    fill="#aaaaff"
                    textFill="white"
                    strokeDasharray="Solid"
                    displayFormat={format(".3f")}
                /> */}
                <GenericChartComponent
                    clip={false}
                    isHover={this.isHover}
                    canvasToDraw={getMouseCanvas}
                    canvasDraw={this.drawOnCanvas}
                    // interactiveCursorClass={interactiveCursorClass}
                    selected={true}
                    onDragStart={this.onDragStart}
                    onDrag={(e, moreProps) => this.onDrag(e, moreProps)}
                    onDragComplete={this.onDragComplete}
                    onHover={() => { }}
                    // onUnHover={onUnHover}
                    drawOn={["mousemove", "mouseleave", "pan", "drag"]}
                />
            </g>
        )
    }
}