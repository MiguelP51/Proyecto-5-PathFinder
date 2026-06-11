package com.pathfinder.model.entity;

import com.pathfinder.model.enums.EstadoConexion;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "proveedor_externo")
public class ProveedorExterno extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proveedor")
    private Integer idProveedor;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_conexion", nullable = false, length = 30)
    private EstadoConexion estadoConexion;

    @Column(name = "ultima_sincronizacion")
    private LocalDateTime ultimaSincronizacion;

    @Column(name = "soporta_api", nullable = false)
    private Boolean soportaApi = false;
    
    @Column(name = "credenciales", columnDefinition = "TEXT")
    private String credenciales;
}
