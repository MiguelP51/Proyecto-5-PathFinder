package com.pathfinder.service;

import com.pathfinder.dto.admin.progress.AdminStudentProgressSummaryDTO;
import com.pathfinder.dto.admin.progress.AdminStudentSkillPathProgressDTO;
import com.pathfinder.dto.admin.progress.AdminStudentSubAreaProgressDTO;

import java.util.List;

public interface AdminStudentProgressService {
    List<AdminStudentProgressSummaryDTO> listarResumenEstudiantes();

    List<AdminStudentSkillPathProgressDTO> listarSkillPathsEstudiante(Integer idUsuario);

    List<AdminStudentSubAreaProgressDTO> listarSubAreasEstudiante(Integer idUsuario);
}
