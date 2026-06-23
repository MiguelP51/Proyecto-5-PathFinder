package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "satisfaction_survey")
public class SatisfactionSurvey extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_survey")
    private Integer idSurvey;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // DRAFT, ACTIVE, HISTORICAL
}
