import axios, { isAxiosError } from 'axios';
import { LOGIN_REQUEST, LOGOUT_REQUEST, PING_REQUEST } from './apiConstants';
import { ApplicantCreateRequest } from '../../dto/dxtrade/request/LoginRequest';

export const loginUser = async (values: ApplicantCreateRequest): Promise<string | undefined> => {
    try {
        const response = await axios.post(`${await LOGIN_REQUEST()}`, values);
        return response.data.sessionToken;
    } catch (e) {
        console.error(e);
        if (isAxiosError(e)) {
            return undefined;
        }
    }
}

export const logoutUser = async (token: string) => {
    try {
        await axios.post(`${await LOGOUT_REQUEST()}`, {
            headers: {
                Authorization: `DXAPI ${token.replaceAll('"', '')}`
            }
        });
    } catch (e) {
        console.error(e);
    }
}

export const ping = async (token: string): Promise<string | undefined> => {
    try {
        const response = await axios.post(`${await PING_REQUEST()}`, null,
        {
            headers: {
                Authorization: `DXAPI ${token.replaceAll('"', '')}`
            }
        });
        return response.data.sessionToken;
    } catch (e) {
        console.error(e);
        if (isAxiosError(e)) {
            return undefined;
        }
    }
}

// import axios, { AxiosError, isAxiosError } from 'axios';
// import qs from 'qs';

// import { ApplicantCreateRequest } from '../../dto/request/ApplicantCreateRequest';
// import { MoveApplicantToWorkflowRequest } from '../../dto/request/MoveApplicantToWorkflowRequest';
// import {
// 	UpdateApplicantPositionRequest,
// 	UpdateApplicantRequest
// } from '../../dto/request/UpdateApplicantRequest';
// import { APPLICANTS_REQUEST } from '../apiConstants';
// import { ApiErrorForUnathorithize } from '../apiErrorForUnathorithize';

// export const getApplicants = async (
// 	token: string,
// 	page: number,
// 	pageSize: number,
// 	filter?: string[],
// 	sort?: string,
// 	quickSearch?: string
// ) => {
// 	try {
// 		const query = {
// 			page,
// 			pageSize,
// 			...(filter && { filter }),
// 			...(sort && { sort }),
// 			...(quickSearch && { quickSearch })
// 		};
// 		return await axios.get(`${APPLICANTS_REQUEST}`, {
// 			params: query,
// 			paramsSerializer: {
// 				serialize: params => {
// 					return qs.stringify(params, {
// 						arrayFormat: 'repeat',
// 						allowDots: true
// 					});
// 				}
// 			},
// 			headers: {
// 				Authorization: `Bearer ${token.replaceAll('"', '')}`
// 			}
// 		});
// 	} catch (e) {
// 		console.error(e);
// 		if (isAxiosError(e)) {
// 			return e;
// 		}
// 	}
// };

// export const addApplicant = async (
// 	token: string,
// 	values: ApplicantCreateRequest
// ) => {
// 	try {
// 		return await axios.post(`${APPLICANTS_REQUEST}`, values, {
// 			headers: {
// 				Authorization: `Bearer ${token.replaceAll('"', '')}`
// 			}
// 		});
// 	} catch (e) {
// 		console.error(e);
// 		if (isAxiosError(e)) {
// 			return e;
// 		}
// 	}
// };

// export const deleteApplicant = async (token: string, id: number) => {
// 	try {
// 		return await axios.delete(`${APPLICANTS_REQUEST}/${id}`, {
// 			headers: {
// 				Authorization: `Bearer ${token.replaceAll('"', '')}`
// 			}
// 		});
// 	} catch (e) {
// 		if (isAxiosError(e)) {
// 			console.error(e);
// 			ApiErrorForUnathorithize(e as AxiosError);
// 		}
// 	}
// };

// export const getApplicantById = async (token: string, id: string | number) => {
// 	try {
// 		return await axios.get(`${APPLICANTS_REQUEST}/${id}`, {
// 			headers: {
// 				Authorization: `Bearer ${token.replaceAll('"', '')}`
// 			}
// 		});
// 	} catch (e) {
// 		if (isAxiosError(e)) {
// 			console.error(e);
// 			ApiErrorForUnathorithize(e as AxiosError);
// 			if (e.response) {
// 				return e.response.data;
// 			}
// 		}
// 	}
// };

// export const updateApplicant = async (
// 	token: string,
// 	id: number,
// 	values: UpdateApplicantRequest
// ) => {
// 	try {
// 		return await axios.put(`${APPLICANTS_REQUEST}/${id}`, values, {
// 			headers: {
// 				Authorization: `Bearer ${token.replaceAll('"', '')}`
// 			}
// 		});
// 	} catch (e) {
// 		console.error(e);
// 		if (isAxiosError(e)) {
// 			return e;
// 		}
// 	}
// };

// export const updateApplicantPosition = async (
// 	token: string,
// 	id: number,
// 	values: UpdateApplicantPositionRequest
// ) => {
// 	try {
// 		return await axios.put(`${APPLICANTS_REQUEST}/${id}`, values, {
// 			headers: {
// 				Authorization: `Bearer ${token.replaceAll('"', '')}`
// 			}
// 		});
// 	} catch (e) {
// 		console.error(e);
// 	}
// };

// export const moveApplicantToWorkflow = async (
// 	token: string,
// 	id: number,
// 	data: MoveApplicantToWorkflowRequest
// ) => {
// 	try {
// 		return await axios.patch(`${APPLICANTS_REQUEST}/${id}/workflow`, data, {
// 			headers: {
// 				Authorization: `Bearer ${token.replaceAll('"', '')}`
// 			}
// 		});
// 	} catch (e) {
// 		if (isAxiosError(e)) {
// 			console.error(e);
// 			ApiErrorForUnathorithize(e as AxiosError);
// 			if (e.response) {
// 				return e.response.data;
// 			}
// 		}
// 	}
// };

// export const hireApplicant = async (
// 	token: string,
// 	id: number,
// 	data: { accountName: string; username: string }
// ) => {
// 	let response: any;
// 	try {
// 		response = await axios.patch(`${APPLICANTS_REQUEST}/${id}/hire`, data, {
// 			headers: {
// 				Authorization: `Bearer ${token.replaceAll('"', '')}`
// 			}
// 		});
// 		return response;
// 	} catch (e: any) {
// 		if (isAxiosError(e)) {
// 			console.error(e);
// 			ApiErrorForUnathorithize(e as AxiosError);
// 		}
// 		if (e?.response?.data?.message) {
// 			return e.response;
// 		}
// 	}
// };
