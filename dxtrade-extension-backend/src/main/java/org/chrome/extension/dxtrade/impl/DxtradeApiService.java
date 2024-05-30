package org.chrome.extension.dxtrade.impl;

import lombok.RequiredArgsConstructor;
import org.chrome.extension.domain.Broker;
import org.chrome.extension.dxtrade.dto.request.DxtradeBatchOrderRequest;
import org.chrome.extension.dxtrade.dto.request.DxtradePlaceOrderRequest;
import org.chrome.extension.dxtrade.dto.response.DxtradeOrdersHistoryResponse;
import org.chrome.extension.dxtrade.dto.response.DxtradePlaceOrderResponse;
import org.chrome.extension.dxtrade.interfaces.DxtradeOrderApi;
import org.chrome.extension.dxtrade.interfaces.DxtradeOrderApiRetrofit;
import org.chrome.extension.dxtrade.dto.response.PlaceOrdersGroupResponse;

import java.io.IOException;
import java.util.Map;

@RequiredArgsConstructor
public class DxtradeApiService extends DxtradeApiRetrofitImpl<DxtradeOrderApiRetrofit> implements DxtradeOrderApi {
//    public DxtradeApiService(Map<Broker, String> baseUrls) {
//        this.baseUrls = baseUrls;
//    }

    @Override
    public DxtradePlaceOrderResponse placeOrder(String broker, String apiKey, String accountCode, DxtradePlaceOrderRequest request) throws IOException {
        return executeSync(getAPIImpl(broker).placeOrder(String.format("%s %s", AUTHORIZATION_PREFIX, apiKey), accountCode, request));
    }

    @Override
    public DxtradePlaceOrderResponse modifyOrder(String broker, String apiKey, String accountCode, DxtradePlaceOrderRequest request) throws IOException {
        return executeSync(getAPIImpl(broker).modifyOrder(String.format("%s %s", AUTHORIZATION_PREFIX, apiKey), accountCode, request));
    }

    @Override
    public PlaceOrdersGroupResponse placeOrdersGroup(String broker, String apiKey, String accountCode, DxtradeBatchOrderRequest request) throws IOException {
        return executeSync(getAPIImpl(broker).placeOrdersGroup(String.format("%s %s", AUTHORIZATION_PREFIX, apiKey), accountCode, request));
    }

    @Override
    public DxtradeOrdersHistoryResponse getOrderHistory(String broker, String apiKey, String accountCode) throws IOException {
        return executeSync(getAPIImpl(broker).getOrderHistory(String.format("%s %s", AUTHORIZATION_PREFIX, apiKey), accountCode));
    }
}
