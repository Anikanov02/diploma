package org.chrome.extension.dxtrade.interfaces;

import org.chrome.extension.domain.Broker;
import org.chrome.extension.dxtrade.dto.response.DxtradePositionsResponse;

import java.io.IOException;

public interface DxtradeUsersApi {
    DxtradePositionsResponse getPositions(String broker, String apiKey, String accountCode) throws IOException;
}
