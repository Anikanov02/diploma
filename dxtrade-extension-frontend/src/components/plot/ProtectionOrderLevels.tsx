import React, { useEffect, useRef, useState } from "react";
import { ProtectionOrderLevelsProps } from "./plot.interfaces"
import { PriceLine } from "./PriceLine";
import { strokeDashTypes } from "react-financial-charts";
import { InteractiveText } from "./InterractiveText";
import { modifyOrder } from "../../api/internal/orders.api";
import { ModifyOrderRequest } from "../../dto/internal/request/PlaceOrderRequest";
import { getRoundedToStep } from "../../helpers/calculatorHelper";

const ProtectionOrderLevels: React.FC<ProtectionOrderLevelsProps> = (props) => {
    const [protectionOrders, setProtectionOrders] = useState<any[]>([]);
    const { openedPositions, instrument } = props
    const [modifiedOrder, setModifiedOrder] = useState<any | null>(null);
    const dragStartValue = useRef<number | null>(null);

    useEffect(() => {
        const positionOrders = openedPositions
        .filter(pos => pos.position.symbol === instrument.symbol)
        .flatMap(pos => pos.orders ? pos.orders.map((o: any) => ({
            ...o,
            quantity: pos.position.quantity, 
            positionCode: pos.position.positionCode
        }))  : [])
        .filter(order => order 
            && order.leg 
            && order.leg.positionEffect 
            && (order.leg.price || order.leg.averagePrice)
            && order.type && (order.type !== 'MARKET' || order.leg.positionEffect === 'OPEN'))
        setProtectionOrders(positionOrders);
        console.log('positionOrders', positionOrders, openedPositions)
    }, [openedPositions, instrument])

    const getPriceLineProps = (order: any) => {
        const price = (order.orderCode === modifiedOrder?.orderCode) ? modifiedOrder.price : (order.leg.price ?? order.leg.averagePrice)
        // const price = order.leg.price ?? order.leg.averagePrice;
        const stroke = order.leg.positionEffect === 'OPEN' ? 'gray' : order.type === 'LIMIT' ? "#2e6a3e" : "#692736";
        const lineStroke = stroke;
        const fill = stroke;
        const strokeWidth = 0.5;
        const strokeDasharray = order.leg.positionEffect === 'OPEN' ? "LongDash" : "Solid" as strokeDashTypes;
        const textFill = "white";
        return { price, stroke, lineStroke, fill, textFill, strokeWidth, strokeDasharray }
    }

    const getLabelText = (order: any) => {
        if (order.leg.positionEffect === 'OPEN') {
            return `${order.side?.at(0)} ${(order.quantity / instrument.lotSize).toFixed(2)} @${order.leg.price ?? order.leg.averagePrice}`
        }
        const orderPrice = (order.orderCode === modifiedOrder?.orderCode) ? modifiedOrder.price : order.leg.price
        return `${order.type === 'LIMIT' ? 'TP' : 'SL'} ${(order.quantity / instrument.lotSize).toFixed(2)} @${orderPrice}`
    }

    const onOrderDragStart = (e: React.MouseEvent, order: any) => {
        console.log('drag start', order)
        if (order.type === 'MARKET') {
            setModifiedOrder(null);
            return;
        }
        const raw = (order.orderCode === modifiedOrder?.orderCode) ? modifiedOrder.price : (order.leg.price ?? order.leg.averagePrice)
        const price = getRoundedToStep(raw, instrument.priceIncrement)
        setModifiedOrder({
            quantity: order.quantity,
            orderCode: order.orderCode, 
            price, 
            side: order.side,
            type: order.type,
            positionCode: order.positionCode
        });
        dragStartValue.current = price;
    }

    const onOrderDrag = (e: React.MouseEvent, moreProps: any) => {
        console.log('drag')
        const startValue = dragStartValue.current;
    
        const {
            chartConfig: { yScale },
        } = moreProps;
        const { startPos, mouseXY } = moreProps;
        const prevY = yScale(startValue);
        const dy = startPos[1] - mouseXY[1];
        const newY = prevY - dy;
        const newPriceValue = getRoundedToStep(yScale.invert(newY), instrument.priceIncrement);
        
        setModifiedOrder((prev: any) => ({...prev, price: newPriceValue}));
    }

    const onDragComplete = (e: React.MouseEvent, moreProps: any) => {
        dragStartValue.current = null;
    }

    const applyOrderModification = () => {
        if (!modifiedOrder) return;
        chrome.storage.local.get(null, function (data) {
            if (data && data.account && data.sessionToken && data.broker) {
                const request: ModifyOrderRequest = {
                    broker: data.broker,
                    apiKey: data.sessionToken,
                    orderCode: modifiedOrder.orderCode,
                    accountCode: data.account,
                    quantity: modifiedOrder.quantity,
                    orderSide: modifiedOrder.side,
                    // limitPrice: position.type === 'limit' && position.openPrice ? priceFormat(position.openPrice) : undefined,
                    limitPrice: modifiedOrder.price,
                    instrument: instrument.symbol,
                    orderType: modifiedOrder.type,
                    positionCode: modifiedOrder.positionCode
                }
                modifyOrder(request)
            }
        })
    }

    const cancelModification = () => {
        setModifiedOrder(null);
    }

    return (
        <g>
            {protectionOrders.map((order) => {
                const orderPrice = (order.orderCode === modifiedOrder?.orderCode) ? modifiedOrder.price : (order.leg.price ?? order.leg.averagePrice)
                return (
                <g>
                    <PriceLine
                        at="left"
                        opacity={0}
                        orient="right"
                        {...getPriceLineProps(order)}
                        displayFormat={() => undefined}// getPriceFormat(instrument)}
                    />
                    <InteractiveText
                        bgFillStyle="#2e2e47"
                        bgStrokeWidth={1}
                        selected={order.leg.positionEffect !== 'OPEN'}
                        bgStroke="#5f5f70"
                        fontFamily="Arial"
                        position={[null, orderPrice]}
                        positionScaled={[100, null]}
                        fontSize={10}
                        fontWeight="normal"
                        fontStyle="normal"
                        text={getLabelText(order)}
                        textFill="white"
                        minWidth={120}
                        onDragStart={(e) => onOrderDragStart(e, order)}
                        onDrag={onOrderDrag}
                        onDragComplete={onDragComplete}
                        onHover={() => {}}
                        onClick={() => console.log('click2')}
                        align={'middle'}
                        interactiveCursorClass="react-financial-charts-grabbing-cursor"
                    />
                    {order.orderCode === modifiedOrder?.orderCode && (
                        <>
                            <InteractiveText
                                bgFillStyle="#2e2e47"
                                bgStrokeWidth={1}
                                selected={true}
                                bgStroke="#5f5f70"
                                fontFamily="Arial"
                                position={[null, modifiedOrder.price]}
                                positionScaled={[200, null]}
                                fontSize={10}
                                fontWeight="normal"
                                fontStyle="normal"
                                text={'✓'}
                                textFill="white"
                                width={20}
                                onDragStart={() => {}}
                                onDrag={() => {}}
                                onDragComplete={() => {}}
                                onHover={() => {}}
                                onClick={applyOrderModification}
                                interactiveCursorClass="react-financial-charts-default-cursor"
                                align={'middle'}
                            />
                            <InteractiveText
                                bgFillStyle="#2e2e47"
                                bgStrokeWidth={1}
                                selected={true}
                                bgStroke="#5f5f70"
                                fontFamily="Arial"
                                position={[null, modifiedOrder.price]}
                                positionScaled={[235, null]}
                                fontSize={10}
                                fontWeight="normal"
                                fontStyle="normal"
                                text={'✕'}
                                textFill="white"
                                width={20}
                                onDragStart={() => {}}
                                onDrag={() => {}}
                                onDragComplete={() => {}}
                                onHover={() => {}}
                                onClick={cancelModification}
                                interactiveCursorClass="react-financial-charts-default-cursor"
                                align={'middle'}
                            />
                        </>
                    )}
              </g>
            )}
            )}
        </g>
    )
}

export default ProtectionOrderLevels;