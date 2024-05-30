import axios, { isAxiosError } from "axios";
import { PORTFOLIO_URL, USERS_URL } from "./apiConstants";
import { PortfolioResponse } from "../../dto/dxtrade/response/PortfolioResponse";

export const getPortfolio = async (token: string): Promise<PortfolioResponse | undefined> => {
    try {
        const response = await axios.get(`${await PORTFOLIO_URL()}`, {
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

export const getUsers = async (token: string) => {
    try {
        const response = await axios.get(`${await USERS_URL()}`, {
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