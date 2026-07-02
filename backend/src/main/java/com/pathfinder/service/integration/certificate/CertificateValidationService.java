package com.pathfinder.service.integration.certificate;

import com.pathfinder.service.integration.coursera.CourseraApiClient;
import com.pathfinder.service.integration.coursera.CourseraEnrollmentReportItem;
import com.pathfinder.service.integration.coursera.CourseraEnrollmentReportResponse;
import com.pathfinder.service.integration.coursera.CourseraTokenResponse;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Locale;

@Service
public class CertificateValidationService {

    private static final String MOCK_ORGANIZATION_ID = "pathfinder-demo-org";

    private final CourseraApiClient courseraApiClient;

    public CertificateValidationService(CourseraApiClient courseraApiClient) {
        this.courseraApiClient = courseraApiClient;
    }

    public CertificateValidationResult validateCourseraCertificate(
            String certificateUrl,
            String expectedStudentEmail,
            String expectedCourseTitle
    ) {
        String certificateId = extractCertificateId(certificateUrl);

        if (!StringUtils.hasText(certificateId)) {
            return CertificateValidationResult.manualReview(
                    null,
                    "No se pudo identificar el código del certificado en el enlace proporcionado."
            );
        }

        CourseraTokenResponse tokenResponse =
                courseraApiClient.requestClientCredentialsToken();

        if (tokenResponse == null || !StringUtils.hasText(tokenResponse.accessToken())) {
            return CertificateValidationResult.manualReview(
                    certificateId,
                    "No se pudo obtener un token OAuth mockeado de Coursera."
            );
        }

        CourseraEnrollmentReportResponse reportResponse =
                courseraApiClient.getEnrollmentReports(
                        tokenResponse.accessToken(),
                        MOCK_ORGANIZATION_ID,
                        certificateId,
                        expectedStudentEmail,
                        expectedCourseTitle
                );

        if (reportResponse == null) {
            return CertificateValidationResult.manualReview(
                    certificateId,
                    "No se recibió respuesta desde el cliente mockeado de Coursera."
            );
        }

        if (reportResponse.requiresManualReview() || !reportResponse.successful()) {
            return CertificateValidationResult.manualReview(
                    certificateId,
                    reportResponse.message()
            );
        }

        if (reportResponse.elements() == null || reportResponse.elements().isEmpty()) {
            return CertificateValidationResult.invalid(
                    certificateId,
                    "El certificado no fue encontrado en el reporte mockeado de Coursera."
            );
        }

        CourseraEnrollmentReportItem matchedItem = reportResponse.elements()
                .stream()
                .filter(item -> certificateId.equalsIgnoreCase(item.certificateId()))
                .findFirst()
                .orElse(null);

        if (matchedItem == null) {
            return CertificateValidationResult.invalid(
                    certificateId,
                    "El reporte mockeado no contiene un registro asociado al código del certificado."
            );
        }

        if (!sameText(expectedStudentEmail, matchedItem.learnerEmail())) {
            return CertificateValidationResult.invalid(
                    certificateId,
                    "El certificado encontrado no corresponde al correo del estudiante."
            );
        }

        if (!sameText(expectedCourseTitle, matchedItem.courseTitle())) {
            return CertificateValidationResult.invalid(
                    certificateId,
                    "El certificado existe, pero no corresponde al curso asociado al SkillPath."
            );
        }

        if (!matchedItem.completed()) {
            return CertificateValidationResult.manualReview(
                    certificateId,
                    "El curso aparece en el reporte mockeado, pero todavía no figura como completado."
            );
        }

        return CertificateValidationResult.valid(
                certificateId,
                matchedItem.courseTitle(),
                matchedItem.learnerEmail(),
                matchedItem.completedAt()
        );
    }

    private String extractCertificateId(String certificateUrl) {
        if (!StringUtils.hasText(certificateUrl)) {
            return null;
        }

        String cleanUrl = certificateUrl.trim();

        int queryIndex = cleanUrl.indexOf("?");
        if (queryIndex >= 0) {
            cleanUrl = cleanUrl.substring(0, queryIndex);
        }

        int hashIndex = cleanUrl.indexOf("#");
        if (hashIndex >= 0) {
            cleanUrl = cleanUrl.substring(0, hashIndex);
        }

        if (cleanUrl.endsWith("/")) {
            cleanUrl = cleanUrl.substring(0, cleanUrl.length() - 1);
        }

        int lastSlash = cleanUrl.lastIndexOf("/");
        if (lastSlash < 0 || lastSlash == cleanUrl.length() - 1) {
            return cleanUrl;
        }

        return cleanUrl.substring(lastSlash + 1);
    }

    private boolean sameText(String expected, String actual) {
        return normalize(expected).equals(normalize(actual));
    }

    private String normalize(String value) {
        return value == null
                ? ""
                : value.trim().toLowerCase(Locale.ROOT);
    }
}