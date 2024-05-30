export type MarketDataCandleWsResponse = {
    type: string,
    inReplyTo: string,
    session: string,
    payload: MarketDataCandleResponsePayload
}

export type MarketDataCandleResponsePayload = {
    events: MarketDataCandleResponseEvent[];
}

export type MarketDataCandleResponseEvent = {
    type: string,
    symbol: string,
    candleType: string,
    open: number,
    high: number,
    low: number,
    close: number,
    time: string; //"2022-02-20T00:01:00Z"
}