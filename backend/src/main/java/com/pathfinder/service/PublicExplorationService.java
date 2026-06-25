package com.pathfinder.service;

import com.pathfinder.dto.response.PublicAreaResponseDTO;
import com.pathfinder.dto.response.PublicStatsDTO;
import java.util.List;

public interface PublicExplorationService {
    PublicStatsDTO getPublicStats();
    List<PublicAreaResponseDTO> getPublicAreas();
    PublicAreaResponseDTO getPublicAreaDetail(String idArea);
}
