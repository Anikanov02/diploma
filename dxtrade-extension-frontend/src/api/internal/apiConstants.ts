// export const HOST_ADDRESS = "https://dxtrade.applicationservice.site"; // http://localhost:8080"
export const HOST_ADDRESS = "http://localhost:8080"
export const LOGIN_REQUEST = HOST_ADDRESS + '/login';
export const LOGOUT_REQUEST = HOST_ADDRESS + '/logout';
export const AUTH_URL = HOST_ADDRESS + '/auth'

export const ORDERS_URL = HOST_ADDRESS + '/orders'
export const POSITIONS_URL = HOST_ADDRESS + '/positions'
export const POSITIONS_BE = POSITIONS_URL + '/break-even'
export const POSITION_PTP = POSITIONS_URL + '/partial-tp'

export const LICENSE_VALIDATION = AUTH_URL + '/license';
