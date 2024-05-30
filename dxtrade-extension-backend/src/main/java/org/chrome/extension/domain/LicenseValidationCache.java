package org.chrome.extension.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LicenseValidationCache {
    private LocalDateTime cacheDate;
    private Boolean isValid;
}
