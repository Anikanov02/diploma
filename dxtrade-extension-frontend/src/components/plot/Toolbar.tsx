import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import "./toolbarStyles.css"
import TextField from "@mui/material/TextField";
import { PositionSide, PlaceOrderRequest } from "../../dto/internal/request/PlaceOrderRequest";
import { v4 as uuidv4 } from 'uuid';
import { placeOrder } from "../../api/internal/orders.api";
import { IToolbarProps, IToolbarState } from "./plot.interfaces";
import { calculatePositionForToolbar, changeLot, changeRR, changeRisk, changeSL, changeTPCount, getMinimumSLStep, getPriceFormat, getRoundedToStep, getSLFormat, getSLToolbarFormat, toBaseCurrency, toQuoteCurrency } from "../../helpers/calculatorHelper";
import { ConversionRate } from "../../api/dxtrade/conversionRatesProvider";
import { useEventCallback } from "@mui/material";
import { format } from "d3-format";
const logo = chrome.runtime.getURL('js/icons/image25.png');

const DEFAULT_TOOLBAR_STATE: any = {
    riskPercentage: 1,
    inputType: 'percentage',
}

const formatValue = format('.2f');

const Toolbar = ({ broker, followLivePrice, symbol, instrument, account, accountBalance, conversionRate, accountCurrency, apiKey, edge, yAccessor, position, setPosition, toggleLimitOrder }: IToolbarProps) => {
    const [toolbarParams, setToolbarParams] = useState<IToolbarState | null>(null)
    const [riskCashChanging, setRiskCashChanging] = useState(false);
    const priceFormat = getPriceFormat(instrument)
    const formatSL = getSLToolbarFormat(instrument); // getSLFormat(instrument);

    // useEffect(() => {
    //     setToolbarParams(null);
    // }, [symbol, instrument])

    useEffect(() => {
        const convertedAccountBalance = toQuoteCurrency(accountBalance, conversionRate);
        if (convertedAccountBalance && !isNaN(convertedAccountBalance)) {
            const currentPrice = edge ? yAccessor(edge) : undefined;
            if (position && toolbarParams && currentPrice) {
                let riskCash;
                if (toolbarParams.inputType === 'percentage' && toolbarParams.riskPercentage) {
                    riskCash = (convertedAccountBalance / 100) * toolbarParams.riskPercentage!;
                } else {
                    riskCash = toolbarParams.riskCash!;
                }
                if (riskCash && Number(riskCash) > 0 && Math.abs(position.riskCash - riskCash) / position.riskCash > 0.005) {
                    changeRisk(riskCash, instrument, currentPrice, position, setPosition)
                }
            } else if (!toolbarParams || toolbarParams.riskCash === 0) {
                const riskPercentage = DEFAULT_TOOLBAR_STATE.riskPercentage!;
                const riskCash = (convertedAccountBalance / 100) * riskPercentage;
                setToolbarParams({
                    inputType: 'percentage',
                    riskPercentage,
                    riskCash,
                    profit: 0,
                    rr: 0,
                    lot: 0.01,
                    sl: 20,
                    tpZonesCount: 1,
                })
            }
        } else {
            setToolbarParams({
                inputType: 'percentage',
                riskPercentage: 0,
                riskCash: 0,
                profit: 0,
                rr: 0,
                lot: 0.01,
                sl: 20,
                tpZonesCount: 1,
            })
        }
    }, [accountBalance, conversionRate, symbol, instrument])


    useEffect(() => {
        const convertedAccountBalance = toQuoteCurrency(accountBalance, conversionRate);
        if (position) {
            const { openPrice, lot, sl, tpZones, riskCash, rr } = position;
            const zonesProfit = tpZones.map((tpZone, i) => tpZone.lot * tpZone.tp * instrument.pipSize * instrument.lotSize);
            const profitTotal = zonesProfit.reduce((acc, zoneProfit, i) => acc + zoneProfit, 0);
            const riskPercentage = getRoundedToStep((riskCash / convertedAccountBalance!) * 100, 0.01);

            setToolbarParams({
                inputType: toolbarParams?.inputType || 'percentage',
                riskPercentage,
                riskCash,
                profit: profitTotal,
                rr,
                lot,
                sl,
                tpZonesCount: tpZones.length,
            });
        }
    }, [position])

    const handleSLInputChange = (event: any) => {
        const value = event.target.value;
        setToolbarParams({
            ...toolbarParams!,
            sl: value
        });
    }

    const handleRiskInputChange = (event: any) => {
        const value = event.target.value;
        setRiskCashChanging(true)
        setToolbarParams({
            ...toolbarParams!,
            riskCash: value
        });
    }

    //TODO handle cr
    const handleRiskChange = (event: any) => {
        setRiskCashChanging(false);
        let value = event.target.value;
        if (value == 0) {
            setToolbarParams({
                ...toolbarParams!,
                riskCash: value,
                riskPercentage: value
            });
            return;
        }
        const currentPrice = yAccessor(edge);
        const convertedAccountBalance = toQuoteCurrency(accountBalance, conversionRate);
        const convertedValue = toQuoteCurrency(value, conversionRate);
        if (!isNaN(value) && Number(value) > 0 && convertedAccountBalance && convertedValue && currentPrice) {
            const riskCash = toolbarParams?.inputType === 'percentage' ? (convertedAccountBalance / 100) * value : convertedValue;
            const riskPercentage = toolbarParams?.inputType === 'percentage' ? value : getRoundedToStep((convertedValue / convertedAccountBalance) * 100, 0.01);
            if (position) {
                changeRisk(riskCash, instrument, currentPrice, position, setPosition);
            } else {
                setToolbarParams({
                    ...toolbarParams!,
                    riskPercentage,
                    riskCash,
                });
            }
        }
    };

    const handleRRChange = (event: any) => {
        const value = event.target.value;
        const currentPrice = yAccessor(edge);
        const rr = parseFloat(value);
        if (!isNaN(value) && currentPrice && rr >= 0) {
            if (position) {
                changeRR(value, instrument, currentPrice, position, setPosition);
            } else {
                setToolbarParams({
                    ...toolbarParams!,
                    rr: value
                });
            }
        }
    }

    const handleLotChange = (event: any) => {
        const value = event.target.value;
        if (value == 0) {
            setToolbarParams({
                ...toolbarParams!,
                lot: value
            });
            return;
        }
        const currentPrice = yAccessor(edge);
        if (!isNaN(value) && currentPrice && position && Number(value) > 0) {
            changeLot(value, instrument, currentPrice, position, setPosition);
        }
    }

    const handleSLChange = (event: any) => {
        const value = event.target.value;
        if (value == 0) {
            setToolbarParams({
                ...toolbarParams!,
                sl: value
            });
            return;
        }
        const currentPrice = yAccessor(edge);
        if (!isNaN(value) && currentPrice && position && Number(value) > 0) {
            changeSL(parseFloat(value), instrument, currentPrice, position, setPosition);
        }
    }

    const handleTPChange = (event: any) => {
        const value = event.target.value;
        if (!isNaN(value) && Number(value) >= 1 && Number(value) <= 3) {
            if (position) {
                changeTPCount(value, instrument, position, setPosition);
            } else {
                setToolbarParams({
                    ...toolbarParams!,
                    tpZonesCount: Number(value)
                });
            }
        }
    }

    const displayLongPosition = (isLong: boolean) => {
        const currentPrice = yAccessor(edge);
        if (position) {
            const newIsLong = position.isLong == isLong ? undefined : isLong;
            if (followLivePrice) {
                setPosition({ ...position, isLong: newIsLong, openPrice: undefined, type: 'market' });
            } else {
                setPosition({ ...position, isLong: newIsLong, openPrice: currentPrice, type: 'market' });
            }
        } else if (accountBalance && toolbarParams) {
            if (!currentPrice) {
                return;
            }
            calculatePositionForToolbar(toolbarParams, instrument, currentPrice, isLong, setPosition)
        }
    }

    const handleToggle = () => {
        if (position) {
            toggleLimitOrder();
        } else if (accountBalance && toolbarParams) {
            const currentPrice = yAccessor(edge);
            if (!currentPrice) {
                return;
            }
            calculatePositionForToolbar(toolbarParams, instrument, currentPrice, true, setPosition, 'limit')
        }
    }

    const toggleRiskCash = () => {
        if (!toolbarParams || !accountBalance) return;
        setToolbarParams({
            ...toolbarParams,
            inputType: toolbarParams.inputType === 'percentage' ? 'cash' : 'percentage',
        })
    }

    //TODO all LONG/SHORT handling
    const openPosition = () => {
        if (!position) {
            return;
        }
        const currentPrice = position.openPrice ?? yAccessor(edge);
        const tpZones = position.tpZones;
        const sl = position.sl;
        if (apiKey && position.lot && account && currentPrice && tpZones && sl) {
            const requestId = uuidv4();
            const positionSize = parseFloat((position.lot * instrument.lotSize).toFixed(5)); // do not round
            const tpOrders = position.tpZones.map((tpZone) => ({
                orderId: uuidv4(),
                quantity: parseFloat((tpZone.lot * instrument.lotSize).toFixed(5)), // do not round
                price: priceFormat(currentPrice + tpZone.tp * instrument.pipSize * (position.isLong ? 1 : -1))
            }));
            const slOrder = {
                orderId: uuidv4(),
                quantity: positionSize,
                price: priceFormat(currentPrice - sl * instrument.pipSize * (position.isLong ? 1 : -1))
            }

            const request: PlaceOrderRequest = {
                broker: broker,
                apiKey: apiKey,
                orderId: requestId,
                // accountCode: 'default:1210004522',
                accountCode: account,
                quantity: positionSize,
                orderType: position.type === 'limit' ? 'LIMIT' : 'MARKET',
                limitPrice: position.type === 'limit' && position.openPrice ? priceFormat(position.openPrice) : undefined,
                instrument: symbol,
                positionSide: position.isLong ? PositionSide.LONG : PositionSide.SHORT,
                takeProfits: tpOrders.filter((order) => order.quantity > 0),
                stopLosses: [slOrder]
            }
            placeOrder(request).then((response) => {
                console.log('order placed', response);
                setPosition(null);
            })
        }
    }

    return (
        <Draggable cancel="input">
            <div className="toolbar-container">
                <img src={logo} draggable={false} />
                {toolbarParams?.inputType === 'percentage' ? (
                    <>
                        <label className="riskLabel" onClick={toggleRiskCash}>Risk %</label>
                        <TextField
                            type="number"
                            value={toolbarParams?.riskPercentage}
                            onChange={handleRiskChange}
                            onDoubleClick={(e: any) => e.target.select()}
                            inputProps={{
                                min: 1,
                                max: 100
                            }}
                            sx={{
                                marginLeft: '5px',
                                width: '70px'
                            }}
                        />
                    </>) : (
                    <>
                        <label className="riskLabel" onClick={toggleRiskCash}>Cash</label>
                        <TextField
                            type="number"
                            value={(toolbarParams?.riskCash && toolbarParams?.riskCash != 0 && !riskCashChanging) ? toBaseCurrency(toolbarParams?.riskCash, conversionRate) : toolbarParams?.riskCash}
                            onChange={handleRiskInputChange}
                            onBlur={handleRiskChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    (e.target as HTMLElement).blur();
                                }
                            }}
                            onDoubleClick={(e: any) => e.target.select()}
                            inputProps={{
                                min: 1,
                                max: accountBalance
                            }}
                            sx={{
                                marginLeft: '5px',
                                width: '70px'
                            }}
                        />
                    </>
                )}
                <label>Profit</label>
                <TextField
                    onDoubleClick={(e: any) => e.target.select()}
                    InputProps={{
                        readOnly: true,
                        value: `${accountCurrency}: ${formatValue(toBaseCurrency(toolbarParams?.profit, conversionRate) || 0)}`,
                    }}
                    sx={{
                        marginLeft: '5px',
                        width: '100px'
                    }}
                />
                <label>R:R</label>
                <TextField
                    type="number"
                    value={toolbarParams?.rr}
                    onChange={handleRRChange}
                    onDoubleClick={(e: any) => e.target.select()}
                    inputProps={{
                        step: 0.1,
                        min: 0,
                    }}
                    sx={{
                        marginLeft: '5px',
                        width: '50px'
                    }}
                />
                <label>Lot</label>
                <TextField
                    type="number"
                    value={toolbarParams?.lot}
                    onChange={handleLotChange}
                    onDoubleClick={(e: any) => e.target.select()}
                    inputProps={{
                        step: 0.01,
                        min: 0.01,
                        max: 100
                    }}
                    sx={{
                        marginLeft: '5px',
                        width: '50px'
                    }}
                />
                <label>SL</label>
                <TextField
                    type="number"
                    value={(toolbarParams?.sl && toolbarParams?.sl != 0 && typeof toolbarParams?.sl === "number") ? formatSL(toolbarParams?.sl) : toolbarParams?.sl}
                    onChange={handleSLInputChange}
                    onDoubleClick={(e: any) => e.target.select()}
                    onBlur={handleSLChange}
                    inputProps={{
                        step: getMinimumSLStep(instrument),
                        min: 0.1,
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            (e.target as HTMLElement).blur();
                        }
                    }}
                    sx={{
                        marginLeft: '5px',
                        width: '70px'
                    }}
                />
                <label>TP</label>
                <TextField
                    type="number"
                    value={toolbarParams?.tpZonesCount}
                    onChange={handleTPChange}
                    onDoubleClick={(e: any) => e.target.select()}
                    inputProps={{
                        min: 1,
                        max: 3,
                        step: 1,
                    }}
                    sx={{
                        marginLeft: '5px',
                        width: '50px'
                    }}
                />
                <IconButton
                    onClick={() => displayLongPosition(true)}
                    disabled={toolbarParams?.riskCash == 0}
                    sx={{
                        backgroundColor: "green",
                        borderRadius: "50%",
                        margin: "3px",
                        width: "24px",
                        height: "24px"
                    }}>
                    <KeyboardArrowUpIcon fontSize="large" />
                </IconButton>
                <IconButton
                    onClick={() => displayLongPosition(false)}
                    disabled={toolbarParams?.riskCash == 0}
                    sx={{
                        backgroundColor: "indianred",
                        borderRadius: "50%",
                        margin: "3px",
                        width: "24px",
                        height: "24px"
                    }}>
                    <KeyboardArrowDownIcon fontSize="large" />
                </IconButton>
                <IconButton
                    onClick={handleToggle}

                    sx={{
                        backgroundColor: "orange",
                        borderRadius: "50%",
                        margin: "3px",
                        width: "24px",
                        height: "24px"
                    }}>
                    <SwapVertIcon fontSize="large" />
                </IconButton>
                <IconButton
                    onClick={openPosition}

                    sx={{
                        backgroundColor: "blue",
                        borderRadius: "50%",
                        margin: "3px",
                        width: "24px",
                        height: "24px"
                    }}>
                    <CheckIcon fontSize="large" />
                </IconButton>
            </div>
        </Draggable >
    )
}

export default Toolbar;