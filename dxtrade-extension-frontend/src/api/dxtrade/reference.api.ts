import axios, { isAxiosError } from "axios";
import { ACCOUNT_URL, INSTRUMENT_URL } from "./apiConstants";
import { InstrumentDetailsResponse, InstrumentsResponse } from "../../dto/dxtrade/response/InstrumentResponse";

export const getInstruments = async (token: string, symbol: string): Promise<InstrumentsResponse | undefined> => {
    try {
        const response = await axios.get(`${await INSTRUMENT_URL()}/${symbol}`, {
            headers: {
                Authorization: `DXAPI ${token}`,
            }
        });
        return response.data;
    } catch (e) {
        console.error(e);
        if (isAxiosError(e)) {
            return undefined;
        }
    }
}

export const getInstrumentDetails = async (account: string, token: string, symbol: string): Promise<InstrumentDetailsResponse | undefined> => { 
    try {
        const response = await axios.get(`${await ACCOUNT_URL()}/${account}/instruments/${symbol}`, {
            headers: {
                Authorization: `DXAPI ${token}`,
            }
        });
        return response.data;
    } catch (e) {
        console.error(e);
        if (isAxiosError(e)) {
            return undefined;
        }
    }
}