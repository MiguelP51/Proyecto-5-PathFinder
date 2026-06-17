"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PathChallengeRequestDTO } from "@/lib/pathchallenge/types";
import { pathChallengeService } from "@/lib/pathchallenge/service";

export default function NewPathChallengePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<PathChallengeRequestDTO>({
    titulo: "",
    dificultad: "Facil",
    xp: 0,
    estado: "Borrador",
    subareaId: 1, // Placeholder
    habilidadesIds: [],
    tareas: []
  });

  const [newTaskDesc, setNewTaskDesc] = useState("");

  const handleAddTask = () => {
    if (!newTaskDesc.trim()) return;
    setFormData(prev => ({
      ...prev,
      tareas: [
        ...prev.tareas,
        { descripcion: newTaskDesc, orden: prev.tareas.length + 1 }
      ]
    }));
    setNewTaskDesc("");
  };

  const handleRemoveTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tareas: prev.tareas.filter((_, i) => i !== index).map((t, i) => ({ ...t, orden: i + 1 }))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pathChallengeService.create(formData);
      router.push("/admin/pathchallenges");
    } catch (error) {
      console.error("Error creating path challenge:", error);
      alert("Error al crear la misión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-black tracking-tight text-[#0E3E66]">Nueva Misión</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Título</label>
          <input 
            type="text" 
            required
            className="w-full border-slate-200 rounded-xl px-4 py-2 text-sm"
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Dificultad</label>
            <select 
              className="w-full border-slate-200 rounded-xl px-4 py-2 text-sm"
              value={formData.dificultad}
              onChange={(e) => setFormData({...formData, dificultad: e.target.value})}
            >
              <option value="Facil">Fácil</option>
              <option value="Media">Media</option>
              <option value="Dificil">Difícil</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">XP</label>
            <input 
              type="number" 
              required
              min="0"
              className="w-full border-slate-200 rounded-xl px-4 py-2 text-sm"
              value={formData.xp}
              onChange={(e) => setFormData({...formData, xp: Number(e.target.value)})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Estado</label>
          <select 
            className="w-full border-slate-200 rounded-xl px-4 py-2 text-sm"
            value={formData.estado}
            onChange={(e) => setFormData({...formData, estado: e.target.value})}
          >
            <option value="Borrador">Borrador</option>
            <option value="Publicada">Publicada</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-700 mb-2">Tareas</label>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              className="flex-1 border-slate-200 rounded-xl px-4 py-2 text-sm"
              placeholder="Descripción de la tarea"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
            />
            <button 
              type="button" 
              onClick={handleAddTask}
              className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition"
            >
              Añadir
            </button>
          </div>
          <ul className="space-y-2">
            {formData.tareas.map((tarea, index) => (
              <li key={index} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-sm">{tarea.orden}. {tarea.descripcion}</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveTask(index)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-6 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition text-sm"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#0E3E66] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition disabled:opacity-50 text-sm"
          >
            {loading ? "Guardando..." : "Guardar Misión"}
          </button>
        </div>
      </form>
    </div>
  );
}
