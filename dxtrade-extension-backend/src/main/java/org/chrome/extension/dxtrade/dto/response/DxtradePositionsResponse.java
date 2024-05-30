package org.chrome.extension.dxtrade.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.chrome.extension.dxtrade.dto.Position;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DxtradePositionsResponse {
    private List<Position> positions;
}
