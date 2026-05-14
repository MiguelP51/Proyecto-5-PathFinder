"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Plus, Trash2, Calendar } from "lucide-react";

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  functions: string;
  achievements: string;
}

interface WorkExperienceSectionProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}

export function WorkExperienceSection({
  experiences,
  onChange,
}: WorkExperienceSectionProps) {
  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      functions: "",
      achievements: "",
    };
    onChange([...experiences, newExperience]);
  };

  const removeExperience = (id: string) => {
    onChange(experiences.filter((exp) => exp.id !== id));
  };

  const updateExperience = (
    id: string,
    field: keyof WorkExperience,
    value: string
  ) => {
    onChange(
      experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#643781] to-[#8E348F]">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-[#0E3E66]">
            Experiencia Laboral
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addExperience}
          className="border-[#0E3E66] text-[#0E3E66] hover:bg-[#0E3E66]/5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </div>

      {experiences.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500">
            No has agregado experiencia laboral
          </p>
          <p className="text-sm text-slate-400">
            Si no tienes experiencia, puedes omitir esta sección
          </p>
          <Button
            variant="outline"
            onClick={addExperience}
            className="mt-4 border-[#0E3E66] text-[#0E3E66] hover:bg-[#0E3E66]/5"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar experiencia
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div
              key={exp.id}
              className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="absolute -left-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#643781] to-[#8E348F] text-sm font-semibold text-white">
                {index + 1}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeExperience(exp.id)}
                className="absolute right-2 top-2 h-8 w-8 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-700">Empresa</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(exp.id, "company", e.target.value)
                    }
                    placeholder="Nombre de la empresa"
                    className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700">Cargo</Label>
                  <Input
                    value={exp.position}
                    onChange={(e) =>
                      updateExperience(exp.id, "position", e.target.value)
                    }
                    placeholder="Puesto que ocupaste"
                    className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-slate-700">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Fecha de Inicio
                  </Label>
                  <Input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(exp.id, "startDate", e.target.value)
                    }
                    className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-slate-700">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Fecha de Fin
                  </Label>
                  <Input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) =>
                      updateExperience(exp.id, "endDate", e.target.value)
                    }
                    className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-700">Funciones Realizadas</Label>
                  <Textarea
                    value={exp.functions}
                    onChange={(e) =>
                      updateExperience(exp.id, "functions", e.target.value)
                    }
                    placeholder="Describe las principales funciones que realizaste"
                    rows={3}
                    className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-700">Logros / Resultados</Label>
                  <Textarea
                    value={exp.achievements}
                    onChange={(e) =>
                      updateExperience(exp.id, "achievements", e.target.value)
                    }
                    placeholder="Describe los logros o resultados que obtuviste"
                    rows={3}
                    className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
