package com.pathfinder.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PublicStatsDTO {
    private long totalStudents;
    private long totalAreas;
    private long totalSubareas;
}
