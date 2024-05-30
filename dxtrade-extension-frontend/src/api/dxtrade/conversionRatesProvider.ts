import { getConversionRates } from "./conversionRates.api";

export class ConversionRatesProvider {
    private baseCurrency: string;
    private setRates: (rates: ConversionRate[]) => void;
    constructor (baseCurrency: string, setRates: (rates: ConversionRate[]) => void) {
        this.baseCurrency = baseCurrency;
        this.setRates = setRates;
        this.fetch();
        setInterval(this.fetch.bind(this), 10000);
    }

    private fetch() {
        const curr = this.baseCurrency;
        const setRates = this.setRates;
        chrome.storage.local.get(['sessionToken'], async function (data) {
            if (data && data.sessionToken) {
                const resp = await getConversionRates(data.sessionToken, curr);
                const rates = resp?.map((rate: any) => {
                    let fromCurrency = rate.fromCurrency;
                    if (fromCurrency && fromCurrency.endsWith('$')) {
                        fromCurrency = fromCurrency.slice(0, -1);
                    }
                    return { from: fromCurrency, to: rate.toCurrency, value: rate.convRate };
                });
                if (rates && rates.length > 0) {
                    setRates(rates);
                }
            }
        });
    }
}

export type ConversionRate = {
    from: string;
    to: string;
    value: number;
}