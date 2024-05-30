package org.chrome.extension.dxtrade.impl;

import org.chrome.extension.domain.Broker;
import org.chrome.extension.dxtrade.DxtradeObjectMapper;
import org.chrome.extension.dxtrade.DxtradeRetrofitFactory;
import retrofit2.Call;
import retrofit2.Converter;
import retrofit2.Response;
import retrofit2.converter.jackson.JacksonConverterFactory;

import java.io.IOException;
import java.lang.reflect.ParameterizedType;
import java.util.Map;
import java.util.Objects;

public class DxtradeApiRetrofitImpl<T> {
    private static final Converter.Factory jacksonConverterFactory = JacksonConverterFactory.create(DxtradeObjectMapper.INSTANCE);
    protected static final String AUTHORIZATION_PREFIX = "DXAPI";
//    protected Map<Broker, String> baseUrls;

    private T apiImpl;

    public T getAPIImpl(String broker) {
//        if (Objects.nonNull(apiImpl))
//            return apiImpl;
//        synchronized (getClass()) {
//            if (Objects.nonNull(apiImpl))
//                return apiImpl;
//            @SuppressWarnings("unchecked")
//            Class<T> tClass = (Class<T>) ((ParameterizedType) this.getClass().getGenericSuperclass())
//                    .getActualTypeArguments()[0];
//            T t = DxtradeRetrofitFactory.getPublicRetorfit(constructBaseUrl(broker)).create(tClass);
//            apiImpl = t;
//            return t;
//        }
        @SuppressWarnings("unchecked")
        Class<T> tClass = (Class<T>) ((ParameterizedType) this.getClass().getGenericSuperclass())
            .getActualTypeArguments()[0];
        return DxtradeRetrofitFactory.getPublicRetorfit(constructBaseUrl(broker)).create(tClass);
    }

    /**
     * Execute a REST call and block until the response is received.
     *
     * @throws IOException On socket related errors.
     */
    public <R> R executeSync(Call<R> call) throws IOException {
        Response<R> response = call.execute();
        final R body = response.body();
        if (response.isSuccessful() && body != null) {
            return body;
        } else {
            throw new RuntimeException(String.format("Dxtrade exception: code [%s]", response.code()));
        }
    }

    private String constructBaseUrl(String broker) {
      return String.format("https://%s/dxsca-web/", broker);
    }

//    public Map<Broker, String> getBaseUrls() {
//        return baseUrls;
//    }

//    public void setBaseUrls(Map<Broker, String> baseUrls) {
//        this.baseUrls = baseUrls;
//    }
}
