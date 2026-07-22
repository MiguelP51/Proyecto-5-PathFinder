package com.pathfinder.service;

import com.pathfinder.dto.admin.pathchallenge.PathChallengeRequestDTO;
import com.pathfinder.dto.admin.pathchallenge.PathChallengeResponseDTO;
import com.pathfinder.dto.admin.pathchallenge.PathChallengeTaskDTO;
import java.util.List;

public interface PathChallengeService {
    List<PathChallengeResponseDTO> getAllPathChallenges();
    PathChallengeResponseDTO getPathChallengeById(Integer id);
    PathChallengeResponseDTO createPathChallenge(PathChallengeRequestDTO request);
    PathChallengeResponseDTO updatePathChallenge(Integer id, PathChallengeRequestDTO request);
    PathChallengeTaskDTO createPathChallengeTask(Integer idPathChallenge, PathChallengeTaskDTO request);
    PathChallengeTaskDTO updatePathChallengeTask(
            Integer idPathChallenge,
            Integer idPathChallengeTask,
            PathChallengeTaskDTO request
    );
    void deletePathChallenge(Integer id);
}
