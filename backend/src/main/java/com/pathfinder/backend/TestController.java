package com.pathfinder.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test")
    public ApiResponse<Map<String, String>> test() {
        Map<String, String> data = Map.of(
            "service", "PathFinder Backend",
            "status", "OK",
            "endpoint", "/api/test"
        );

        return ApiResponse.success("Backend funcionando correctamente", data);
    }
}