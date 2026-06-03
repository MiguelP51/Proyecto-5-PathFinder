package com.pathfinder.dto.admin.area;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AreaRequestDTO {

    private String nombreArea;
    private String descripcionGeneral;
    private String imagenUrl;
    private String iconoUrl;
}