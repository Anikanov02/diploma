package org.chrome.extension.dxtrade.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chrome.extension.domain.ContingencyType;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DxtradeBatchOrderRequest {
    private List<DxtradePlaceOrderRequest> orders;
    private ContingencyType contingencyType;
}
