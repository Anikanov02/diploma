import axios, { isAxiosError } from "axios";
import { ModifyOrderRequest, PlaceOrderRequest } from "../../dto/internal/request/PlaceOrderRequest";
import { LOGIN_REQUEST, ORDERS_URL } from "./apiConstants";

export const placeOrder = async (request: PlaceOrderRequest) => {
    try {
        const response = await axios.post(ORDERS_URL, request);
        return response.data;
    } catch (e) {
        console.error(e);
        if (isAxiosError(e)) {
            return undefined;
        }
    }
}

export const modifyOrder = async (request: ModifyOrderRequest) => {
    try {
        const response = await axios.put(ORDERS_URL, request);
        return response.data;
    } catch (e) {
        console.error(e);
        if (isAxiosError(e)) {
            return undefined;
        }
    }
}