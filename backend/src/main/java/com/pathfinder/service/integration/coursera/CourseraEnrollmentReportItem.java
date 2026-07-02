package com.pathfinder.service.integration.coursera;

import java.time.LocalDate;

public record CourseraEnrollmentReportItem(
        String certificateId,
        String learnerEmail,
        String courseTitle,
        boolean completed,
        LocalDate completedAt
) {
}