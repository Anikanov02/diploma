package org.chrome.extension.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chrome.extension.domain.Broker;
import org.chrome.extension.domain.OrderSide;
import org.chrome.extension.domain.OrderType;
import org.chrome.extension.domain.PositionSide;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModifyOrderRequest {
    private String broker;
    private String apiKey;
    private String accountCode;
    private String orderCode;
    private BigDecimal quantity;
    private String instrument;
    private OrderType orderType;
    private BigDecimal limitPrice;
    private OrderSide orderSide;
    private String positionCode;
}
