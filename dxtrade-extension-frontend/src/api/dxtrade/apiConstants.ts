import { getBaseUrl, getHostname } from "../../helpers/urlExtractionHelper";

export const LOGIN_REQUEST = (): Promise<string> => getBaseUrl().then(baseUrl => `${baseUrl}/login`);
export const LOGOUT_REQUEST = (): Promise<string> => getBaseUrl().then(baseUrl => `${baseUrl}/logout`);
export const PING_REQUEST = (): Promise<string> => getBaseUrl().then(baseUrl => `${baseUrl}/ping`);
export const PORTFOLIO_URL = (): Promise<string> => getBaseUrl().then(baseUrl => `${baseUrl}/accounts/portfolio`);
export const USERS_URL = (): Promise<string> => getBaseUrl().then(baseUrl => `${baseUrl}/users`);
export const INSTRUMENT_URL = (): Promise<string> => getBaseUrl().then(baseUrl => `${baseUrl}/instruments`);
export const ACCOUNT_URL = (): Promise<string> => getBaseUrl().then(baseUrl => `${baseUrl}/accounts`);
export const CONVERSION_RATES = (): Promise<string> => getBaseUrl().then(baseUrl => `${baseUrl}/conversionRates`);
export const MARKET_DATA = (): Promise<string> => getBaseUrl().then(baseUrl => `${baseUrl}/marketdata`);

export const WORKAROUND_CHARTS_URL = (): Promise<string> => getHostname().then(baseUrl => `https://${baseUrl}/api/charts`);

export const BUSINESS_EVENTS_WS_URL = (): Promise<string> => getHostname().then(hostname => 
    `wss://${hostname}/client/connector?X-Atmosphere-tracking-id=0&X-Atmosphere-Framework=2.3.2-javascript&X-Atmosphere-Transport=websocket&X-Atmosphere-TrackMessageSize=true&Content-Type=text/x-gwt-rpc;%20charset=UTF-8&X-atmo-protocol=true&sessionState=dx-new&guest-mode=false`
);
export const MARKET_DATA_EVENTS_WS_URL = (): Promise<string> => getHostname().then(hostname =>
    `wss://${hostname}/dxsca-web/md?format=JSON`
);