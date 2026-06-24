package com.pathfinder.controller;

import com.pathfinder.dto.admin.disc.PreguntaDISCRequestDTO;
import com.pathfinder.dto.admin.disc.PreguntaDISCResponseDTO;
import com.pathfinder.model.enums.CategoriaDISC;
import com.pathfinder.service.AdminDISCQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/disc/questions")
public class AdminDISCQuestionController {

    private final AdminDISCQuestionService adminDISCQuestionService;

    @GetMapping
    public List<PreguntaDISCResponseDTO> listarPreguntas(
            @RequestParam(required = false) CategoriaDISC categoriaDisc,
            @RequestParam(defaultValue = "true") boolean incluirInactivas
    ) {
        return adminDISCQuestionService.listarPreguntas(categoriaDisc, incluirInactivas);
    }

    @GetMapping("/{idPreguntaDisc}")
    public PreguntaDISCResponseDTO obtenerPregunta(@PathVariable Integer idPreguntaDisc) {
        return adminDISCQuestionService.obtenerPregunta(idPreguntaDisc);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PreguntaDISCResponseDTO crearPregunta(@RequestBody PreguntaDISCRequestDTO request) {
        return adminDISCQuestionService.crearPregunta(request);
    }

    @PutMapping("/{idPreguntaDisc}")
    public PreguntaDISCResponseDTO actualizarPregunta(
            @PathVariable Integer idPreguntaDisc,
            @RequestBody PreguntaDISCRequestDTO request
    ) {
        return adminDISCQuestionService.actualizarPregunta(idPreguntaDisc, request);
    }

    @DeleteMapping("/{idPreguntaDisc}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarPregunta(@PathVariable Integer idPreguntaDisc) {
        adminDISCQuestionService.eliminarPregunta(idPreguntaDisc);
    }

    @DeleteMapping("/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetQuestionsAndHistory() {
        adminDISCQuestionService.resetQuestionsAndHistory();
    }

    @GetMapping("/types")
    public List<com.pathfinder.model.entity.TipoPreguntaDISC> listarTiposPregunta() {
        return adminDISCQuestionService.listarTiposPregunta();
    }
}