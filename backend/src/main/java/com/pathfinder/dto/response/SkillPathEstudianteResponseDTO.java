package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillPathEstudianteResponseDTO {

    private String id;

    private String areaId;
    private String areaName;

    private String subareaId;
    private String subareaName;

    private String title;
    private String platform;
    private String description;

    private String difficulty;
    private String durationLabel;
    private Integer xp;

    private Integer progressPercentage;
    private String status;

    private List<SkillPathSkillDTO> skills;

    private String externalUrl;
    private Boolean isRecommended;

    private SkillPathEvidenceDTO evidence;
    private SkillPathRewardDTO reward;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillPathSkillDTO {
        private String id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillPathEvidenceDTO {
        private String id;
        private String fileName;
        private String fileUrl;
        private String validationMethod;
        private String verificationUrl;
        private String verificationCode;
        private String issuingPlatform;
        private String status;
        private String uploadedAt;
        private String reviewedAt;
        private String reviewerComment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillPathRewardDTO {
        private Integer xpAwarded;
        private String badgeName;
        private String badgeDescription;
        private String awardedAt;
    }
}