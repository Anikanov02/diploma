import { IMessageEvent, w3cwebsocket as WebSocket } from 'websocket';
import { BUSINESS_EVENTS_WS_URL, MARKET_DATA_EVENTS_WS_URL } from './apiConstants';
import { MarketDataWsSubscribeRequest, MarketDataWsUnsubscribeRequest } from '../../dto/dxtrade/request/MarketDataWsRequest';
import { MarketDataCandleResponseEvent, MarketDataCandleWsResponse } from '../../dto/dxtrade/response/MarketDataWsResponse';
import { v4 as uuidv4 } from 'uuid';
import { MarketDataRequest, MarketDataSubscribeRequest } from '../../dto/dxtrade/request/MarketDataRequest';
import { getMarketData } from './marketData.api';
import { sendChartSubscription, unsubscribeChart } from './workaround.api';

export class MarketDataWsApi {
    private mode: 'WS' | 'MANUAL' | 'WORKAROUND';
    private mdCliend: WebSocket | undefined;
    private callback: MarketDataCallback;
    private subscriptions: { request: MarketDataWsSubscribeRequest, id: string }[];

    constructor(callback: MarketDataCallback) {
        this.subscriptions = [];
        this.callback = callback;
        this.mode = 'WS';
        this.initializeMarketDataWebsocket();
    };

    private async handleWorkaround() {
        console.log("using workaround")
        // alert('Risk Calculator will turn on debugger for this broker in order to function properly, please do not close debugger while on this page.')
        const mapAndSend = (data: any) => {
            console.log("got md update from workaround script")
            const subscription = subscriptions.filter(sub =>
                sub.request.symbols.find(sym => sym === data.config.symbol)
                && sub.request.timeframe === data.config.timeframe)[0];
            if (!subscription) {
                return;
            }
            console.log("found sub to reply: " + subscription?.id);
            const events: MarketDataCandleResponseEvent[] = data.data.map((entry: any) => {
                return {
                    type: 'CANDLE',
                    symbol: data.config.symbol,
                    candleType: data.config.timeframe,
                    open: entry.open,
                    high: entry.high,
                    low: entry.low,
                    close: entry.close,
                    time: entry.time
                }
            })
            console.log("MD UPDATES: " + events.length)
            callback.onCandleMarketDataMessage({
                type: 'CANDLE',
                inReplyTo: subscription?.id,
                session: '',
                payload: {
                    events: events
                }
            });
        }

        const callback = this.callback;
        const subscriptions = this.subscriptions;
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            if (message.type === "workaround_message") {
                mapAndSend(message.data);
            } else if (message.type === "workaround_stopped") {
                chrome.runtime.sendMessage({ type: "workaround_start" });
            }
            // return true;
        });

        chrome.runtime.sendMessage({ type: "workaround_start" }, (data) => {
            data.data.forEach((data: any) => mapAndSend(data))
            const absentConfigs = this.subscriptions.flatMap(sub => {
                return sub.request.symbols.map(symbol => {
                    return { symbol: symbol, timeframe: sub.request.timeframe }
                })
            }).filter(config => data.configs.find((existing: any) => {
                const hasCorrespondingConfig = existing?.timeframe && existing.timeframe === config.timeframe
                    && existing?.symbol && existing.symbol === config.symbol
                return !hasCorrespondingConfig;
            }))
            if (absentConfigs.length > 0) {
                absentConfigs.forEach(config => sendChartSubscription(config.symbol, config.timeframe))
                console.log('found missing configs: ' + JSON.stringify(absentConfigs))
            }

            const redundantConfigs = data.configs.filter((existing: any) => {
                const isNotInSubscriptions = !this.subscriptions.some(sub => {
                    return sub.request.symbols.includes(existing.symbol) && sub.request.timeframe === existing.timeframe;
                });
                const isRiskCalculator = existing.subtopic.startsWith('risk_calculator_');
                return isNotInSubscriptions && isRiskCalculator;
            });

            if (redundantConfigs.length > 0) {
                redundantConfigs.forEach((config: any) => { unsubscribeChart(config.subtopic); });
                console.log('Found redundant configs: ' + JSON.stringify(redundantConfigs));
            }
        })
    }

    private runManualFetching = (inReplyTo: string): void => {
        if (inReplyTo) {
            chrome.storage.local.get(['sessionToken'], (result) => {
                console.log(JSON.stringify(this.subscriptions))
                const subscription = this.subscriptions.find(sub => sub.id === inReplyTo);
                if (subscription) {
                    console.log('running manual md fetching')
                    const intervalId = setInterval(async () => {
                        const currentDate = new Date();

                        const fiveYearsBehindDate = new Date();
                        fiveYearsBehindDate.setFullYear(currentDate.getFullYear() - 5);

                        const fiveYearsAheadDate = new Date();
                        fiveYearsAheadDate.setFullYear(currentDate.getFullYear() + 5);
                        const message: MarketDataRequest = {
                            account: subscription.request.account,
                            symbols: subscription.request.symbols,
                            eventTypes: [
                                {
                                    type: subscription.request.type || "Candle",
                                    candleType: subscription.request.timeframe,
                                    fromTime: fiveYearsBehindDate.toISOString(),
                                    toTime: fiveYearsAheadDate.toISOString(),
                                    format: subscription.request.format || "COMPACT"
                                }
                            ]
                        }
                        const resp = await getMarketData(result.sessionToken, message)
                        if (resp) {
                            this.callback.onCandleMarketDataMessage(resp);//TODO uncomment
                        } else {
                            console.log('error geting market data, stopping task, switching to workaround approach')
                            clearInterval(intervalId);
                            this.mode = 'WORKAROUND';
                            this.handleWorkaround();
                        }
                    }, 5 * 1000);
                } else {
                    console.log(`could not find subscription with id: ${inReplyTo}`)
                }
            })
        } else {
            console.log('inReplyTo is undefined')
        }
    }

    private async initializeMarketDataWebsocket(): Promise<void> {
        if (this.mdCliend && this.mdCliend.readyState !== WebSocket.CLOSED) {
            console.log('Closing existing WebSocket connection');
            this.mdCliend.close();
        }

        const url = await MARKET_DATA_EVENTS_WS_URL();
        this.mdCliend = new WebSocket(url);
        this.mdCliend.onopen = async (): Promise<void> => {
            console.log(`WebSocket connection established for ${await MARKET_DATA_EVENTS_WS_URL()}`);
            this.callback.onOpen();
            // this.handleWorkaround();//TODO remove, just for testing!
            // Start listening for incoming messages
            if (this.mdCliend && this.mdCliend.OPEN) {
                this.mdCliend.onmessage = (message: IMessageEvent): void => {
                    const data = JSON.parse(message.data.toString());

                    // Check if the received message is a PingRequest
                    if (data.type === 'PingRequest') {
                        // Send a Ping message in response
                        const pingMessage = {
                            type: 'Ping',
                            inReplyTo: data.requestId,
                            timestamp: new Date().toISOString(),
                            session: data.session
                        };
                        if (this.mdCliend && this.mdCliend.OPEN) {
                            this.mdCliend.send(JSON.stringify(pingMessage));
                        } else {
                            this.initializeMarketDataWebsocket();
                        }
                    } else if (data.type === 'MarketData') {
                        // Handle MarketData messages here
                        // Check if the MarketData message contains Candle data
                        if (data.payload.events && data.payload.events.length > 0) {
                            const event = data.payload.events[0];
                            if (event.type === 'Candle') {
                                this.callback.onCandleMarketDataMessage(data)//TODO uncomment
                            } else if (event.type === 'Quote') {

                            } else {
                                console.log('Received unexpected data: ' + data.payload)
                            }
                        }
                    } else if (data.type === 'Reject') {
                        this.mdCliend?.close();
                        this.mode = 'MANUAL';
                        this.runManualFetching(data.inReplyTo);
                    } else {
                        console.log('Unknown message received: ' + JSON.stringify(data))
                    }
                };
                this.subscriptions.forEach(sub => {
                    this.subscribeMarketData(sub.request);
                })
            } else {
                this.initializeMarketDataWebsocket();
            }
        };

        this.mdCliend.onerror = async (error: Error): Promise<void> => {
            console.error(`WebSocket error for ${await MARKET_DATA_EVENTS_WS_URL()}:`, error);
        };
    }

    public subscribeMarketData(request: MarketDataWsSubscribeRequest): string | undefined {
        const requestId = uuidv4();
        chrome.storage.local.get(['sessionToken'], (result) => {
            console.log('Retrieved name: ' + result.sessionToken);

            if (this.mode === 'WS' && (!this.mdCliend || this.mdCliend.readyState !== WebSocket.OPEN)) {
                this.initializeMarketDataWebsocket();
                return this.subscribeMarketData(request);
            } else {
                console.log('sending subscribe message')
                const currentDate = new Date();

                const fiveYearsBehindDate = new Date();
                fiveYearsBehindDate.setFullYear(currentDate.getFullYear() - 5);

                const fiveYearsAheadDate = new Date();
                fiveYearsAheadDate.setFullYear(currentDate.getFullYear() + 5);
                const message: MarketDataSubscribeRequest = {
                    type: "MarketDataSubscriptionRequest",
                    requestId: requestId,
                    session: result.sessionToken,
                    payload: {
                        account: request.account,
                        symbols: request.symbols,
                        eventTypes: [
                            {
                                type: request.type || "Candle",
                                candleType: request.timeframe,
                                fromTime: fiveYearsBehindDate.toISOString(),
                                toTime: fiveYearsAheadDate.toISOString(),
                                format: request.format || "COMPACT"
                            }
                        ]
                    }
                }

                this.subscriptions.push({ request: request, id: requestId });
                console.log('using ' + this.mode + ' mode')
                if (this.mode === 'WS' && this.mdCliend) {
                    this.mdCliend.send(JSON.stringify(message))
                } else if (this.mode === 'MANUAL') {
                    this.runManualFetching(requestId);
                } else if (this.mode === 'WORKAROUND') {
                    this.handleWorkaround();
                }
            }
        });
        return requestId;
    }

    public unsubscribeMarketData(request: MarketDataWsUnsubscribeRequest) {
        chrome.storage.local.get(['sessionToken'], (result) => {
            if (this.mdCliend && this.mdCliend.readyState === WebSocket.OPEN) {
                const requestId = uuidv4();
                this.mdCliend.send(JSON.stringify({
                    type: "MarketDataCloseSubscriptionRequest",
                    requestId: requestId,
                    refRequestId: request.refRequestId,
                    session: result.sessionToken
                }))
            }
            this.subscriptions = [];
        });
    }
}

export type MarketDataCallback = {
    onCandleMarketDataMessage: (data: MarketDataCandleWsResponse) => void,
    onOpen: () => void
}