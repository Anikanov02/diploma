package org.chrome.extension.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chrome.extension.domain.Broker;
import org.chrome.extension.domain.OrderType;
import org.chrome.extension.domain.PositionSide;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOrderRequest {
    private String broker;
    private String apiKey;
    private String orderId;
    private String accountCode;
    private BigDecimal quantity;
    private String instrument;
    private OrderType orderType;
    private BigDecimal limitPrice;
    private PositionSide positionSide;
    private List<StopOrder> takeProfits;
    private List<StopOrder> stopLosses;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StopOrder {
        private String orderId;
        private BigDecimal quantity;
        private BigDecimal price;
    }
}
