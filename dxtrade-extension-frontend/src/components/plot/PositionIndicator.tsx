import React from 'react';
import {
  getAxisCanvas,
  GenericChartComponent,
} from "@react-financial-charts/core";
import { PositionIndicatorProps } from './plot.interfaces';
import { format } from 'd3-format';
import { InteractiveText } from './InterractiveText';
import { EdgeIndicator, PriceCoordinate, getMouseCanvas } from 'react-financial-charts';
import { PriceLine } from './PriceLine';

export const PositionIndicator: React.FC<PositionIndicatorProps> = (props) => {

  const { xStart, tpZones, slZone, opacity, side, baseYValue, positionLabel, handleDragStart, handleStopLossDrag, handleTakeProfitDrag, handlePositionDrag, handleDragComplete } = props;
  const dragStartValue = React.useRef<number | null>(null);
  const dragStartX = React.useRef<number | null>(null);

  const drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
    const edges = getEdges(props, moreProps);
    if (!edges) {
      return;
    }

    const { x1, x2, baseY, slZoneY, tpZonesY } = edges;

    // ctx.restore();
    ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`; // Green with 30% opacity

    tpZonesY.forEach((zoneEndY, i, zones) => {
      const zoneStartY = zones[i - 1] ?? baseY;

      ctx.beginPath();
      ctx.moveTo(x1, zoneStartY);
      ctx.lineTo(x2, zoneStartY);
      ctx.lineTo(x2, zoneEndY);
      ctx.lineTo(x1, zoneEndY);
      ctx.closePath();
      ctx.fill();
    })

    // draw sl zone
    ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
    ctx.beginPath();
    ctx.moveTo(x1, baseY);
    ctx.lineTo(x2, baseY);
    ctx.lineTo(x2, slZoneY);
    ctx.lineTo(x1, slZoneY);

    ctx.closePath();
    ctx.fill();

  };

  const getEdges = (props: PositionIndicatorProps, moreProps: any) => {
    const {
      tpZones,
      slZone,
      baseYValue,
      xStart,
      xEnd,
    } = props;
  
    const {
      xScale,
      chartConfig: { yScale },
    } = moreProps;
  
    const yValue = baseYValue
    if (yValue === undefined) {
      return;
    }
    const x1 = xScale(xStart) - 150;
    const x2 = xEnd ? xScale(xEnd) : x1 + 300;
    const baseY = yScale(yValue);
    const slZoneY = yScale(slZone.y);
    const tpZonesY = tpZones.map(zone => yScale(zone.y));

    return {
      x1,
      x2, baseY,
      slZoneY,
      tpZonesY,
    };
  };

  const onDragStart = (startX: number | null, startY: number) => {
    dragStartX.current = startX;
    dragStartValue.current = startY;
  }

  const onStopLossDrag = (e: React.MouseEvent, moreProps: any) => {
    const startValue = dragStartValue.current;

    const {
        chartConfig: { yScale },
    } = moreProps;
    const { startPos, mouseXY } = moreProps;
    const baseY = yScale(baseYValue);
    const prevY = yScale(startValue);
    const dy = startPos[1] - mouseXY[1];
    const newY = side === 'long' ? Math.max(baseY, prevY - dy) : Math.min(baseY, prevY - dy);
    const newStopLossValue = yScale.invert(newY);

    handleStopLossDrag(e, {
      sl: newStopLossValue,
    });
  }

  const onTakeProfitDrag = (e: React.MouseEvent, zoneIndex: number, moreProps: any) => {
    const startValue = dragStartValue.current;

    const {
        chartConfig: { yScale },
    } = moreProps;
    const { startPos, mouseXY } = moreProps;
    const baseY = yScale(baseYValue);
    const prevY = yScale(startValue);
    const dy = startPos[1] - mouseXY[1];
    const newY = side === 'long' ? Math.min(baseY, prevY - dy) : Math.max(baseY, prevY - dy);
    const newTakeProfitValue = yScale.invert(newY);

    handleTakeProfitDrag(e, {
      tp: newTakeProfitValue,
      zoneIndex,
    });
  }

  const onPositionDrag = (e: React.MouseEvent, moreProps: any) => {
    const startValue = dragStartValue.current;

    const {
        chartConfig: { yScale },
        xScale,
    } = moreProps;
    const { startPos, mouseXY } = moreProps;
    const prevY = yScale(startValue);
    const dy = startPos[1] - mouseXY[1];
    const newY = prevY - dy;
    const newOpenPriceValue = yScale.invert(newY);
    
    handlePositionDrag(e, {
      openPrice: newOpenPriceValue,
    });
  }

  const onDragComplete = (e: React.MouseEvent, moreProps: any) => {
    dragStartValue.current = null;
    dragStartX.current = null;
    const { handleDragComplete } = props;
    handleDragComplete(e, moreProps);
  }

  return (
    <g>
      <PriceLine
        at="right"
        orient="right"
        price={slZone.y}
        stroke="#692736"
        lineStroke='#692736'
        strokeWidth={0.5}
        fill="#692736"
        textFill="white"
        strokeDasharray="ShortDash"
        displayFormat={format(".3f")}
      />
      <InteractiveText
        bgFillStyle="transparent"
        bgStrokeWidth={1}
        selected={true}
        bgStroke="red"
        fontFamily="Arial"
        position={[xStart, slZone.y]}
        fontSize={12}
        fontWeight="normal"
        fontStyle="normal"
        text={slZone.label}
        textFill="white"
        onDragStart={() => onDragStart(null, slZone.y)}
        onDrag={onStopLossDrag}
        onDragComplete={onDragComplete}
        onHover={() => {}}
        // onHover={this.handleMouseEnterText}
        // onUnHover={this.handleMouseLeaveText}
        minWidth={350}
        align={side === 'short' ? 'top' : 'bottom'}
      />
      <GenericChartComponent
        edgeClip
        clip={false}
        canvasDraw={drawOnCanvas}
        canvasToDraw={getMouseCanvas}
        drawOn={["mousemove", "mouseleave", "pan", "drag"]}
      />
      <PriceLine
        at="right"
        orient="right"
        price={baseYValue}
        stroke="#848484"
        lineStroke='#848484'
        strokeWidth={0.5}
        fill="#848484"
        textFill="white"
        strokeDasharray="ShortDash"
        displayFormat={format(".3f")}
      />
      <InteractiveText
        bgFillStyle="transparent"
        bgStrokeWidth={1}
        selected={true}
        bgStroke="gray"
        fontFamily="Arial"
        position={[xStart, baseYValue]}
        fontSize={12}
        fontWeight="normal"
        fontStyle="normal"
        text={positionLabel}
        textFill="white"
        onHover={() => {}}
        onDragStart={() => onDragStart(null, baseYValue)}
        onDrag={onPositionDrag}
        onDragComplete={onDragComplete}
        minWidth={300} 
        align={'middle'}
      />
      {tpZones.map((zone, i) => (
        <>
        <PriceLine
          at="right"
          orient="right"
          price={zone.y}
          stroke="#2e6a3e"
          lineStroke='#2e6a3e'
          strokeWidth={0.5}
          fill="#2e6a3e"
          textFill="white"
          strokeDasharray="ShortDash"
          displayFormat={format(".3f")}
        />
        <InteractiveText
          bgFillStyle="transparent"
          bgStrokeWidth={1}
          selected={true}
          bgStroke="green"
          fontFamily="Arial"
          position={[xStart, zone.y]}
          fontSize={12}
          fontWeight="normal"
          fontStyle="normal"
          text={zone.label}
          textFill="white"
          onHover={() => {}}
          onDragStart={() => onDragStart(null, zone.y)}
          onDrag={(e, moreProps) => onTakeProfitDrag(e, i, moreProps)}
          onDragComplete={onDragComplete}
          minWidth={350}
          align={side === 'long' ? 'top' : 'bottom'}
        />
        </>
      ))}
    </g>
  )
}


PositionIndicator.defaultProps = {
  fitToText: false,
  lineStroke: "#000000",
  lineStrokeDasharray: "ShortDot",
  yAxisPad: 0,
  fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
  fontSize: 13,
  fill: "#8a8a8a",
  opacity: 0.3,
  stroke: undefined,
  textFill: "#FFFFFF",
};
