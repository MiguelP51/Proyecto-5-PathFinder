package com.pathfinder.service.integration.coursera;

public interface CourseraApiClient {

    CourseraTokenResponse requestClientCredentialsToken();

    CourseraEnrollmentReportResponse getEnrollmentReports(
            String accessToken,
            String organizationId,
            String certificateId,
            String learnerEmail,
            String expectedCourseTitle
    );
}