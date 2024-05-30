import { format } from "d3-format";
import { IPosition, IToolbarState } from "../components/plot/plot.interfaces";
import { Instrument } from "../dto/dxtrade/response/InstrumentResponse";

export const getPriceFormat = (instrument: Instrument) => {
    const decimalPlaces = Math.max(-Math.floor(Math.log10(instrument.priceIncrement)), 0);
    return format(`.${decimalPlaces}f`);
}

export const getSLFormat = (instrument: Instrument) => {
    const priceDecimalPlaces = Math.max(-Math.floor(Math.log10(instrument.priceIncrement)), 0);
    const decimalPlaces = Math.max(-Math.floor(Math.log10(instrument.pipSize)), 0);
    return format(`.${Math.max(0, priceDecimalPlaces - decimalPlaces)}f`);
}

export const getSLToolbarFormat = (instrument: Instrument) => {
    const priceDecimalPlaces = Math.max(-Math.floor(Math.log10(instrument.priceIncrement)), 0);
    const decimalPlaces = Math.max(-Math.floor(Math.log10(instrument.pipSize)), 0);
    return (value: number) => parseFloat(value.toFixed(Math.max(0, priceDecimalPlaces - decimalPlaces)))
}

export const changeRisk = (value: number, instrument: Instrument, currentPrice: number, position: IPosition, setPosition: (val: IPosition) => void) => {
    const riskCash = value;
    const sl = position.sl;
    const tpZones = position.tpZones;
    if (riskCash && sl && tpZones) {
        changeSL(sl, instrument, currentPrice, {...position, riskCash } , setPosition);
    }
};

export const changeRR = (value: number, instrument: Instrument, currentPrice: number, position: IPosition, setPosition: (val: IPosition) => void) => {
    const sl = position.sl;
    const rr = Number(value);
    if (sl && rr >= 0) {
        changeSL(sl, instrument, currentPrice, {...position, rr}, setPosition);
    }
}

//TODO correct lot precision
export const changeLot = (value: number, instrument: Instrument, currentPrice: number, position: IPosition, setPosition: (val: IPosition) => void) => {
    const lot = getRoundedToStep(value, instrument.minOrderSizeIncrement);
    const tpZones = position.tpZones;
    const sl = position.sl;
    if (sl && tpZones) {
        const slPrice = currentPrice - sl * instrument.pipSize;
        const positionSize = lot * instrument.lotSize;
        const riskCash = positionSize * (currentPrice - slPrice);
        const tpZones = getTpZones({ ...position, lot, riskCash }, instrument); 

        setPosition({
            ...position,
            riskCash,
            tpZones,
            lot,
        })
    }
}

export const getTpZones = (position: IPosition, instrument: Instrument) => {
    const { tpZones, lot, sl } = position;
    let lotsAcc = 0;
    const tpZonesNew = tpZones!.map((tpZone, i) => {
        const tp = !!position.rr ? sl * position.rr * (i + 1) : tpZone.tp;
        if (i < tpZones!.length - 1) {
            const curLot = getFlooredToStep(lot! / tpZones!.length, instrument.minOrderSizeIncrement)
            lotsAcc += curLot;
            return {
                tp,
                lot: curLot
            }
        } else {
            return {tp, lot: getRoundedToStep(lot! - lotsAcc, instrument.minOrderSizeIncrement)};
        }
    })

    return tpZonesNew;
}

export const getProfitForTpZone = (tpZone: { tp: number, lot: number }, instrument: Instrument) => {
    return tpZone.lot * tpZone.tp * instrument.pipSize;
}

const getSLForPositionSizeAndRisk = (positionSize: number, risk: number, instrument: Instrument) => {
    return (risk / positionSize) / instrument.pipSize;
}

export const getRoundedToStep = (value: number, step: number) => {
    const stepPrecision = step.toString().split('.')[1]?.length || 0;
    const rounded = Math.round(value / step) / (1 / step); // to avoid floating point errors
    return parseFloat(rounded.toFixed(stepPrecision));
}

export const getFlooredToStep = (value: number, step: number) => {
    const stepPrecision = step.toString().split('.')[1]?.length || 0;
    const floored = Math.floor(value / step) / (1 / step); // to avoid floating point errors
    return parseFloat(floored.toFixed(stepPrecision));
}

export const getMinimumSLStep = (instrument: Instrument) => {
    const step = instrument.priceIncrement / instrument.pipSize;
    return step;
}

export const changeSL = (value: number, instrument: Instrument, currentPrice: number, position: IPosition, setPosition: (val: IPosition) => void) => {
    const riskCash = position.riskCash;
    // console.log('risk cash', riskCash)
    const slPrice = currentPrice - value * instrument.pipSize;
    // console.log('slPrice', slPrice)
    // console.log('currentPrice', currentPrice)
    let positionSize = riskCash / (currentPrice - slPrice);
    // console.log('positionSize not rounded', positionSize)
    positionSize = getRoundedToStep(positionSize, instrument.minOrderSizeIncrement * instrument.lotSize);
    if (positionSize < instrument.minOrderSize * instrument.lotSize) {
        positionSize = instrument.minOrderSize * instrument.lotSize;
    }
    // console.log('positionSize', positionSize)
    const lot = getRoundedToStep(positionSize / instrument.lotSize, instrument.minOrderSizeIncrement);
    // console.log('lots', lot)
    const sl = getSLForPositionSizeAndRisk(positionSize, riskCash, instrument);
    // console.log('new sl', sl)
    const tpZones = getTpZones({ ...position, sl, lot }, instrument);
    // const profitTotal = tpZones.reduce((acc, zone, i) => acc + getProfitForTpZone(zone, instrument), 0);
    
    setPosition({
        ...position,
        sl,
        tpZones,
        riskCash,
        lot
    })
}

export const calculatePositionForToolbar = (toolbarState: IToolbarState, instrument: Instrument, currentPrice: number, isLong: boolean, setPosition: (val: IPosition) => void, type?: 'market' | 'limit') => {
    const riskCash = toolbarState.riskCash;
    if (!riskCash) {
        return;
    }
    const sideSign = isLong ? 1 : -1;

    const defaultPips = 20; // (0.02 * currentPrice) / instrument.pipSize;
    let sl = defaultPips;
    const slPrice = currentPrice - sideSign * sl * instrument.pipSize;
    let positionSize = riskCash / Math.abs(currentPrice - slPrice);

    // round position size to step
    positionSize = getRoundedToStep(positionSize, instrument.minOrderSizeIncrement * instrument.lotSize);
    if (positionSize < instrument.minOrderSize * instrument.lotSize) {
        positionSize = instrument.minOrderSize * instrument.lotSize;
    }

    const lot = getRoundedToStep(positionSize / instrument.lotSize, instrument.minOrderSizeIncrement);
    sl = getSLForPositionSizeAndRisk(positionSize, riskCash, instrument);

    const tpZonesCount = toolbarState?.tpZonesCount || 1;
    const rr = Number(toolbarState?.rr || 0);
    const tpZonesAdded = Array(tpZonesCount).fill(0).map((_, i) => ({ tp: (rr || 1) * defaultPips * (i + 1), lot: 0}));
    
    const positionWithoutTp = {
        type: type ? type == 'limit' ? 'limit' as 'limit' : 'market' as 'market' : 'market' as 'market',
        riskCash,
        rr,
        sl,
        lot,
        isLong
    }

    const tpZones = getTpZones({...positionWithoutTp, tpZones: tpZonesAdded}, instrument);
    const newPosition = {
        ...positionWithoutTp,
        tpZones
    }
    console.log('set position', newPosition)
    setPosition(newPosition)
}

export const changeTP = (zoneIndex: number, value: number, instrument: Instrument, currentPrice: number, position: IPosition, setPosition: (val: IPosition) => void) => {
    if (position.rr) {
        const sl = value / position.rr;
        changeSL(sl, instrument, currentPrice, position, setPosition);
    } else {
        const sl = position.sl!;
        const tpZones = position.tpZones!.map((zone, index) => index === zoneIndex ? {tp: value, lot: zone.lot} : zone);
        setPosition({
            ...position,
            sl: sl,
            tpZones,
        })
    }
}

export const changeTPCount = (value: number, instrument: Instrument, position: IPosition, setPosition: (val: IPosition) => void) => {
    if (!isNaN(value)) {
        const tpZonesAdded = Array.from({length: Number(value)}, (_, i) => 
            position.tpZones![i] || {tp: position.tpZones![position.tpZones!.length - 1].tp * (i + 1) / position.tpZones!.length, lot: 0}
        );
        const tpZones = getTpZones({...position, tpZones: tpZonesAdded}, instrument);

        setPosition({ ...position, tpZones })
    }
}

export const toBaseCurrency = (value: number | undefined, conversionRate: number | undefined) => {
    return conversionRate && value ? value * conversionRate : undefined;
}

export const toQuoteCurrency = (value: number | undefined, conversionRate: number | undefined) => {
    return conversionRate && value ? value / conversionRate : undefined;
}