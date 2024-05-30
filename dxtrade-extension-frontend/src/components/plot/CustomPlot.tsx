import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChartCanvas, Chart, CrossHairCursor, OHLCTooltip, EdgeIndicator, MouseCoordinateY, MouseCoordinateX } from "react-financial-charts";
import { CandlestickSeries } from "@react-financial-charts/series";
import { XAxis, YAxis } from "@react-financial-charts/axes";
import { discontinuousTimeScaleProvider } from "@react-financial-charts/scales";
import { MarketDataCallback, MarketDataWsApi } from "../../api/dxtrade/marketDataWebsocket.api";
import { MarketDataCandleResponseEvent, MarketDataCandleWsResponse } from "../../dto/dxtrade/response/MarketDataWsResponse";
import { timeFormat } from "d3-time-format";
import Toolbar from "./Toolbar";
import { IPosition } from "./plot.interfaces";
import { Instrument } from "../../dto/dxtrade/response/InstrumentResponse";
import { getInstrumentDetails, getInstruments } from "../../api/dxtrade/reference.api";
import { PositionIndicatorInteractive } from "./PositionIndicatorInteractive";
import { listPositions } from "../../api/internal/user.api";
import ProtectionOrderLevels from "./ProtectionOrderLevels";
import { PartialTakeProfit } from "./PartialTakeProfit";
import { getPriceFormat } from "../../helpers/calculatorHelper";

import { BusinessEventsCallback, BusinessEventsWsApi } from "../../api/dxtrade/businessEventsWebsocket.api";
import { ConversionRatesProvider } from "../../api/dxtrade/conversionRatesProvider";
import { Broker } from "../../dto/internal/Broker";
type PlotProps = {
    symbol: string | null,
    timeframe: string | null
    useEquity: boolean,
    followLivePrice: boolean,
}

//TODO resizing positions, handle login and saving sessionToken
const CustomPlot: React.FC<PlotProps> = (props) => {
    const { symbol, timeframe, useEquity, followLivePrice } = props;

    const [apiKey, setApiKey] = useState<string>();
    const [position, setPosition] = useState<IPosition | null>(null);
    const [instrument, setInstrument] = useState<Instrument>();
    const [account, setAccount] = useState<string>();
    const accountRef = useRef<string>();
    const [broker, setBroker] = useState<string>();
    const [accountBalance, setAccountBalance] = useState<number | undefined>();
    const [accountEquity, setAccountEquity] = useState<number | undefined>();
    const [conversionRates, setConversionRates] = useState<any[]>();
    const [conversionRate, setConversionRate] = useState<number>();
    const [accountCurrency, setAccountCurrency] = useState<string>();
    const [chartWidth, setChartWidth] = useState(0);
    const [chartHeight, setChartHeight] = useState(0);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [chartInputs, setChartInputs] = useState<{
        xScaleData: any[],
        xScale: any,
        xAccessor: ((data: any) => number | Date) | undefined,
        displayXAccessor: ((data: any) => number | Date) | undefined
    } | undefined>();
    const [candlesData, setCandlesData] = useState<{ date: Date, open: number, high: number, low: number, close: number }[]>([]);
    // var subId: string | undefined = undefined;
    const subId = useRef<string | undefined>(undefined);
    const [chartKey, setChartKey] = useState<string>();
    const [openedPositions, setOpenedPositions] = useState<any[]>([]);
    const [partialTp, setPartialTp] = useState<boolean>(false);
    const [positionId, setPositionId] = useState<string>();

    // var candlesProvider: MarketDataWsApi | null = null;
    var businessEventsProvider: BusinessEventsWsApi | null = null;
    var conversionRatesProvider: ConversionRatesProvider | null = null;

    const applyStateChanges = (events: MarketDataCandleResponseEvent[]) => {
        // Map the events to updates
        const updates = events.map(event => ({
            date: new Date(event.time),
            open: event.open,
            close: event.close,
            high: event.high,
            low: event.low
        }));

        // Update existing candles or add new ones
        setCandlesData(prevData => {
            // Create a map of dates to candles for faster lookup
            const dateMap = new Map(prevData.map(candle => [candle.date.getTime(), candle]));

            // Update existing candles or add new ones
            updates.forEach(update => {
                const updateDate = update.date.getTime();
                if (dateMap.has(updateDate)) {
                    // Replace existing candle with the updated one
                    dateMap.set(updateDate, update);
                } else {
                    // Add new candle
                    dateMap.set(updateDate, update);
                }
            });

            // Convert the map back to an array of candles
            return Array.from(dateMap.values());
        });
    };

    const callback: MarketDataCallback = {
        onCandleMarketDataMessage: (data: MarketDataCandleWsResponse) => {
            if (data.inReplyTo == subId.current) {
                applyStateChanges(data.payload.events)
            }
        },
        onOpen: () => {
            // setCandlesData([]);
            // console.log('subscribing to live data for symbol: ' + symbol + ' timeframe: ' + timeframe + ' account: ' + accountRef.current + ' ' + candlesProvider)
            // if (candlesProvider && symbol && timeframe && accountRef.current) {
            //     const id = candlesProvider.subscribeMarketData({
            //         account: accountRef.current,
            //         symbols: [symbol],
            //         timeframe: timeframe,
            //     });
            //     subId.current = id;
            //     setChartKey(id)
            // }
        }
    }
    const provider = useMemo(() => new MarketDataWsApi(callback), []);
    const [candlesProvider] = useState(provider);

    const businessEventsCallback: BusinessEventsCallback = {
        onOpen: () => {
            // if (businessEventsProvider && account) {
            //     businessEventsProvider.subscribePortfolios(account)
            // } 
        },
        onAccountMetrics: (data) => {
            if (data) {
                setAccountBalance(data.totalBalance);
                setAccountEquity(data.equity)
            }
        },
        onConversionRates: (data) => {
            if (data) {
                setConversionRates(data);
            }
        },
        onAccountPostfoliosMessage: (data) => {
            if (data) {
                const account = data[0];
                const balance = account.balances[0];
                setAccountBalance(balance.value);
            }
        },
        onPositions: (data: any) => {
            setOpenedPositions(data ? data : []);
        }
    }

    useEffect(() => {
        chrome.storage.local.get(null, (result) => {
            setAccount(result.account);
            accountRef.current = result.account;
            setApiKey(result.sessionToken);
            setAccountCurrency(result.currency);
            setBroker(result.broker);
            businessEventsProvider = new BusinessEventsWsApi(businessEventsCallback);
            if (result.currency) {
                conversionRatesProvider = new ConversionRatesProvider(result.currency, setConversionRates);
            }
        });

        chrome.storage.onChanged.addListener(function (changes, areaName) {
            console.log(JSON.stringify(changes))
            if (areaName === 'local') {
                if ('sessionToken' in changes) {
                    const currentSessionToken = changes['sessionToken'].newValue;
                    const oldSessionToken = changes['sessionToken'].oldValue;
                    if (currentSessionToken !== oldSessionToken) {
                        setApiKey(currentSessionToken);
                    }
                }
                if ('account' in changes) {
                    const currentAccount = changes['account'].newValue;
                    const oldAccount = changes['account'].oldValue;
                    if (currentAccount != oldAccount) {
                        setAccount(currentAccount);
                        accountRef.current = currentAccount;
                    }
                }
                if ('currency' in changes) {
                    const currentCurrency = changes['currency'].newValue;
                    const oldCurrency = changes['currency'].oldValue;
                    if (currentCurrency !== oldCurrency) {
                        setAccountCurrency(currentCurrency);
                        if (currentCurrency) {
                            conversionRatesProvider = new ConversionRatesProvider(currentCurrency, setConversionRates);
                        }
                    }
                }
                if ('broker' in changes) {
                    const currentBroker = changes['broker'].newValue;
                    const oldBroker = changes['broker'].oldValue;
                    if (currentBroker !== oldBroker) {
                        setBroker(currentBroker);
                    }
                }
            }
        });

        return () => {
            if (!businessEventsProvider) return; 
            businessEventsProvider.cleanup();
        };
    }, [])

    useEffect(() => {
        if (position?.type === 'market' && chartInputs?.xScaleData) {
            if (!followLivePrice) {
                const lastPrice = yEdgeIndicator(chartInputs.xScaleData[chartInputs.xScaleData.length - 1])
                if (lastPrice) {
                    setPosition({ ...position, openPrice: lastPrice })
                }
            } else {
                setPosition({ ...position, openPrice: undefined })
            }
        }
    }, [followLivePrice])

    useEffect(() => {
        const fetch = async () => {
            if (symbol && account && apiKey) {
                setPosition(null);
                const accountInstrumentDetails = await getInstrumentDetails(account, apiKey, symbol);
                const response = await getInstruments(apiKey, symbol);
                const accountInstrument = accountInstrumentDetails && accountInstrumentDetails.instrumentDetails ? accountInstrumentDetails.instrumentDetails[0] : undefined;
                const instrument = response && response.instruments ? response.instruments[0] : undefined;
                console.log('instrument', instrument, accountInstrument)
                if (instrument && accountInstrument) {
                    setInstrument({ ...instrument, ...accountInstrument })
                } else {
                    console.warn('Instrument not found ' + symbol)
                }
            }
        }
        fetch();
    }, [symbol, account, apiKey])

    useEffect(() => {
        if (instrument && conversionRates && accountCurrency) {
            const quoteCurrency = instrument.currency;
            const cr = conversionRates.find(cr => cr.to === accountCurrency && cr.from === quoteCurrency)?.value;
            console.log("cr: " + cr);
            if (cr !== conversionRate 
                && (!cr || isNaN(cr) || !conversionRate || isNaN(conversionRate) || Math.abs((cr - conversionRate) / conversionRate) > 0.01)) {
                console.log("change > 1%, update");
                setConversionRate(cr);
            }
        }
    }, [conversionRates, instrument, accountCurrency])


    useEffect(() => {
        if (candlesProvider && subId.current) {
            candlesProvider.unsubscribeMarketData({ refRequestId: subId.current })
        }
        if (symbol && timeframe) {
            console.log('resubscribing')
            // const cp = new MarketDataWsApi(callback);
            // candlesProvider = cp;
            setCandlesData([]);
            console.log('subscribing to live data for symbol: ' + symbol + ' timeframe: ' + timeframe + ' account: ' + accountRef.current + ' ' + candlesProvider)
            if (candlesProvider && symbol && timeframe && accountRef.current) {
                const id = candlesProvider.subscribeMarketData({
                    account: accountRef.current,
                    symbols: [symbol],
                    timeframe: timeframe,
                });
                console.log('NEW ID+' + id)
                subId.current = id;
                setChartKey(id)
            }
        } else {
            console.error('symbol or timeframe not specified');
        }
    }, [symbol, timeframe])

    useEffect(() => {
        const chartContainer = chartContainerRef.current;
        if (!chartContainer) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setChartWidth(width);
                setChartHeight(height);
            }
        });

        resizeObserver.observe(chartContainer);
        return () => resizeObserver.disconnect();
    }, []);


    useEffect(() => {
        if (candlesData.length > 0) {
            const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
                (d) => d.date
            );
            const { data: newXScaleData, xScale: newXScale, xAccessor: newXAccessor, displayXAccessor: newDisplayXAccessor } =
                xScaleProvider([...candlesData].sort((a, b) => a.date.getTime() - b.date.getTime()));

            setChartInputs({ xScaleData: newXScaleData, xScale: newXScale, displayXAccessor: newDisplayXAccessor, xAccessor: newXAccessor })
        }
        else {
            setChartInputs({
                xScaleData: [],
                xScale: undefined,
                displayXAccessor: undefined,
                xAccessor: undefined
            });
        }
    }, [candlesData]);

    useEffect(() => {
        console.log("123 " + apiKey + " " + account)
        fetchOpenedPositions();
    }, [apiKey, account])

    useEffect(() => {
        const handlePositionUpdate = (event: CustomEvent) => {
            if (event.detail.diaplayPTP !== undefined && event.detail.positionId && event.detail.symbol && event.detail.symbol === symbol) {
                setPartialTp(event.detail.diaplayPTP);
                setPositionId(event.detail.positionId)
            }
        };

        window.addEventListener('positionUpdate', handlePositionUpdate as EventListener);

        return () => {
            window.removeEventListener('positionUpdate', handlePositionUpdate as EventListener);
        };
    }, [symbol]);

    const fetchOpenedPositions = async () => {
        console.log(apiKey + ' ' + account)
        if (apiKey && account && broker) {
            const positions = await listPositions(broker, apiKey, account);
            console.log(JSON.stringify(positions))
            setOpenedPositions(positions ? positions : []);
        }
    }

    const margin = { left: 0, right: 60, top: 0, bottom: 24 };

    const dateTimeFormat = "%x %X";
    const timeDisplayFormat = timeFormat(dateTimeFormat);


    const yEdgeIndicator = (data: any) => {
        return data ? data.close : undefined;
    };

    const openCloseColor = (data: any) => {
        return data.close > data.open ? "#26a69a" : "#ef5350";
    };

    const toggleLimitOrder = () => {
        if (!position || !chartInputs?.xScaleData) return;
        const edge = chartInputs.xScaleData[chartInputs.xScaleData.length - 1];
        const currentPrice = yEdgeIndicator(edge);
        if (position.type === 'limit') {
            const isLong = position.isLong ? false : position.isLong == undefined ? true : undefined;
            const type = isLong == undefined ? 'market' : 'limit';
            if (followLivePrice && type === 'market') {
                setPosition({ ...position, type: type, isLong: isLong, openPrice: undefined })
            } else {
                setPosition({ ...position, type: type, isLong: isLong })
            }
        } else if (edge) {
            const isLong = position.isLong == undefined ? true : position.isLong;
            if (followLivePrice) {
                setPosition({ ...position, isLong: isLong, type: 'limit', openPrice: undefined })
            } else {
                setPosition({ ...position, isLong: isLong, type: 'limit', openPrice: currentPrice })
            }
        }
    }

    return (
        <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }}>
            {instrument
                && chartInputs
                && chartInputs.xScaleData
                && chartInputs.xAccessor
                && chartInputs.displayXAccessor
                && chartInputs.xScale
                && chartInputs.xScaleData.length > 0
                && symbol
                && chartKey
                && conversionRate
                && accountBalance
                && (!useEquity || accountEquity)
                && accountCurrency
                && broker &&
                <>
                    <Toolbar
                        broker={broker}
                        followLivePrice={followLivePrice}
                        conversionRate={conversionRate}
                        accountCurrency={accountCurrency}
                        instrument={instrument}
                        account={account}
                        accountBalance={useEquity ? accountEquity : accountBalance}
                        apiKey={apiKey}
                        symbol={symbol}
                        edge={chartInputs.xScaleData[chartInputs.xScaleData.length - 1]}
                        toggleLimitOrder={toggleLimitOrder}
                        yAccessor={yEdgeIndicator}
                        position={position}
                        setPosition={setPosition}
                    />
                    <ChartCanvas
                        key={chartKey}
                        height={chartHeight}
                        ratio={1}
                        width={chartWidth}
                        margin={margin}
                        data={chartInputs.xScaleData}
                        seriesName="Data"
                        xScale={chartInputs.xScale}
                        xAccessor={chartInputs.xAccessor}
                        displayXAccessor={chartInputs.displayXAccessor}
                    >
                        <Chart id={chartKey} yExtents={(d) => [d.high, d.low]}>
                            <YAxis tickLabelFill="#FFFFFF" tickFormat={getPriceFormat(instrument)} fontSize={12} />
                            <XAxis tickLabelFill="#FFFFFF" />

                            <CandlestickSeries />
                            <MouseCoordinateY
                                rectWidth={margin.right}
                                displayFormat={getPriceFormat(instrument)}
                            />
                            <MouseCoordinateX displayFormat={timeDisplayFormat} />
                            <EdgeIndicator
                                itemType="last"
                                fullWidth
                                rectWidth={margin.right}
                                fill={openCloseColor}
                                lineStroke={openCloseColor}
                                displayFormat={getPriceFormat(instrument)}
                                yAccessor={yEdgeIndicator}
                            />
                            <ProtectionOrderLevels
                                openedPositions={openedPositions.filter(p => p.position.symbol === instrument.symbol)}
                                instrument={instrument} />
                            {position && position.isLong !== undefined &&
                                <PositionIndicatorInteractive
                                    key={chartKey}
                                    instrument={instrument}
                                    followLivePrice={followLivePrice}
                                    conversionRate={conversionRate}
                                    position={position}
                                    setPosition={setPosition}
                                    edge={chartInputs.xScaleData[chartInputs.xScaleData.length - 1]}
                                    yAccessor={yEdgeIndicator}
                                    xAccessor={chartInputs.xAccessor}
                                />
                            }
                            {position && positionId && partialTp && <PartialTakeProfit
                                edge={chartInputs.xScaleData[chartInputs.xScaleData.length - 1]}
                                position={position}
                                positionId={positionId} />}

                            <OHLCTooltip origin={[8, 16]} textFill={'white'} />
                        </Chart>
                        <CrossHairCursor />
                    </ChartCanvas>
                </>
            }
        </div>
    );
}

export default CustomPlot;