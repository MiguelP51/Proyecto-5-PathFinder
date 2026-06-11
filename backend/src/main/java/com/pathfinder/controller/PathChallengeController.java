package com.pathfinder.controller;

import com.pathfinder.dto.admin.pathchallenge.PathChallengeRequestDTO;
import com.pathfinder.dto.admin.pathchallenge.PathChallengeResponseDTO;
import com.pathfinder.service.PathChallengeService;
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
    public ResponseEntity<PathChallengeResponseDTO> createPathChallenge(@RequestBody PathChallengeRequestDTO request) {
        return new ResponseEntity<>(pathChallengeService.createPathChallenge(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PathChallengeResponseDTO> updatePathChallenge(@PathVariable Integer id, @RequestBody PathChallengeRequestDTO request) {
        return ResponseEntity.ok(pathChallengeService.updatePathChallenge(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePathChallenge(@PathVariable Integer id) {
        pathChallengeService.deletePathChallenge(id);
        return ResponseEntity.noContent().build();
    }
}
