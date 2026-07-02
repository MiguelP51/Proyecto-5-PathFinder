export interface MiProgresoInsignia {
    idInsignia: number;
    nombre: string;
    descripcion?: string | null;
    emoji?: string | null;
    colorFondo?: string | null;
    fechaObtenida?: string | null;
}

export interface MiProgreso {
    xpTotal: number;
    nivel: number;
    xpSiguienteNivel: number;
    xpFaltanteSiguienteNivel: number;
    esNuevo: boolean;
    insignias: MiProgresoInsignia[];
}
