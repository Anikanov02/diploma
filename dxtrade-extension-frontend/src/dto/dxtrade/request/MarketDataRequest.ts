export type MarketDataSubscribeRequest = {
    type: "MarketDataSubscriptionRequest",
    requestId: string,
    session: string,
    payload: MarketDataRequest
}

export type MarketDataRequest = {
    account?: string,
    symbols: string[],
    eventTypes: [
        {
            type: string,
            candleType: string,
            fromTime: string,
            toTime: string,
            format: string
        }
    ]
}