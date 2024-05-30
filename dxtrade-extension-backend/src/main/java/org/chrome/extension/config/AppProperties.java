package org.chrome.extension.config;

import lombok.Data;
import org.chrome.extension.domain.Broker;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "extension")
public class AppProperties {
    private Map<Broker, String> baseUrls;
}
