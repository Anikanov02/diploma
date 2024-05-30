package org.chrome.extension.dto.response;

import lombok.Builder;
import lombok.Data;
import org.chrome.extension.domain.OrderSide;
import org.chrome.extension.domain.OrderType;
import org.chrome.extension.dxtrade.dto.Order;
import org.chrome.extension.dxtrade.dto.Position;

import java.util.List;

@Data
@Builder
public class PositionsResponse {
    private Position position;
    private List<OrderResponse> orders;

    @Data
    @Builder
    public static class OrderResponse {
        private Order.Leg leg;
        private OrderType type;
        private String orderCode;
        private OrderSide side;
    }
}
