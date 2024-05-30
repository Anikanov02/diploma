package org.chrome.extension.dxtrade.interfaces;

import org.chrome.extension.domain.Broker;
import org.chrome.extension.dxtrade.dto.request.DxtradeBatchOrderRequest;
import org.chrome.extension.dxtrade.dto.request.DxtradePlaceOrderRequest;
import org.chrome.extension.dxtrade.dto.response.DxtradeOrdersHistoryResponse;
import org.chrome.extension.dxtrade.dto.response.DxtradePlaceOrderResponse;
import org.chrome.extension.dxtrade.dto.response.PlaceOrdersGroupResponse;

import java.io.IOException;

public interface DxtradeOrderApi {
    DxtradePlaceOrderResponse placeOrder(String broker, String apiKey, String accountCode, DxtradePlaceOrderRequest request) throws IOException;

    DxtradePlaceOrderResponse modifyOrder(String broker, String apiKey, String accountCode, DxtradePlaceOrderRequest request) throws IOException;

    PlaceOrdersGroupResponse placeOrdersGroup(String broker, String apiKey, String accountCode, DxtradeBatchOrderRequest request) throws IOException;

    DxtradeOrdersHistoryResponse getOrderHistory(String broker, String apiKey, String accountCode) throws IOException;
}
