import { Broker } from "../Broker";

export type PlaceOrderRequest = {
    // broker: Broker,
    broker: string,
    apiKey: string;
    orderId: string,
    accountCode: string;
    quantity: number;
    orderType: 'LIMIT' | 'MARKET';
    limitPrice?: number | string; 
    instrument: string;
    positionSide: PositionSide;
    takeProfits: StopOrder[];
    stopLosses: StopOrder[];
}

export type ModifyOrderRequest = {
    broker: string,
    apiKey: string;
    orderCode: string,
    accountCode: string;
    quantity: number;
    orderSide: 'BUY' | 'SELL';
    limitPrice?: number | string; 
    instrument: string,
    orderType: string,
    positionCode: string
}

export type StopOrder = {
    orderId: string;
    quantity: number;
    price: number | string;
}

export enum PositionSide {
    LONG,
    SHORT
}