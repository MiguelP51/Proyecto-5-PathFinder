"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Languages, Wrench, Plus, X } from "lucide-react";

export interface SkillItem {
  name: string;
  level: "Básico" | "Intermedio" | "Avanzado";
}

interface SkillsLanguagesToolsSectionProps {
  skills: SkillItem[];
  languages: SkillItem[];
  tools: SkillItem[];
  onSkillsChange: (skills: SkillItem[]) => void;
  onLanguagesChange: (languages: SkillItem[]) => void;
  onToolsChange: (tools: SkillItem[]) => void;
}

const skillOptions = [
  "Comunicación efectiva",
  "Trabajo en equipo",
  "Liderazgo",
  "Resolución de problemas",
  "Pensamiento crítico",
  "Adaptabilidad",
  "Gestión del tiempo",
  "Creatividad",
  "Negociación",
  "Inteligencia emocional",
  "Toma de decisiones",
  "Orientación al cliente",
  "Análisis de datos",
  "Presentaciones",
  "Gestión de proyectos",
];

const languageOptions = [
  "Español",
  "Inglés",
  "Portugués",
  "Francés",
  "Alemán",
  "Italiano",
  "Chino Mandarín",
  "Japonés",
  "Coreano",
  "Quechua",
];

const toolOptions = [
  "Microsoft Excel",
  "Microsoft Word",
  "Microsoft PowerPoint",
  "Google Workspace",
  "Canva",
  "SAP",
  "Salesforce",
  "Trello",
  "Slack",
  "Zoom",
  "Python",
  "JavaScript",
  "SQL",
  "Power BI",
  "Tableau",
  "AutoCAD",
  "Adobe Photoshop",
  "Figma",
];

const levels: ("Básico" | "Intermedio" | "Avanzado")[] = [
  "Básico",
  "Intermedio",
  "Avanzado",
];

const levelColors = {
  Básico: "bg-blue-100 text-blue-700 border-blue-200",
  Intermedio: "bg-purple-100 text-purple-700 border-purple-200",
  Avanzado: "bg-green-100 text-green-700 border-green-200",
};

function SkillSelector({
  title,
  icon: Icon,
  iconGradient,
  items,
  options,
  onAdd,
  onRemove,
  onLevelChange,
}: {
  title: string;
  icon: React.ElementType;
  iconGradient: string;
  items: SkillItem[];
  options: string[];
  onAdd: (name: string, level: "Básico" | "Intermedio" | "Avanzado") => void;
  onRemove: (name: string) => void;
  onLevelChange: (name: string, level: "Básico" | "Intermedio" | "Avanzado") => void;
}) {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<"Básico" | "Intermedio" | "Avanzado">("Intermedio");

  const availableOptions = options.filter(
    (opt) => !items.some((item) => item.name === opt)
  );

  const handleAdd = () => {
    if (selectedOption && selectedLevel) {
      onAdd(selectedOption, selectedLevel);
      setSelectedOption("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconGradient}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-[#0E3E66]">{title}</h3>
      </div>

      {/* Add new */}
      <div className="flex flex-wrap gap-2">
        <Select value={selectedOption} onValueChange={setSelectedOption}>
          <SelectTrigger className="w-[200px] border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20">
            <SelectValue placeholder={`Seleccionar ${title.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {availableOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedLevel} 
          onValueChange={(v) => setSelectedLevel(v as "Básico" | "Intermedio" | "Avanzado")}
        >
          <SelectTrigger className="w-[140px] border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20">
            <SelectValue placeholder="Nivel" />
          </SelectTrigger>
          <SelectContent>
            {levels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleAdd}
          disabled={!selectedOption}
          className="border-[#0E3E66] text-[#0E3E66] hover:bg-[#0E3E66]/5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </div>

      {/* Selected items */}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge
            key={item.name}
            variant="outline"
            className={`flex items-center gap-2 px-3 py-1.5 ${levelColors[item.level]}`}
          >
            <span className="font-medium">{item.name}</span>
            <Select
              value={item.level}
              onValueChange={(v) => onLevelChange(item.name, v as "Básico" | "Intermedio" | "Avanzado")}
            >
              <SelectTrigger className="h-5 w-auto border-0 bg-transparent p-0 text-xs font-semibold shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={() => onRemove(item.name)}
              className="ml-1 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-slate-400">
          No has agregado {title.toLowerCase()} todavía
        </p>
      )}
    </div>
  );
}

export function SkillsLanguagesToolsSection({
  skills,
  languages,
  tools,
  onSkillsChange,
  onLanguagesChange,
  onToolsChange,
}: SkillsLanguagesToolsSectionProps) {
  const handleAddSkill = (name: string, level: "Básico" | "Intermedio" | "Avanzado") => {
    onSkillsChange([...skills, { name, level }]);
  };

  const handleRemoveSkill = (name: string) => {
    onSkillsChange(skills.filter((s) => s.name !== name));
  };

  const handleSkillLevelChange = (name: string, level: "Básico" | "Intermedio" | "Avanzado") => {
    onSkillsChange(skills.map((s) => (s.name === name ? { ...s, level } : s)));
  };

  const handleAddLanguage = (name: string, level: "Básico" | "Intermedio" | "Avanzado") => {
    onLanguagesChange([...languages, { name, level }]);
  };

  const handleRemoveLanguage = (name: string) => {
    onLanguagesChange(languages.filter((l) => l.name !== name));
  };

  const handleLanguageLevelChange = (name: string, level: "Básico" | "Intermedio" | "Avanzado") => {
    onLanguagesChange(languages.map((l) => (l.name === name ? { ...l, level } : l)));
  };

  const handleAddTool = (name: string, level: "Básico" | "Intermedio" | "Avanzado") => {
    onToolsChange([...tools, { name, level }]);
  };

  const handleRemoveTool = (name: string) => {
    onToolsChange(tools.filter((t) => t.name !== name));
  };

  const handleToolLevelChange = (name: string, level: "Básico" | "Intermedio" | "Avanzado") => {
    onToolsChange(tools.map((t) => (t.name === name ? { ...t, level } : t)));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8E348F] to-[#B9309C]">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-[#0E3E66]">
          Habilidades, Idiomas y Herramientas
        </h2>
      </div>

      <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SkillSelector
          title="Habilidades"
          icon={Sparkles}
          iconGradient="bg-gradient-to-br from-[#0E3E66] to-[#393B74]"
          items={skills}
          options={skillOptions}
          onAdd={handleAddSkill}
          onRemove={handleRemoveSkill}
          onLevelChange={handleSkillLevelChange}
        />

        <div className="border-t border-slate-100" />

        <SkillSelector
          title="Idiomas"
          icon={Languages}
          iconGradient="bg-gradient-to-br from-[#393B74] to-[#643781]"
          items={languages}
          options={languageOptions}
          onAdd={handleAddLanguage}
          onRemove={handleRemoveLanguage}
          onLevelChange={handleLanguageLevelChange}
        />

        <div className="border-t border-slate-100" />

        <SkillSelector
          title="Herramientas"
          icon={Wrench}
          iconGradient="bg-gradient-to-br from-[#643781] to-[#8E348F]"
          items={tools}
          options={toolOptions}
          onAdd={handleAddTool}
          onRemove={handleRemoveTool}
          onLevelChange={handleToolLevelChange}
        />
      </div>
    </div>
  );
}
