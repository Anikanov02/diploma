import axios, { isAxiosError } from "axios";
import { MARKET_DATA } from "./apiConstants";
import { MarketDataRequest, MarketDataSubscribeRequest } from "../../dto/dxtrade/request/MarketDataRequest";

export const getMarketData = async (token: string, payload: MarketDataRequest) => {
    try {
        const response = await axios.post(await MARKET_DATA(), payload, {
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