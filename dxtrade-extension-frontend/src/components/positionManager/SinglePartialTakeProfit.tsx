import { Button, Checkbox, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { SinglePositionManagerProps } from "./positionManager.interfaces";
import { breakEven, listPositions, partialTakeProfit } from "../../api/internal/user.api";
import "./positionManager.css"
import { Instrument } from "../../dto/dxtrade/response/InstrumentResponse";
import { getInstrumentDetails, getInstruments } from "../../api/dxtrade/reference.api";
import { getFlooredToStep } from "../../helpers/calculatorHelper";
import PartialTakeProfit from "./PartialTakeProfit";
import { BusinessEventsCallback, BusinessEventsWsApi } from "../../api/dxtrade/businessEventsWebsocket.api";
import { Broker } from "../../dto/internal/Broker";

// const handlePartialTPtest = (percentage: number) => {
//     const lostSizes = [1, 10, 100, 1000, 100000];
//     const minOrderSizeIncrement = 0.01;
//     console.log('start test percentage', percentage)

//     for (const lotSize of lostSizes) {
//         // array of numbers from 1 to 100
//         const positionQuantities = Array.from({ length: 200 }, (_, i) => parseFloat((minOrderSizeIncrement * lotSize * (i + 1)).toFixed(2)));
//         console.log('test lotSize', lotSize)
//         for (const positionQuantity of positionQuantities) {
//             let quantityToClose = positionQuantity * percentage / 100;
//             let orderSize = getFlooredToStep(quantityToClose, minOrderSizeIncrement * lotSize);
//             if (percentage === 100) {
//                 orderSize = positionQuantity;
//             }
//             // const orderSize = floored * lotSize;
//             if (orderSize.toString().length > 10) {
//                 console.log('too long order size')
//                 console.log(positionQuantity + ' ' + quantityToClose + ' ' + orderSize)
//             }
//             if (percentage === 100 && orderSize !== positionQuantity) {
//                 console.log('100% not equal', positionQuantity + ' ' + quantityToClose + ' ' + orderSize)
//             }
//         }
//     }
// }

const SinglePartialTakeProfit: React.FC<SinglePositionManagerProps> = (props) => {
    const {
        ws,
        positionId
    } = props;

    const [position, setPosition] = useState<any>();
    const [partialTp, setPartialTp] = useState<boolean>(false);
    const [account, setAccount] = useState();
    const [token, setToken] = useState();
    const [broker, setBroker] = useState<string>();
    
    const [instrument, setInstrument] = useState<Instrument>();
    const [controlsDisabled, setControlsDisabled] = useState<boolean>(false);

    const businessEventsCallback: BusinessEventsCallback = {
        onOpen: () => {
            // if (businessEventsProvider && account) {
            //     businessEventsProvider.subscribePortfolios(account)
            // } 
        },
        onAccountMetrics: (data) => {
        },
        onConversionRates: (data) => {
        },
        onAccountPostfoliosMessage: (data) => {
        },
        onPositions:  (data: any) => {
            setControlsDisabled(false);
            const pos = data?.filter((pos: any) => pos && pos.position && pos.position.positionCode === positionId)[0];
            setPosition(pos)
        }
    }

    useEffect(() => {
        chrome.storage.local.get(null, function (data) {
            if (data && data.sessionToken && data.account && data.broker) {
                setAccount(data.account);
                setToken(data.sessionToken);
                setBroker(data.broker)
            }
        });

        const handlePositionUpdate = (event: CustomEvent) => {
            if (event.detail.position && event.detail.price && event.detail.positionId && event.detail.positionId === positionId) {
                console.log("got TP update")

            }
        };

        window.addEventListener('partialTp', handlePositionUpdate as EventListener);

        // const ws = new BusinessEventsWsApi(businessEventsCallback);
        ws.addCallback(businessEventsCallback)

        chrome.storage.onChanged.addListener(function (changes, areaName) {
            console.log(JSON.stringify(changes))
            if (areaName === 'local') {
                if ('sessionToken' in changes) {
                    const currentSessionToken = changes['sessionToken'].newValue;
                    const oldSessionToken = changes['sessionToken'].oldValue;
                    if (currentSessionToken !== oldSessionToken) {
                        setToken(currentSessionToken);
                    }
                }
                if ('account' in changes) {
                    const currentAccount = changes['account'].newValue;
                    const oldAccount = changes['account'].oldValue;
                    if (currentAccount != oldAccount) {
                        setAccount(currentAccount);
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
            window.removeEventListener('partialTp', handlePositionUpdate as EventListener);
            ws.cleanup();
        };
    }, [])

    useEffect(() => {
        const getPosition = async () => {
            if (token && account && broker) {
                const resp = await listPositions(broker, token, account);
                const pos = resp?.filter(position => position && position.position && position.position.positionCode === positionId)[0];
                setPosition(pos)

                const accountInstrumentDetails = await getInstrumentDetails(account, token, pos.position.symbol);
                const response = await getInstruments(token, pos.position.symbol);
                const accountInstrument = accountInstrumentDetails && accountInstrumentDetails.instrumentDetails ? accountInstrumentDetails.instrumentDetails[0] : undefined;
                const instrument = response && response.instruments ? response.instruments[0] : undefined;
                if (instrument && accountInstrument) {
                    setInstrument({ ...instrument, ...accountInstrument })
                } else {
                    console.log('Instrument not found ' + pos.position.symbol)
                }
            }
        }

        getPosition();
    }, [positionId, account, token, broker])

    const handlePartialTP = (percentage: number) => {
        if (position && instrument && account && token && broker) {
            let quantityToClose = position.position.quantity * percentage / 100;
            let orderSize = getFlooredToStep(quantityToClose, instrument.minOrderSizeIncrement * instrument.lotSize );
            if (percentage === 100) {
                orderSize = position.position.quantity;
            }

            if (orderSize > 0) {
                setControlsDisabled(true);
                partialTakeProfit(broker, token, account, [{positionId: positionId, amount: orderSize}])
            }

            const event = new CustomEvent('positionUpdate', { detail: { symbol: position.position.symbol, diaplayPTP: !partialTp, positionId: positionId } });
            setPartialTp(!partialTp);
            window.dispatchEvent(event);
        }
    }

    return (
        <>
            <PartialTakeProfit
                disabled={controlsDisabled || !(position && instrument && account && token && broker)}
                handlePartialTP={handlePartialTP}
            />
        </>
    )
}

export default SinglePartialTakeProfit;