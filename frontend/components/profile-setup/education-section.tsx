"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Plus, Trash2, Calendar } from "lucide-react";

export interface Education {
  id: string;
  institution: string;
  career: string;
  startDate: string;
  endDate: string;
  relevantCourses: string[];
}

interface EducationSectionProps {
  educations: Education[];
  onChange: (educations: Education[]) => void;
}

export function EducationSection({ educations, onChange }: EducationSectionProps) {
  const [newCourse, setNewCourse] = useState<Record<string, string>>({});

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: "",
      career: "",
      startDate: "",
      endDate: "",
      relevantCourses: [],
    };
    onChange([...educations, newEducation]);
  };

  const removeEducation = (id: string) => {
    onChange(educations.filter((edu) => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string | string[]) => {
    onChange(
      educations.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const addCourse = (eduId: string) => {
    const course = newCourse[eduId]?.trim();
    if (course) {
      const education = educations.find((edu) => edu.id === eduId);
      if (education) {
        updateEducation(eduId, "relevantCourses", [...education.relevantCourses, course]);
        setNewCourse((prev) => ({ ...prev, [eduId]: "" }));
      }
    }
  };

  const removeCourse = (eduId: string, courseIndex: number) => {
    const education = educations.find((edu) => edu.id === eduId);
    if (education) {
      const newCourses = education.relevantCourses.filter((_, i) => i !== courseIndex);
      updateEducation(eduId, "relevantCourses", newCourses);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#393B74] to-[#643781]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-[#0E3E66]">Formación Académica</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addEducation}
          className="border-[#0E3E66] text-[#0E3E66] hover:bg-[#0E3E66]/5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </div>

      {educations.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500">No has agregado formación académica</p>
          <Button
            variant="outline"
            onClick={addEducation}
            className="mt-4 border-[#0E3E66] text-[#0E3E66] hover:bg-[#0E3E66]/5"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar formación
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {educations.map((edu, index) => (
            <div
              key={edu.id}
              className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="absolute -left-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#393B74] to-[#643781] text-sm font-semibold text-white">
                {index + 1}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeEducation(edu.id)}
                className="absolute right-2 top-2 h-8 w-8 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-700">Institución</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                    placeholder="Universidad / Instituto"
                    className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700">Carrera</Label>
                  <Input
                    value={edu.career}
                    onChange={(e) => updateEducation(edu.id, "career", e.target.value)}
                    placeholder="Nombre de la carrera"
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
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
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
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                    className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
                  />
                </div>
              </div>

              {/* Relevant Courses */}
              <div className="mt-4 space-y-3">
                <Label className="text-slate-700">Cursos Relevantes</Label>
                <div className="flex flex-wrap gap-2">
                  {edu.relevantCourses.map((course, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-[#643781]/10 text-[#643781] hover:bg-[#643781]/20"
                    >
                      {course}
                      <button
                        onClick={() => removeCourse(edu.id, i)}
                        className="ml-2 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newCourse[edu.id] || ""}
                    onChange={(e) =>
                      setNewCourse((prev) => ({ ...prev, [edu.id]: e.target.value }))
                    }
                    placeholder="Agregar curso relevante"
                    className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCourse(edu.id);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => addCourse(edu.id)}
                    className="border-[#643781] text-[#643781] hover:bg-[#643781]/5"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
