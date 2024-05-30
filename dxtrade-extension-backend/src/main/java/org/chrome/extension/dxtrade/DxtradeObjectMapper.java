package org.chrome.extension.dxtrade;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;

public class DxtradeObjectMapper {

    public static final ObjectMapper INSTANCE;

    static {
        INSTANCE = new ObjectMapper();
        INSTANCE.configure(FAIL_ON_UNKNOWN_PROPERTIES, false);
        INSTANCE.setSerializationInclusion(JsonInclude.Include.NON_NULL);
    }

}

