import { IMessageEvent, w3cwebsocket as WebSocket } from 'websocket';
import { BUSINESS_EVENTS_WS_URL, MARKET_DATA_EVENTS_WS_URL } from './apiConstants';
import { v4 as uuidv4 } from 'uuid';
import { listPositions } from '../internal/user.api';

export class BusinessEventsWsApi {
    private static businessClient: WebSocket | undefined;
    private callbacks: BusinessEventsCallback[];

    constructor(callback?: BusinessEventsCallback) {
        this.callbacks = callback ? [callback] : [];
        this.initializeBusinessEvents();
    };

    public addCallback(callback: BusinessEventsCallback) {
        this.callbacks = [...this.callbacks, callback];
    }

    public async initializeBusinessEvents(): Promise<void> {
        if (BusinessEventsWsApi.businessClient && BusinessEventsWsApi.businessClient.readyState !== WebSocket.CLOSED) {
            console.log('Closing existing WebSocket connection');
            BusinessEventsWsApi.businessClient.close();
        }
        BusinessEventsWsApi.businessClient = new WebSocket(await BUSINESS_EVENTS_WS_URL());
        BusinessEventsWsApi.businessClient.onopen = async (): Promise<void> => {
            console.log(`WebSocket connection established for ${await BUSINESS_EVENTS_WS_URL()}`);
            this.callbacks.forEach(cb => cb.onOpen())
            // this.callback.onOpen();

            if (BusinessEventsWsApi.businessClient && BusinessEventsWsApi.businessClient.OPEN) {
                BusinessEventsWsApi.businessClient.onmessage = (message: IMessageEvent): void => {
                    const resp: string[] = message.data.toString().split('|');
                    const data = resp[1] && this.isJsonString(resp[1]) ? JSON.parse(resp[1]) : {};
                    if (data.type === 'PingRequest') {
                        const pingMessage = {
                            type: 'Ping',
                            inReplyTo: data.requestId,
                            timestamp: new Date().toUTCString(),
                            session: data.session
                        };
                        if (BusinessEventsWsApi.businessClient && BusinessEventsWsApi.businessClient.OPEN) {
                            BusinessEventsWsApi.businessClient.send(JSON.stringify(pingMessage));
                        } else {
                            this.initializeBusinessEvents();
                        }
                    } else if (data.type === 'ACCOUNT_METRICS') {
                        const totalBalance = data.body.allMetrics.availableFunds;
                        const equity = data.body.allMetrics.equity;
                        this.callbacks.forEach(cb => cb.onAccountMetrics({totalBalance, equity}))
                        // this.callback.onAccountMetrics({totalBalance, equity});
                    } else if (data.type === 'CONVERSION_RATE') {
                        const conversionRates = data.body.map((cr: any) => { return { from: cr.from, to: cr.to, value: cr.value } });
                        this.callbacks.forEach(cb => cb.onConversionRates(conversionRates))
                        // this.callback.onConversionRates(conversionRates);
                    } else if (data.type === 'POSITIONS') {
                        chrome.storage.local.get(null, async (result) => {
                            if (result.sessionToken && result.account && result.broker) {
                                const positions = await listPositions(result.broker, result.sessionToken, result.account);
                                this.callbacks.forEach(cb => cb.onPositions(positions))
                                // this.callback.onPositions(positions);
                            }
                        });
                    }
                }
            } else {
                this.initializeBusinessEvents();
            }
        };

        BusinessEventsWsApi.businessClient.onerror = async (error: Error): Promise<void> => {
            console.error(`WebSocket error for ${await BUSINESS_EVENTS_WS_URL()}:`, JSON.stringify(error));
        };
    }

    private isJsonString(str: string) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    public cleanup(): void {
        // if (BusinessEventsWsApi.businessClient) {
        //     BusinessEventsWsApi.businessClient.close();
        //     BusinessEventsWsApi.businessClient = undefined;
        // }
    }

    public subscribePortfolios(account: string): string | undefined {
        const requestId = uuidv4();
        chrome.storage.local.get(['sessionToken'], (result) => {
            if (!BusinessEventsWsApi.businessClient || !BusinessEventsWsApi.businessClient.OPEN) {
                this.initializeBusinessEvents();
                return this.subscribePortfolios(account);
            } else {
                BusinessEventsWsApi.businessClient.send(JSON.stringify({
                    type: "AccountMetricsSubscriptionRequest",
                    requestId: requestId,
                    session: result.sessionToken,
                    payload: {
                        accounts: [account],
                        requestType: "LIST",
                        includePositions: "true"
                    }
                }));
            }
        });
        return requestId;
    }

    public unsubscribePortfolios(originalReqId: string) {
        chrome.storage.local.get(['sessionToken'], (result) => {
            if (BusinessEventsWsApi.businessClient && BusinessEventsWsApi.businessClient.OPEN) {
                const requestId = uuidv4();
                BusinessEventsWsApi.businessClient.send(JSON.stringify({
                    type: "AccountPortfoliosCloseSubscriptionRequest",
                    requestId: requestId,
                    refRequestId: originalReqId,
                    session: result.sessionToken
                }))
            }
        });
    };
}

export type BusinessEventsCallback = {
    onAccountPostfoliosMessage: (data: any) => void;
    onAccountMetrics: (data: any) => void;
    onConversionRates: (data: any) => void;
    onPositions: (data: any) => void;
    onOpen: () => void;
}