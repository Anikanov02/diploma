package org.chrome.extension.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class PositionPartialTakeProfitRequest extends PositionsRequest {
    private List<TakeProfit> takeProfits;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TakeProfit {
        private String positionId;
        private BigDecimal amount;
    }
}
