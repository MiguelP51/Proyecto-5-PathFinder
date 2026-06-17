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

    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType; // CHALLENGE or SKILLPATH

    @Column(name = "target_id")
    private Integer targetId; // Null means applies to all

    @Column(name = "status", nullable = false, length = 50)
    private String status; // DRAFT, ACTIVE, ARCHIVED
}
