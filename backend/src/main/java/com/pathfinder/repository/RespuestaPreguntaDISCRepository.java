package com.pathfinder.repository;

import com.pathfinder.model.entity.RespuestaPreguntaDISC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RespuestaPreguntaDISCRepository extends JpaRepository<RespuestaPreguntaDISC, Integer> {
    List<RespuestaPreguntaDISC> findByUsuario_IdUsuario(Integer idUsuario);
    boolean existsByPreguntaDisc_IdPreguntaDisc(Integer idPreguntaDisc);

    @Modifying
    @Query("DELETE FROM RespuestaPreguntaDISC r WHERE r.preguntaDisc.idPreguntaDisc = :idPreguntaDisc")
    void deleteAllByPreguntaDiscId(@Param("idPreguntaDisc") Integer idPreguntaDisc);
}
