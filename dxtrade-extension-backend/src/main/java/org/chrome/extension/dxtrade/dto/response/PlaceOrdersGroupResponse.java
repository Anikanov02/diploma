package org.chrome.extension.dxtrade.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOrdersGroupResponse {
    private List<DxtradePlaceOrderResponse> orderResponses;
}
