package org.chrome.extension.service;

import org.chrome.extension.domain.LicenseValidationCache;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LicenseValidationService {
    private static final String BASE_URL = "https://riskcalculator.app/bridge/bv2.php";
    private final RestTemplate restTemplate;
    private final ConcurrentHashMap<String, LicenseValidationCache> cache;

    public LicenseValidationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.cache = new ConcurrentHashMap<>();
    }

    public boolean validateLicense(String accountNumber, boolean useCache) {
        final LocalDateTime currentTime = LocalDateTime.now();
        final String[] parts = accountNumber.split(":");
        if (parts.length >= 2) {
            final String number = extractNumber(parts[1]);
            if (number == null) {
                return false;
            }
            if (useCache) {
                LicenseValidationCache cachedRecord = cache.get(number);
                if (cachedRecord != null && cachedRecord.getCacheDate().isAfter(currentTime.minusMinutes(10))) {
                    return cachedRecord.getIsValid();
                }
            }
            final String requestUrl = BASE_URL + "?mode=1&accountNr=" + number + "&software_name=1";
            final String response = restTemplate.getForObject(requestUrl, String.class);
            final boolean isValid = response != null && response.contains("Status ok");
            cache.put(number, new LicenseValidationCache(currentTime, isValid));
            return isValid;
        }
        return false;
    }

    public static String extractNumber(String str) {
        final Pattern pattern = Pattern.compile("\\d+");
        final Matcher matcher = pattern.matcher(str);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }
}
