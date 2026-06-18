package com.pathfinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEventDTO {
    private String googleEventId;
    private String summary;
    private String day;
    private String startTime;
    private String endTime;
    private boolean allDay;
}
