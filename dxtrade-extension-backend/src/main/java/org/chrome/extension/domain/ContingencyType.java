package org.chrome.extension.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum ContingencyType {
    OCO("OCO"),
    IF_THEN("IF-THEN");

    private final String code;

    @Override
    @JsonValue
    public String toString() {
        return this.code;
    }

    @JsonCreator
    public static ContingencyType fromString(String value) {
        for (ContingencyType type : ContingencyType.values()) {
            if (type.code.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid ContingencyType: " + value);
    }
}
