package com.pathfinder.dto.student.pathchallenge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PathChallengeEstudianteResponseDTO {

    private String id;
    private Integer idPathChallenge;

    private String areaId;
    private String areaName;

    private String subareaId;
    private String subareaName;

    private String title;
    private String description;

    private String difficulty;
    private String durationLabel;
    private Integer xp;

    private Integer progressPercentage;
    private String status;

    private Integer completedTasksCount;
    private Integer totalTasksCount;

    private List<PathChallengeSkillDTO> skills;
    private List<PathChallengeTaskEstudianteDTO> tasks;

    private PathChallengeSubmissionDTO submission;
    private PathChallengeRewardDTO reward;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PathChallengeSkillDTO {
        private String id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PathChallengeTaskEstudianteDTO {
        private Integer idPathChallengeTask;
        private String title;
        private String description;
        private String taskType;
        private String content;
        private List<String> options;
        private Integer order;
        private Boolean required;
        private Boolean completed;

        private String responseText;
        private String selectedOption;
        private String fileName;
        private String fileUrl;
        private String configJson;
        private String responseJson;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PathChallengeSubmissionDTO {
        private String text;
        private String fileName;
        private String fileUrl;
        private String updatedAt;
        private String completedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PathChallengeRewardDTO {
        private Integer xpAwarded;
        private String badgeName;
        private String badgeDescription;
        private String awardedAt;
    }
}