package org.chrome.extension;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ExtensionBackendApp {
    public static void main(String[] args) {
        SpringApplication.run(ExtensionBackendApp.class, args);
    }
}