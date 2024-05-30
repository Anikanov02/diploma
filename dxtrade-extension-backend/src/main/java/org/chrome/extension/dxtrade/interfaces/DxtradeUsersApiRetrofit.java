package org.chrome.extension.dxtrade.interfaces;

import org.chrome.extension.dxtrade.dto.response.DxtradePositionsResponse;
import retrofit2.Call;
import retrofit2.http.*;

public interface DxtradeUsersApiRetrofit {
    @GET("accounts/{accountCode}/positions")
    @Headers({
            "Content-Type: application/json",
    })
    Call<DxtradePositionsResponse> getPositions(
            @Header("Authorization") String authorization,
            @Path(value = "accountCode") String accountCode);
}
