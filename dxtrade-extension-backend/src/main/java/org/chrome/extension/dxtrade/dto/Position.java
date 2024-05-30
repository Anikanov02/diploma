package org.chrome.extension.dxtrade.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chrome.extension.domain.OrderSide;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Position {
    private String account;
    private Long version;
    private String positionCode;
    private String symbol;
    private BigDecimal quantity;
    private BigDecimal quantityNotional;
    private OrderSide side;
    private String openTime;
    private BigDecimal openPrice;
    private String lastUpdateTime;
}
