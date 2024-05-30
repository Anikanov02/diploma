import axios, { isAxiosError } from "axios";
import { POSITIONS_BE, POSITIONS_URL, POSITION_PTP } from "./apiConstants";
import { PartialTakeProfit } from "../../dto/internal/request/PartialTakeProfitRequest";
import { Broker } from "../../dto/internal/Broker";

export const listPositions = async (brocker: string, apiKey: string, accountCode: string): Promise<any[] | undefined> => {
    try {
        const response = await axios.get(POSITIONS_URL, {
            params: {
                broker: brocker,
                apiKey: apiKey,
                accountCode: accountCode
            }
        });
        return response.data;
    } catch (e) {
        console.error(e);
        if (axios.isAxiosError(e)) {
            return undefined;
        }
    }
}

export const breakEven = async (brocker: string, apiKey: string, accountCode: string, positions: string[]) => {
    try {
        const response = await axios.post(POSITIONS_BE, {
            broker: brocker,
            apiKey: apiKey,
            accountCode: accountCode,
            positions: positions
        });
        return response.data;
    } catch (e) {
        console.error(e);
        if (axios.isAxiosError(e)) {
            return undefined;
        }
    }
}

export const partialTakeProfit = async (brocker: string, apiKey: string, accountCode: string, takeProfits: PartialTakeProfit[]) => {
    try {
        const response = await axios.post(POSITION_PTP, {
            broker: brocker,
            apiKey: apiKey,
            accountCode: accountCode,
            takeProfits: takeProfits
        });
        return response.data;
    } catch (e) {
        console.error(e);
        if (axios.isAxiosError(e)) {
            return undefined;
        }
    }
}