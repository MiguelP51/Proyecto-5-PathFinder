package com.pathfinder.service.integration.coursera;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Component
public class MockCourseraApiClient implements CourseraApiClient {

    private static final String TOKEN_ENDPOINT =
            "https://api.coursera.com/oauth2/client_credentials/token";

    private static final String ENROLLMENT_REPORTS_ENDPOINT_TEMPLATE =
            "https://api.coursera.com/api/businesses.v1/{orgId}/enrollmentReports";

    @Override
    public CourseraTokenResponse requestClientCredentialsToken() {
        return new CourseraTokenResponse(
                "mock_coursera_access_token_pathfinder",
                "Bearer",
                3600L,
                TOKEN_ENDPOINT,
                "MOCK_COURSERA_API"
        );
    }

    @Override
    public CourseraEnrollmentReportResponse getEnrollmentReports(
            String accessToken,
            String organizationId,
            String certificateId,
            String learnerEmail,
            String expectedCourseTitle
    ) {
        String endpoint = ENROLLMENT_REPORTS_ENDPOINT_TEMPLATE
                .replace("{orgId}", organizationId);

        String normalizedCertificateId = certificateId == null
                ? ""
                : certificateId.trim().toUpperCase(Locale.ROOT);

        return switch (normalizedCertificateId) {
            case "PF-VALID-001" -> new CourseraEnrollmentReportResponse(
                    "MOCK_COURSERA_API",
                    endpoint,
                    true,
                    false,
                    "Reporte de inscripción obtenido correctamente desde Coursera mock.",
                    List.of(
                            new CourseraEnrollmentReportItem(
                                    certificateId,
                                    learnerEmail,
                                    expectedCourseTitle,
                                    true,
                                    LocalDate.now()
                            )
                    )
            );

            case "PF-INVALID-001" -> new CourseraEnrollmentReportResponse(
                    "MOCK_COURSERA_API",
                    endpoint,
                    true,
                    false,
                    "La API mockeada respondió correctamente, pero no encontró el certificado.",
                    List.of()
            );

            case "PF-COURSE-MISMATCH" -> new CourseraEnrollmentReportResponse(
                    "MOCK_COURSERA_API",
                    endpoint,
                    true,
                    false,
                    "La API mockeada encontró el certificado, pero pertenece a otro curso.",
                    List.of(
                            new CourseraEnrollmentReportItem(
                                    certificateId,
                                    learnerEmail,
                                    "Curso mockeado diferente al SkillPath",
                                    true,
                                    LocalDate.now()
                            )
                    )
            );

            case "PF-REVIEW-001" -> new CourseraEnrollmentReportResponse(
                    "MOCK_COURSERA_API",
                    endpoint,
                    false,
                    true,
                    "La API mockeada no pudo confirmar la validez del certificado.",
                    List.of()
            );

            default -> new CourseraEnrollmentReportResponse(
                    "MOCK_COURSERA_API",
                    endpoint,
                    false,
                    true,
                    "El certificado tiene formato de Coursera, pero no corresponde a un código mockeado para la demo.",
                    List.of()
            );
        };
    }
}