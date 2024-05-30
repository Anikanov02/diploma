package org.chrome.extension.service;

import lombok.RequiredArgsConstructor;
import org.chrome.extension.domain.*;
import org.chrome.extension.dto.request.ModifyOrderRequest;
import org.chrome.extension.dto.request.PlaceOrderRequest;
import org.chrome.extension.dxtrade.dto.response.DxtradePlaceOrderResponse;
import org.chrome.extension.dxtrade.dto.response.PlaceOrdersGroupResponse;
import org.chrome.extension.dxtrade.impl.DxtradeApiService;
import org.chrome.extension.dxtrade.dto.request.DxtradeBatchOrderRequest;
import org.chrome.extension.dxtrade.dto.request.DxtradePlaceOrderRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final DxtradeApiService dxtradeApi;

    public PlaceOrdersGroupResponse placeOrder(PlaceOrderRequest request) throws IOException {
        final OrderSide openSide = request.getPositionSide() == PositionSide.LONG ? OrderSide.BUY : OrderSide.SELL;
        final OrderSide closeSide = request.getPositionSide() == PositionSide.LONG ? OrderSide.SELL : OrderSide.BUY;
//        dxtradeResponse = dxtradeApi.placeOrder(request.getApiKey(), request.getAccountCode(), dxtradeRequest);
        for (PlaceOrderRequest.StopOrder tp : request.getTakeProfits()) {
            final List<DxtradePlaceOrderRequest> orders = new ArrayList<>();
            final DxtradePlaceOrderRequest openRequest = DxtradePlaceOrderRequest.builder()
                    .orderCode(tp.getOrderId() + "_open")
                    .type(request.getOrderType())
                    .instrument(request.getInstrument())
                    .quantity(tp.getQuantity())
                    .positionEffect(PositionEffect.OPEN)
                    .side(openSide)
                    .tif(TimeInForce.GTC)
                    .build();
            if (request.getOrderType() == OrderType.LIMIT) {
                openRequest.setLimitPrice(request.getLimitPrice());
            }
            orders.add(openRequest);
            final DxtradePlaceOrderRequest order = DxtradePlaceOrderRequest.builder()
                    .orderCode(tp.getOrderId())
                    .type(OrderType.LIMIT)
                    .instrument(request.getInstrument())
                    .limitPrice(tp.getPrice())
                    .positionEffect(PositionEffect.CLOSE)
//                    .positionCode(dxtradeResponse.getUpdateOrderId())
                    .side(closeSide)
                    .tif(TimeInForce.GTC)
                    .build();
            orders.add(order);
//            final DxtradePlaceOrderResponse resp = dxtradeApi.placeOrder(request.getApiKey(), request.getAccountCode(), order);

            for (PlaceOrderRequest.StopOrder sl : request.getStopLosses()) {
                final DxtradePlaceOrderRequest slOrder = DxtradePlaceOrderRequest.builder()
                        .orderCode(tp.getOrderId() + "_stop")
                        .type(OrderType.STOP)
                        .instrument(request.getInstrument())
                        .stopPrice(sl.getPrice())
                        .positionEffect(PositionEffect.CLOSE)
//                    .positionCode(dxtradeResponse.getUpdateOrderId())
                        .side(closeSide)
                        .tif(TimeInForce.GTC)
                        .build();
                orders.add(slOrder);
//            final DxtradePlaceOrderResponse resp = dxtradeApi.placeOrder(request.getApiKey(), request.getAccountCode(), order);
            }

            final DxtradeBatchOrderRequest ordersBatch = DxtradeBatchOrderRequest.builder()
                    .orders(orders)
                    .contingencyType(ContingencyType.IF_THEN)
                    .build();

            final PlaceOrdersGroupResponse response = dxtradeApi.placeOrdersGroup(request.getBroker(), request.getApiKey(), request.getAccountCode(), ordersBatch);
        }
        return null;
    }


    public DxtradePlaceOrderResponse modifyOrder(ModifyOrderRequest request) throws IOException {
        final DxtradePlaceOrderRequest openRequest = DxtradePlaceOrderRequest.builder()
            .orderCode(request.getOrderCode())
//            .type(request.getOrderType())
            .instrument(request.getInstrument())
//            .quantity(request.getQuantity())
            .positionEffect(PositionEffect.CLOSE)
            .positionCode(request.getPositionCode())
            .side(request.getOrderSide())
            .tif(TimeInForce.GTC)
            .build();

        if (request.getOrderType() == OrderType.STOP) {
            openRequest.setStopPrice(request.getLimitPrice());
        } else if (request.getOrderType() == OrderType.LIMIT) {
            openRequest.setLimitPrice(request.getLimitPrice());
        }

        final DxtradePlaceOrderResponse response = dxtradeApi.modifyOrder(request.getBroker(), request.getApiKey(), request.getAccountCode(), openRequest);
        return null;
    }
}
