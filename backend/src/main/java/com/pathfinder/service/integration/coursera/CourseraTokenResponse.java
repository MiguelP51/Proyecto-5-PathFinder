package com.pathfinder.service.integration.coursera;

public record CourseraTokenResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String requestedEndpoint,
        String source
) {
}