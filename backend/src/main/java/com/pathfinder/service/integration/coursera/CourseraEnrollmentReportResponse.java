package com.pathfinder.service.integration.coursera;

import java.util.List;

public record CourseraEnrollmentReportResponse(
        String source,
        String requestedEndpoint,
        boolean successful,
        boolean requiresManualReview,
        String message,
        List<CourseraEnrollmentReportItem> elements
) {
}