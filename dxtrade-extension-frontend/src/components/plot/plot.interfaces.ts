import {
    strokeDashTypes,
} from "@react-financial-charts/core";
import { Instrument } from "../../dto/dxtrade/response/InstrumentResponse";
import { ConversionRate } from "../../api/dxtrade/conversionRatesProvider";
import { Broker } from "../../dto/internal/Broker";

export interface IToolbarProps {
    // broker: Broker,
    broker: string,
    followLivePrice: boolean,
    conversionRate: number,
    accountCurrency: string,
    symbol: string,
    position: IPosition | null, 
    readonly edge: any,
    readonly yAccessor: (data: any) => number | undefined;
    setPosition: (val: IPosition | null) => void,
    toggleLimitOrder: () => void,
    instrument: Instrument,
    account?: string,
    accountBalance?: number,
    apiKey?: string,
}

export interface IIndicatorProps {
    edgeLinePosition: { x: number, y: number }
}

export interface ProtectionOrderLevelsProps {
    openedPositions: any[],
    instrument: Instrument
}

export interface PatialTakeProfitProps {
    readonly edge: any,
    readonly position: IPosition,
    positionId: string
}

export interface PositionIndicatorInteractiveProps {
    readonly edge: {},
    readonly position: IPosition;
    readonly setPosition: (val: IPosition) => void,
    readonly instrument: Instrument,
    readonly conversionRate: number,
    readonly followLivePrice: boolean,
    readonly onStart?: (moreProps: any) => void;
    readonly yAccessor: (data: any) => number | undefined;
    readonly xAccessor: (data: any) => number | Date;
    readonly yAxisPad?: number;
}

export interface PositionIndicatorProps {
    readonly tpZones: { y: number, label: string }[],
    readonly slZone: {y: number, label: string},
    readonly baseYValue: number,
    readonly xStart: number | Date,
    readonly xEnd?: number | Date,
    readonly side: 'long' | 'short',
    readonly fill?: string | ((datum: any) => string);
    readonly fitToText?: boolean;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly lineStroke?: string | ((datum: any) => string);
    readonly lineStrokeDasharray?: strokeDashTypes;
    readonly stroke?: string | ((datum: any) => string);
    readonly textFill?: string | ((datum: any) => string);
    readonly opacity?: number;
    readonly yAxisPad?: number;
    readonly positionLabel: string;
    handleDragStart: (e: React.MouseEvent, moreProps: any) => void;
    handleStopLossDrag: (e: React.MouseEvent, moreProps: any) => void;
    handleTakeProfitDrag: (e: React.MouseEvent, moreProps: any) => void;
    handleDragComplete: (e: React.MouseEvent, moreProps: any) => void;
    handlePositionDrag: (e: React.MouseEvent, moreProps: any) => void;
}

export interface IPosition {
    openPrice?: number,
    type: 'market' | 'limit',
    lot: number,
    sl: number,
    tpZones: {lot: number, tp: number}[],
    isLong: boolean | undefined,
    riskCash: number,
    rr: number,
}

export interface IToolbarState {
    inputType: 'cash' | 'percentage',
    riskPercentage: number | '',
    riskCash: number | '',
    lot?: number | '',
    profit?: number,
    rr?: number | '',
    sl?: number | '',
    tpZonesCount?: number,
    type?: 'market' | 'limit',
}

export interface StopOrder {

}