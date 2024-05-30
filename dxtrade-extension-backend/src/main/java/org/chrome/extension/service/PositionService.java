package org.chrome.extension.service;

import lombok.RequiredArgsConstructor;
import org.chrome.extension.domain.*;
import org.chrome.extension.dto.request.PositionBreakEvenRequest;
import org.chrome.extension.dto.request.PositionPartialTakeProfitRequest;
import org.chrome.extension.dto.response.PositionsResponse;
import org.chrome.extension.dxtrade.dto.Position;
import org.chrome.extension.dto.request.PositionsRequest;
import org.chrome.extension.dxtrade.dto.request.DxtradePlaceOrderRequest;
import org.chrome.extension.dxtrade.dto.response.DxtradeOrdersHistoryResponse;
import org.chrome.extension.dxtrade.impl.DxtradeApiService;
import org.chrome.extension.dxtrade.impl.DxtradeUsersApiService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.chrome.extension.domain.OrderStatus.*;

@Service
@RequiredArgsConstructor
public class PositionService {
    private final DxtradeUsersApiService usersApi;
    private final DxtradeApiService ordersApi;

    public List<PositionsResponse> getPositions(PositionsRequest request) throws IOException {
        final List<Position> positions = usersApi.getPositions(request.getBroker(), request.getApiKey(), request.getAccountCode()).getPositions();
        final DxtradeOrdersHistoryResponse history = ordersApi.getOrderHistory(request.getBroker(), request.getApiKey(), request.getAccountCode());
        final List<PositionsResponse> responses = positions.stream().map(pos -> {
            final List<PositionsResponse.OrderResponse> legs = history.getOrders().stream()
                    .filter(order -> !List.of(CANCELED, EXPIRED, REJECTED).contains(order.getStatus()))
                    .flatMap(order -> order.getLegs().stream()
                            .map(leg -> PositionsResponse.OrderResponse
                                    .builder()
                                    .leg(leg)
                                    .type(order.getType())
                                    .side(order.getSide())
                                    .orderCode(order.getOrderCode())
                                    .build()))
                    .filter(order -> pos.getPositionCode().equals(order.getLeg().getPositionCode()))
                    .toList();
            return PositionsResponse.builder()
                    .position(pos)
                    .orders(legs)
                    .build();
        }).toList();
        return responses;
    }

    public void breakEven(PositionBreakEvenRequest request) throws IOException {
        final List<PositionsResponse> openedPositions = getPositions(request);
        final List<PositionsResponse> positions = openedPositions.stream()
                .filter(openedPos -> request.getPositions().contains(openedPos.getPosition().getPositionCode()))
                .toList();
        for (PositionsResponse pos : positions) {
            final Optional<PositionsResponse.OrderResponse> orderOpt = pos.getOrders()
                    .stream()
                    .filter(order ->
                            order.getType() == OrderType.STOP).findAny();
            final OrderSide closeSide = pos.getPosition().getSide() == OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;
            final DxtradePlaceOrderRequest stopOrder = DxtradePlaceOrderRequest.builder()
//                    .orderCode(order.getOrderCode())
//                         .type(OrderType.STOP)
                    .instrument(pos.getPosition().getSymbol())
                    .stopPrice(pos.getPosition().getOpenPrice())
                    .positionEffect(PositionEffect.CLOSE)
                    .positionCode(pos.getPosition().getPositionCode())
                    .side(closeSide)
                    .tif(TimeInForce.GTC)
                    .build();
            if (orderOpt.isEmpty()) {
                stopOrder.setOrderCode(UUID.randomUUID().toString());
                stopOrder.setType(OrderType.STOP);
                ordersApi.placeOrder(request.getBroker(), request.getApiKey(), request.getAccountCode(), stopOrder);
            } else {
                final PositionsResponse.OrderResponse order = orderOpt.get();
                stopOrder.setOrderCode(order.getOrderCode());
                ordersApi.modifyOrder(request.getBroker(), request.getApiKey(), request.getAccountCode(), stopOrder);
            }
        }
    }

    public void partialTakeProfit(PositionPartialTakeProfitRequest request) throws IOException {
        final List<PositionsResponse> openedPositions = getPositions(request);
        for (PositionPartialTakeProfitRequest.TakeProfit tp : request.getTakeProfits()) {
            final Optional<PositionsResponse> positions = openedPositions.stream()
                    .filter(openedPos -> openedPos.getPosition().getPositionCode().equals(tp.getPositionId()))
                    .findAny();
            if (positions.isPresent()) {
                final PositionsResponse pos = positions.get();
                final OrderSide closeSide = pos.getPosition().getSide() == OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;
                final DxtradePlaceOrderRequest stopOrder = DxtradePlaceOrderRequest.builder()
                        .orderCode(UUID.randomUUID().toString())
                        .type(OrderType.MARKET)
                        .instrument(pos.getPosition().getSymbol())
                        .positionEffect(PositionEffect.CLOSE)
                        .quantity(tp.getAmount())
                        .positionCode(pos.getPosition().getPositionCode())
                        .side(closeSide)
                        .tif(TimeInForce.GTC)
                        .build();
                ordersApi.placeOrder(request.getBroker(), request.getApiKey(), request.getAccountCode(), stopOrder);
            }
        }
    }
}
