package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "satisfaction_answer")
public class SatisfactionAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_answer")
    private Integer idAnswer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private SatisfactionSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private SatisfactionQuestion question;

    @Column(name = "rating_value")
    private Integer ratingValue;

    @Column(name = "text_value", columnDefinition = "TEXT")
    private String textValue;
}
