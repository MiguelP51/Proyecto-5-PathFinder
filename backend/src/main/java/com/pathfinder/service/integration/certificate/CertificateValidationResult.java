package com.pathfinder.service.integration.certificate;

import com.pathfinder.model.enums.CertificateValidationStatus;

import java.time.LocalDate;

public record CertificateValidationResult(
        String provider,
        String source,
        CertificateValidationStatus status,
        boolean valid,
        boolean requiresManualReview,
        String certificateId,
        String courseTitle,
        String studentEmail,
        LocalDate completedAt,
        String message
) {
    public static CertificateValidationResult valid(
            String certificateId,
            String courseTitle,
            String studentEmail,
            LocalDate completedAt
    ) {
        return new CertificateValidationResult(
                "COURSERA",
                "MOCK_COURSERA_API",
                CertificateValidationStatus.VALID,
                true,
                false,
                certificateId,
                courseTitle,
                studentEmail,
                completedAt,
                "Certificado validado automáticamente mediante integración mockeada con Coursera."
        );
    }

    public static CertificateValidationResult invalid(
            String certificateId,
            String message
    ) {
        return new CertificateValidationResult(
                "COURSERA",
                "MOCK_COURSERA_API",
                CertificateValidationStatus.INVALID,
                false,
                false,
                certificateId,
                null,
                null,
                null,
                message
        );
    }

    public static CertificateValidationResult manualReview(
            String certificateId,
            String message
    ) {
        return new CertificateValidationResult(
                "COURSERA",
                "MOCK_COURSERA_API",
                CertificateValidationStatus.MANUAL_REVIEW,
                false,
                true,
                certificateId,
                null,
                null,
                null,
                message
        );
    }
}