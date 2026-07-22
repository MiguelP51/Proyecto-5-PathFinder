package com.pathfinder.controller;

import com.pathfinder.dto.admin.pathchallenge.PathChallengeRequestDTO;
import com.pathfinder.dto.admin.pathchallenge.PathChallengeResponseDTO;
import com.pathfinder.dto.admin.pathchallenge.PathChallengeTaskDTO;
import com.pathfinder.service.PathChallengeService;
import com.pathfinder.audit.annotation.Audit;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pathchallenges")
@RequiredArgsConstructor
public class PathChallengeController {

    private final PathChallengeService pathChallengeService;

    @GetMapping
    public ResponseEntity<List<PathChallengeResponseDTO>> getAllPathChallenges() {
        return ResponseEntity.ok(pathChallengeService.getAllPathChallenges());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PathChallengeResponseDTO> getPathChallengeById(@PathVariable Integer id) {
        return ResponseEntity.ok(pathChallengeService.getPathChallengeById(id));
    }

    @PostMapping
    @Audit(modulo = "CHALLENGES", accion = "CREACION_CHALLENGE")
    public ResponseEntity<PathChallengeResponseDTO> createPathChallenge(@RequestBody PathChallengeRequestDTO request) {
        return new ResponseEntity<>(pathChallengeService.createPathChallenge(request), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/tasks")
    @Audit(modulo = "CHALLENGES", accion = "CREACION_TAREA_CHALLENGE")
    public ResponseEntity<PathChallengeTaskDTO> createPathChallengeTask(
            @PathVariable Integer id,
            @RequestBody PathChallengeTaskDTO request
    ) {
        return new ResponseEntity<>(
                pathChallengeService.createPathChallengeTask(id, request),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}/tasks/{taskId}")
    @Audit(modulo = "CHALLENGES", accion = "EDICION_TAREA_CHALLENGE")
    public ResponseEntity<PathChallengeTaskDTO> updatePathChallengeTask(
            @PathVariable Integer id,
            @PathVariable Integer taskId,
            @RequestBody PathChallengeTaskDTO request
    ) {
        return ResponseEntity.ok(
                pathChallengeService.updatePathChallengeTask(id, taskId, request)
        );
    }

    @PutMapping("/{id}")
    @Audit(modulo = "CHALLENGES", accion = "EDICION_CHALLENGE")
    public ResponseEntity<PathChallengeResponseDTO> updatePathChallenge(@PathVariable Integer id, @RequestBody PathChallengeRequestDTO request) {
        return ResponseEntity.ok(pathChallengeService.updatePathChallenge(id, request));
    }

    @DeleteMapping("/{id}")
    @Audit(modulo = "CHALLENGES", accion = "ELIMINACION_CHALLENGE")
    public ResponseEntity<Void> deletePathChallenge(@PathVariable Integer id) {
        pathChallengeService.deletePathChallenge(id);
        return ResponseEntity.noContent().build();
    }
}
