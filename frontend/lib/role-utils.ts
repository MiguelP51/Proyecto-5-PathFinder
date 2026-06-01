/**
 * Utilidades para manejo de roles
 */

export type UserRole = "user" | "mentor" | "admin";

/**
 * Obtiene la ruta base según el rol
 */
export function getRoleBasePath(rol?: string): string {
  switch (rol?.toLowerCase()) {
    case "mentor":
      return "/mentor";
    case "admin":
      return "/admin";
    case "user":
    default:
      return "/user";
  }
}

/**
 * Obtiene la ruta de inicio según el rol
 */
export function getRoleHomePath(rol?: string): string {
  return `${getRoleBasePath(rol)}/home`;
}

/**
 * Valida si el rol es válido
 */
export function isValidRole(rol?: string): boolean {
  return ["user", "mentor", "admin"].includes(rol?.toLowerCase() || "");
}

/**
 * Obtiene el nombre visible del rol
 */
export function getRoleDisplayName(rol?: string): string {
  switch (rol?.toLowerCase()) {
    case "mentor":
      return "Mentor";
    case "admin":
      return "Administrador";
    case "user":
    default:
      return "Usuario";
  }
}
