package org.chrome.extension.dxtrade.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chrome.extension.domain.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Order {
    private String account;
    private Long version;
    private Long orderId;
    private String orderCode;
    private String clientOrderId;
    private String actionCode;
    private Long legCount;
    private OrderType type;
    private String instrument;
    private OrderStatus status;
    private boolean finalStatus;
    private List<Leg> legs;
    private OrderSide side;
    private TimeInForce tif;
    private String issueTime;
    private String transactionTime;
    private List<Link> links;
    private List<Execution> executions;
    private List<Object> cashTransactions;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Leg {
        private String instrument;
        private PositionEffect positionEffect;
        private String positionCode;
        private BigDecimal price;
        private BigDecimal legRatio;
        private BigDecimal filledQuantity;
        private BigDecimal averagePrice;

    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Link {
        private String linkType;
        private String linkedOrder;
        private String linkedClientOrderId;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Execution {
        private String account;
        private String executionCode;
        private String orderCode;
        private Long updateOrderId;
        private Long version;
        private String clientOrderId;
        private String actionCode;
        private String status;
        private Boolean finalStatus;
        private BigDecimal filledQuantity;
        private BigDecimal lastQuantity;
        private BigDecimal filledQuantityNotional;
        private BigDecimal lastQuantityNotional;
        private String transactionTime;
    }
}
