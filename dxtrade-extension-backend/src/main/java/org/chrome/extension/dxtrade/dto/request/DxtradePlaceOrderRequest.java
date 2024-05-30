package org.chrome.extension.dxtrade.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chrome.extension.domain.OrderSide;
import org.chrome.extension.domain.OrderType;
import org.chrome.extension.domain.PositionEffect;
import org.chrome.extension.domain.TimeInForce;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DxtradePlaceOrderRequest {
    private String orderCode;
    private OrderType type;
    private String instrument;
    private BigDecimal quantity;
    private PositionEffect positionEffect;
    private String positionCode;
    private OrderSide side;
    private BigDecimal limitPrice;
    private BigDecimal stopPrice;
    private BigDecimal priceOffset;
    private String priceLink;
    private TimeInForce tif;
    private LocalDateTime expireDate;
}
