package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "satisfaction_submission", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"survey_id", "student_id", "target_id"})
})
public class SatisfactionSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_submission")
    private Integer idSubmission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private SatisfactionSurvey survey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Usuario student;

    @Column(name = "target_id", nullable = false)
    private Integer targetId;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;
    
    @PrePersist
    public void prePersist() {
        if (this.submittedAt == null) {
            this.submittedAt = LocalDateTime.now();
        }
    }
}
