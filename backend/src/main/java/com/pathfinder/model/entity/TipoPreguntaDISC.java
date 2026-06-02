package com.pathfinder.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "tipo_pregunta_disc")
public class TipoPreguntaDISC extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_pregunta_disc")
    private Integer idTipoPreguntaDisc;

    @Column(name = "codigo", nullable = false, unique = true, length = 80)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "numero_opciones")
    private Integer numeroOpciones;

    @Column(name = "usa_imagen")
    private Boolean usaImagen = false;

    @Column(name = "usa_ordenamiento")
    private Boolean usaOrdenamiento = false;

    @Column(name = "muestra_porcentaje")
    private Boolean muestraPorcentaje = false;

    @Column(name = "muestra_numeros_orden")
    private Boolean muestraNumerosOrden = false;

    @Column(name = "habilitado")
    private Boolean habilitado = true;
}