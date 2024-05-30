import axios, { isAxiosError } from "axios";
import { LICENSE_VALIDATION } from "./apiConstants";

export const validateLicense = async (accountCode: string) => {
    try {
        const response = await axios.get(LICENSE_VALIDATION, {
            params: {
                accountCode: accountCode
            }
        });
        return response.status === 200;
    } catch (e) {
        return false;
    }
}