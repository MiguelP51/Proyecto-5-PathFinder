package com.pathfinder.service;

import com.pathfinder.dto.response.CalendarEventDTO;

import java.util.List;

public interface GoogleCalendarService {
    List<CalendarEventDTO> syncEvents(String accessToken, String weekStart, String weekEnd);
}
