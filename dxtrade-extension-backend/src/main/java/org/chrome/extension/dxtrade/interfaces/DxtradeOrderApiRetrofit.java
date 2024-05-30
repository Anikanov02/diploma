package org.chrome.extension.dxtrade.interfaces;

import org.chrome.extension.dxtrade.dto.request.DxtradeBatchOrderRequest;
import org.chrome.extension.dxtrade.dto.request.DxtradePlaceOrderRequest;
import org.chrome.extension.dxtrade.dto.response.DxtradeOrdersHistoryResponse;
import org.chrome.extension.dxtrade.dto.response.DxtradePlaceOrderResponse;
import org.chrome.extension.dxtrade.dto.response.PlaceOrdersGroupResponse;
import retrofit2.Call;
import retrofit2.http.*;

public interface DxtradeOrderApiRetrofit {
    @POST("accounts/{accountCode}/orders")
    @Headers({
            "Content-Type: application/json",
    })
    Call<DxtradePlaceOrderResponse> placeOrder(
            @Header("Authorization") String authorization,
            @Path(value = "accountCode") String accountCode,
            @Body DxtradePlaceOrderRequest request);

    @PUT("accounts/{accountCode}/orders")
    @Headers({
            "Content-Type: application/json",
    })
    Call<DxtradePlaceOrderResponse> modifyOrder(
            @Header("Authorization") String authorization,
            @Path(value = "accountCode") String accountCode,
            @Body DxtradePlaceOrderRequest request);

    @POST("accounts/{accountCode}/orders")
    @Headers({
            "Content-Type: application/json",
    })
    Call<PlaceOrdersGroupResponse> placeOrdersGroup(
            @Header("Authorization") String authorization,
            @Path(value = "accountCode") String accountCode,
            @Body DxtradeBatchOrderRequest request);

    @GET("accounts/{accountCode}/orders/history")
    @Headers({
            "Content-Type: application/json",
    })
    Call<DxtradeOrdersHistoryResponse> getOrderHistory(
            @Header("Authorization") String authorization,
            @Path(value = "accountCode") String accountCode);
}
