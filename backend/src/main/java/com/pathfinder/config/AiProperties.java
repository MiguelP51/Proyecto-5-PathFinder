package com.pathfinder.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "ai.gemini")
public class AiProperties {
    private boolean enabled = false;
    private String apiKey = "";
    private String model = "gemini-3.5-flash";
    private int timeoutMs = 90000;
    private int maxOutputTokens = 1200;
}
