import React, { useEffect, useRef } from 'react';
import { IPosition, PositionIndicatorInteractiveProps } from './plot.interfaces';
import { format } from 'd3-format';
import { changeSL, changeTP, getPriceFormat, getSLFormat, toBaseCurrency } from '../../helpers/calculatorHelper';
import { PositionIndicator } from './PositionIndicator';

const formatValue = format('.2f');

export const PositionIndicatorInteractive: React.FC<PositionIndicatorInteractiveProps> = (props) => {

    const {
        position,
        instrument,
        conversionRate,
        setPosition,
        edge,
        xAccessor,
        yAccessor,
    } = props;

    const formatSL = getSLFormat(instrument);
    const formatPrice = getPriceFormat(instrument)

    const sideSign = position.isLong ? 1 : -1;
    const [indicatorPosition, setIndicatorPosition] = React.useState<IPosition>(position);
    const [xStart, setXStart] = React.useState<number | Date>(xAccessor(edge));

    const isDragging = useRef<boolean>(false);

    useEffect(() => {
        // todo use isDragging
        if (position) {
            setIndicatorPosition(position);
        }
        if (!position?.openPrice) {
            setXStart(xAccessor(edge));
        }
    }, [
        position
    ])

    useEffect(() => {
        setXStart(xAccessor(edge));
    }, [edge])

    const calculateIndicatorParams = () => {
        const {tpZones, sl, lot} = indicatorPosition
        const zoneTpLabel = (tpZone: {tp: number, lot: number}, tpPrice: number) => {
            const profit = toBaseCurrency(tpZone.lot * tpZone.tp * instrument.pipSize * instrument.lotSize, conversionRate);
            return `TP: ${formatSL(tpZone.tp)} (RR ${formatValue(tpZone.tp && sl ? tpZone.tp / sl : 0)}) Lot: ${tpZone.lot}, Profit: ${profit ? formatValue(profit) : '-'}, Price: ${formatPrice(tpPrice)}`
        }
        const zoneSlLabel = (slZone: {sl: number, lot: number}, slPrice: number) => {
            const risk = toBaseCurrency(slZone.sl * slZone.lot * instrument.pipSize * instrument.lotSize, conversionRate);
            return `SL: ${formatSL(slZone.sl)}, Risk: ${risk ? formatValue(risk) : '-'}, Price: ${formatPrice(slPrice)}` 
        }

        const baseYValue = indicatorPosition.openPrice ?? yAccessor(edge)!;

        //todo null safety
        const tpZonesValues = tpZones!.map((tpZone, i) => {
            const zoneTpY = baseYValue + sideSign * tpZone.tp * props.instrument.pipSize
            return {
                y: zoneTpY,
                label: zoneTpLabel(tpZone, zoneTpY)
            }
        })

        const zoneSl = baseYValue - sideSign * sl! * props.instrument.pipSize;
        const slZone = {
            y: zoneSl,
            label: zoneSlLabel({sl, lot}, zoneSl)
        }
        
        return {
            baseYValue,
            xStart,
            tpZones: tpZonesValues,
            slZone,
            side: position.isLong ? 'long' : 'short' as 'long' | 'short',
            positionLabel: `${position.type === 'limit' ? 'Limit' : 'Market'} ${position.isLong ? 'Buy' : 'Sell'} Lot: ${indicatorPosition.lot}`
        }
    }

    const handleDragTakeProfit = (e: React.MouseEvent, moreProps: {zoneIndex: number, tp: number}) => {
        // todo support multiple zones
        const { tp: tpValue, zoneIndex } = moreProps;
        if (edge) {
            const currentPrice = indicatorPosition.openPrice ?? yAccessor(edge)!;
            const tp = Math.max(1, sideSign * (tpValue - currentPrice) / instrument.pipSize)
            if (tpValue !== position.tpZones![zoneIndex].tp  && currentPrice) {
                changeTP(zoneIndex, tp, instrument, currentPrice, {...position, ...indicatorPosition}, setIndicatorPosition)
            }
        }
    }

    const handleDragStopLoss = (e: React.MouseEvent, moreProps: {sl: number}) => {
        const { sl: slValue } = moreProps;
        if (edge) {
            const currentPrice = indicatorPosition.openPrice ?? yAccessor(edge)!;
            const sl = sideSign * (currentPrice - slValue) / instrument.pipSize
            if (slValue !== position.sl && currentPrice) {
                changeSL(sl, instrument, currentPrice, {...position, ...indicatorPosition} , setIndicatorPosition)
            } 
        }
    };

    const handleDragStart = (e: React.MouseEvent, moreProps: any) => {
        isDragging.current = true;
    }

    const handleDragComplete = (e: React.MouseEvent, moreProps: any) => {
        isDragging.current = false;
        setPosition({...position, ...indicatorPosition});
    }

    const handlePositionDrag = (e: React.MouseEvent, moreProps: any) => {
        if (indicatorPosition.type === 'market') return;
        const { openPrice } = moreProps;
        if (edge) {
            setIndicatorPosition({...indicatorPosition, openPrice});
        }
    }

    return (
        <g>
            <PositionIndicator 
                {...calculateIndicatorParams()}
                handleDragStart={handleDragStart}
                handleStopLossDrag={handleDragStopLoss}
                handleTakeProfitDrag={handleDragTakeProfit}
                handleDragComplete={handleDragComplete}
                handlePositionDrag={handlePositionDrag}
            />
        </g>
    );
}

PositionIndicatorInteractive.defaultProps = {
    yAxisPad: 0,
};