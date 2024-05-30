package org.chrome.extension.dxtrade.impl;

import lombok.RequiredArgsConstructor;
import org.chrome.extension.domain.Broker;
import org.chrome.extension.dxtrade.interfaces.DxtradeUsersApi;
import org.chrome.extension.dxtrade.interfaces.DxtradeUsersApiRetrofit;
import org.chrome.extension.dxtrade.dto.response.DxtradePositionsResponse;

import java.io.IOException;
import java.util.Map;

@RequiredArgsConstructor
public class DxtradeUsersApiService extends DxtradeApiRetrofitImpl<DxtradeUsersApiRetrofit> implements DxtradeUsersApi {
//    public DxtradeUsersApiService(Map<Broker, String> baseUrls) {
//        this.baseUrls = baseUrls;
//    }

    @Override
    public DxtradePositionsResponse getPositions(String broker, String apiKey, String accountCode) throws IOException {
        return executeSync(getAPIImpl(broker).getPositions(String.format("%s %s", AUTHORIZATION_PREFIX, apiKey), accountCode));
    }
}
