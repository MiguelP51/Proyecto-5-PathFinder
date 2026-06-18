package com.pathfinder.service.impl;

import com.pathfinder.dto.response.CalendarEventDTO;
import com.pathfinder.service.GoogleCalendarService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class GoogleCalendarServiceTest {

    @Autowired
    private GoogleCalendarService googleCalendarService;

    @Test
    void syncEvents_lanzaErrorConTokenNulo() {
        assertThatThrownBy(() -> googleCalendarService.syncEvents(null, "2026-06-22", "2026-06-28"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Access token is required");
    }

    @Test
    void syncEvents_lanzaErrorConTokenVacio() {
        assertThatThrownBy(() -> googleCalendarService.syncEvents("", "2026-06-22", "2026-06-28"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Access token is required");
    }

}
