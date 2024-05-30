export type PortfolioResponse = {
    portfolios: Portfolio[];
}

export type Portfolio = {
    account: string;
    version: number;
    balances: PortfolioBalance[];
}

export type PortfolioBalance = {
    account: string;
    version: number;
    value: number;
    currency: string;
}