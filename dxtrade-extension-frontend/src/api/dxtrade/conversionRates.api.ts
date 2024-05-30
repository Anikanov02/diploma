import axios, { isAxiosError } from "axios";
import { CONVERSION_RATES } from "./apiConstants";

export const getConversionRates = async (token: string, toCurrency: string, fromCurrency?: string) => {
    try {
        const relativeUrl = '?' + (!!fromCurrency ? `fromCurrency=${fromCurrency}&` : '') + `toCurrency=${toCurrency}`;
        const response = await axios.get(`${await CONVERSION_RATES()}` + relativeUrl, {
            headers: {
                Authorization: `DXAPI ${token.replaceAll('"', '')}`
            }
        });
        return response.data.conversionRates;
    } catch (e) {
        console.error(e);
        if (isAxiosError(e)) {
            return undefined;
        }
    }
}