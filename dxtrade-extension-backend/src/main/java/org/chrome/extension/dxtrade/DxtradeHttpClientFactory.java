package org.chrome.extension.dxtrade;

import java.util.concurrent.TimeUnit;
import okhttp3.*;


public class DxtradeHttpClientFactory {

    public static OkHttpClient getPublicClient() {
        return buildHttpClient(null);
    }

    private static OkHttpClient buildHttpClient(Interceptor interceptor) {
        Dispatcher dispatcher = new Dispatcher();
        dispatcher.setMaxRequestsPerHost(100);
        dispatcher.setMaxRequests(100);
        OkHttpClient.Builder builder = new OkHttpClient.Builder()
                .dispatcher(dispatcher)
                .readTimeout(30, TimeUnit.SECONDS)
                .connectTimeout(30, TimeUnit.SECONDS)
                .pingInterval(30, TimeUnit.SECONDS);
        if (interceptor != null) {
            builder.addInterceptor(interceptor);
        }
        return builder.build();
    }
}

