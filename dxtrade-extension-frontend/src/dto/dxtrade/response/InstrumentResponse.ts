export type InstrumentsResponse = {
    instruments: InstrumentDetails[]
}

export type InstrumentDetailsResponse = {
    instrumentDetails: AccountInstrumentDetails[]
}

export type AccountInstrumentDetails = {
    minOrderSize: number,
    minOrderSizeIncrement: number,
    maxOrderSize: {
        value: number,
        limitType: 'LOTS' | 'NOTIONAL_CURRENCY'
    },
    marginRate: any, // todo type https://demo.dx.trade/developers/#/DXtrade-REST-API?id=margin-rate
}

export type InstrumentDetails = {
    type: string,
    symbol: string,
    version: number,
    description: string,
    priceIncrement: number,
    pipSize: number,
    currency: string,
    lotSize: number,
    multiplier: number,
    underlying: string,
    product: string,
    firstCurrency: string,
    tradingHours: any,
    currencyType: string
}

export type Instrument = InstrumentDetails & AccountInstrumentDetails