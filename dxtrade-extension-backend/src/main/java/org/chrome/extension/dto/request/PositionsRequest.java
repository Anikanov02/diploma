package org.chrome.extension.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chrome.extension.domain.Broker;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PositionsRequest {
    private String broker;
    private String apiKey;
    private String accountCode;
}
