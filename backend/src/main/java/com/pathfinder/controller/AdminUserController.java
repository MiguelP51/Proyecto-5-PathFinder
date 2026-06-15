package com.pathfinder.controller;

import com.pathfinder.dto.admin.user.AdminUserResponseDTO;
import com.pathfinder.dto.admin.user.UpdateUserRoleRequestDTO;
import com.pathfinder.dto.response.ApiResponse;
import com.pathfinder.service.UserService;
import com.pathfinder.audit.annotation.Audit;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminUserResponseDTO>>> listarUsuarios() {
        List<AdminUserResponseDTO> usuarios = userService.listarUsuarios()
                .stream()
                .map(AdminUserResponseDTO::from)
                .toList();

        return ResponseEntity.ok(
                ApiResponse.success("Usuarios obtenidos correctamente", usuarios)
        );
    }

    @PutMapping("/{idUsuario}/role")
    @Audit(modulo = "SEGURIDAD", accion = "CAMBIO_ROL")
    public ResponseEntity<ApiResponse<AdminUserResponseDTO>> actualizarRol(
            @PathVariable Integer idUsuario,
            @Valid @RequestBody UpdateUserRoleRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            var usuario = userService.actualizarRolUsuario(
                    idUsuario,
                    request.getRol(),
                    userDetails.getUsername()
            );

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Rol actualizado correctamente",
                            AdminUserResponseDTO.from(usuario)
                    )
            );

        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(e.getMessage()));

        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}