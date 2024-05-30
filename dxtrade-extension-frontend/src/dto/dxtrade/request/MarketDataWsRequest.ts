export type MarketDataWsSubscribeRequest = {
    account?: string,
    symbols: string[], 
    timeframe: string;
    type?: string,
    format?: string
} 

export type MarketDataWsUnsubscribeRequest = {
    refRequestId: string
} 

export type MarketDataWsRequest = {
    type: string,
    requestId: string,
    session: string,
    payload: MarketDataRequestPayload
}

export type MarketDataRequestPayload = {
    account: string,
    symbols: string[],
    eventTypes: MarketDataRequestEventType[];
}

export type MarketDataRequestEventType = {
    type: string,
    candleType: string,
    fromTime: string,//"2022-02-02T09:50:48Z"
    toTime: string,
    format: string;
}