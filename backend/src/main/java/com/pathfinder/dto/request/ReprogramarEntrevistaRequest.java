package com.pathfinder.dto.request;

import lombok.Data;

@Data
public class ReprogramarEntrevistaRequest {
    private String nuevaFecha; // "YYYY-MM-DD"
    private String nuevaHora; // "HH:MM"
}
