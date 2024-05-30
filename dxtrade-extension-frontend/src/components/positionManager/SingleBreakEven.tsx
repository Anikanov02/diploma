import React, { useEffect, useState } from "react";
import { SinglePositionManagerProps } from "./positionManager.interfaces";
import { Checkbox } from "@mui/material";
import { breakEven, listPositions } from "../../api/internal/user.api";
import BreakEven from "./BreakEven";
import { BusinessEventsCallback, BusinessEventsWsApi } from "../../api/dxtrade/businessEventsWebsocket.api";
import { Broker } from "../../dto/internal/Broker";

const SingleBreakEven: React.FC<SinglePositionManagerProps> = (props) => {
    const {
        ws,
        positionId
    } = props;

    const [account, setAccount] = useState();
    const [token, setToken] = useState();
    const [isBreakEven, setIsBreakEven] = useState<boolean>(false);
    const [broker, setBroker] = useState<string>();

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
        onPositions: (data: any) => {
            const pos = data?.filter((pos: any) => pos && pos.position && pos.position.positionCode === positionId)[0];
            update(pos)
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

    const update = (pos: any) => {
        const orders = pos?.orders;
        console.log('POSITION_ID=' + positionId)

        if (orders) {
            const openOrder = orders.find((order: any) => order.leg.positionEffect === "OPEN" && order.type === "MARKET");
            const closeOrder = orders.find((order: any) => order.leg.positionEffect === "CLOSE" && order.type === "STOP");

            if (openOrder && closeOrder) {
                const openPrice = openOrder.leg.price ? openOrder.leg.price : openOrder.leg.averagePrice;
                if (openPrice === closeOrder.leg.price) {
                    setIsBreakEven(true);
                } else {
                    setIsBreakEven(false);
                }
            } else if (!closeOrder) {
                setIsBreakEven(false);
            }
        }
    }

    useEffect(() => {
        const getPosition = async () => {
            if (token && account && broker) {
                const resp = await listPositions(broker, token, account);
                const pos = resp?.filter(position => position && position.position && position.position.positionCode === positionId)[0];
                update(pos)
            }
        }

        getPosition();
    }, [positionId, account, token])

    const positionBreakEven = () => {
        if (account && token && broker) {
            breakEven(broker, token, account, [positionId]);
            setIsBreakEven(true);
        }
    }

    return (
        <>
            <BreakEven
                type="checkbox"
                disabled={isBreakEven || !(account && token && broker)}
                checked={isBreakEven}
                onAction={positionBreakEven}
            />
        </>
    )
}

export default SingleBreakEven;