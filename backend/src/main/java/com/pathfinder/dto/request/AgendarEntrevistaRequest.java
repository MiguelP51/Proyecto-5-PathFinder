package com.pathfinder.dto.request;

import lombok.Data;

@Data
public class AgendarEntrevistaRequest {
    private Integer idMentor;
    private String fecha; // "YYYY-MM-DD"
    private String hora; // "HH:MM"
    private String tipo; // "virtual" o "presencial"
    private String puesto;
}
