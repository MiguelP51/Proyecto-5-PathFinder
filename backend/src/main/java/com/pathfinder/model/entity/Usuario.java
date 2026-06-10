package com.pathfinder.model.entity;

import com.pathfinder.model.enums.RolUsuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "usuario")
public class Usuario extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false, length = 20)
    private RolUsuario rol;

    @Column(name = "google_uid", length = 100)
    private String googleUid;

    @Column(name = "nombre_completo", length = 150)
    private String nombreCompleto;

    @Column(name = "correo", length = 150)
    private String correo;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "nuevo_usuario", nullable = false)
    private Boolean nuevoUsuario = true;
}