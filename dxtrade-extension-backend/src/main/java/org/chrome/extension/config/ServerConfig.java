package org.chrome.extension.config;

import org.chrome.extension.dxtrade.impl.DxtradeApiService;
import org.chrome.extension.dxtrade.impl.DxtradeUsersApiService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class ServerConfig {
    @Bean
    public DxtradeApiService orderApi(AppProperties properties) {
//        return new DxtradeApiService(properties.getBaseUrls());
        return new DxtradeApiService();
    }

    @Bean
    public DxtradeUsersApiService usersApi(AppProperties properties) {
//        return new DxtradeUsersApiService(properties.getBaseUrls());
        return new DxtradeUsersApiService();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
