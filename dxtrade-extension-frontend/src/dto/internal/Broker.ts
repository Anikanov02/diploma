export enum Broker {
    FTMO = "FTMO",
    GOOEY = "GOOEY",
    DERIVXDEMO = "DERIVXDEMO",
    DERIVX = "DERIVX",
    BBULL = "BBULL"
}

const BrokerMap: Record<string, Broker> = {
    "dxtrade.ftmo.com": Broker.FTMO,
    "trade.gooeytrade.com": Broker.GOOEY,
    "dx-demo.deriv.com": Broker.DERIVXDEMO,
    "dx.deriv.com": Broker.DERIVX,
    "trade.blackbull.com": Broker.BBULL
};

export function getForHostname(hostname: string): Broker | undefined {
    return BrokerMap[hostname];
}