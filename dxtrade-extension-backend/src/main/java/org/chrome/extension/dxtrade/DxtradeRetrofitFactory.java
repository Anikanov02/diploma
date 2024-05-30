package org.chrome.extension.dxtrade;

import retrofit2.Converter;
import retrofit2.Retrofit;
import retrofit2.converter.jackson.JacksonConverterFactory;

public class DxtradeRetrofitFactory {
    private static final Converter.Factory CONVERTER_FACTORY = JacksonConverterFactory.create(DxtradeObjectMapper.INSTANCE);

    public static Retrofit getPublicRetorfit(String baseUrl) {
        return new Retrofit.Builder()
                .baseUrl(baseUrl)
                .addConverterFactory(CONVERTER_FACTORY)
                .client(DxtradeHttpClientFactory.getPublicClient())
                .build();
    }
}
