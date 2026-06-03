"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Phone, MapPin, Link2 } from "lucide-react";

interface PersonalData {
  fullName: string;
  email: string;
  phone: string;
  region: string;
  provincia: string;
  distrito: string;
  linkedinUrl?: string;
}

interface PersonalDataSectionProps {
  data: PersonalData;
  onChange: (data: PersonalData) => void;
  disabled?: boolean;
}

export function PersonalDataSection({
  data,
  onChange,
  disabled = false,
}: PersonalDataSectionProps) {
  const [ubigeoData, setUbigeoData] = useState<Record<string, Record<string, string[]>>>({});

  // Cargar ubigeo.json al montar el componente
  useEffect(() => {
    fetch("/assets/ubigeo.json")
      .then((res) => res.json())
      .then((json) => {
        setUbigeoData(json);
      })
      .catch((err) => console.error("Error loading ubigeo.json:", err));
  }, []);

  // Si se carga la data del perfil y viene con provincia pero sin región (ya que la región no se guarda en BD),
  // se busca la región que contiene a esa provincia para pre-seleccionar los combos.
  useEffect(() => {
    if (Object.keys(ubigeoData).length > 0 && !data.region && data.provincia) {
      for (const reg in ubigeoData) {
        if (ubigeoData[reg][data.provincia]) {
          onChange({ ...data, region: reg });
          break;
        }
      }
    }
  }, [ubigeoData, data.provincia, data.region, data, onChange]);

  const handleChange = (field: keyof PersonalData, value: string) => {
    let cleanValue = value;
    if (field === "phone") {
      cleanValue = value.replace(/[^0-9]/g, "");
    }
    const newData = { ...data, [field]: cleanValue };
    
    // Reset dependent fields
    if (field === "region") {
      newData.provincia = "";
      newData.distrito = "";
    }
    if (field === "provincia") {
      newData.distrito = "";
    }
    
    onChange(newData);
  };

  const regionesList = Object.keys(ubigeoData).sort();
  const provinciasList = data.region && ubigeoData[data.region]
    ? Object.keys(ubigeoData[data.region]).sort()
    : [];
  const distritosList = data.region && data.provincia && ubigeoData[data.region]?.[data.provincia]
    ? ubigeoData[data.region][data.provincia]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0E3E66] to-[#643781]">
          <User className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-[#0E3E66]">Datos Personales</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2 text-slate-700">
            <User className="h-4 w-4 text-slate-400" />
            Nombre Completo
          </Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="Tu nombre completo"
            className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
            disabled={disabled}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-slate-700">
            <Mail className="h-4 w-4 text-slate-400" />
            Correo Electrónico
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="tu@email.com"
            className="border-slate-200 bg-slate-50 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
            readOnly
          />
          <p className="text-xs text-slate-400">Vinculado a tu cuenta de Google</p>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2 text-slate-700">
            <Phone className="h-4 w-4 text-slate-400" />
            Celular
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="999888777 (9 dígitos, empieza con 9)"
            className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
            disabled={disabled}
          />
        </div>

        {/* LinkedIn URL */}
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl" className="flex items-center gap-2 text-slate-700">
            <Link2 className="h-4 w-4 text-slate-400" />
            Perfil de LinkedIn (Opcional)
          </Label>
          <Input
            id="linkedinUrl"
            value={data.linkedinUrl || ""}
            onChange={(e) => handleChange("linkedinUrl", e.target.value)}
            placeholder="https://www.linkedin.com/in/usuario"
            className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
            disabled={disabled}
          />
        </div>

        {/* Region */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-slate-700">
            <MapPin className="h-4 w-4 text-slate-400" />
            Región
          </Label>
          <Select value={data.region} onValueChange={(value) => handleChange("region", value)} disabled={disabled}>
            <SelectTrigger className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20">
              <SelectValue placeholder="Selecciona tu región" />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-[300px] overflow-y-auto">
              {regionesList.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Provincia */}
        <div className="space-y-2">
          <Label className="text-slate-700">Provincia</Label>
          <Select 
            value={data.provincia} 
            onValueChange={(value) => handleChange("provincia", value)}
            disabled={disabled || !data.region}
          >
            <SelectTrigger className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20">
              <SelectValue placeholder="Selecciona tu provincia" />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-[300px] overflow-y-auto">
              {provinciasList.map((provincia) => (
                <SelectItem key={provincia} value={provincia}>
                  {provincia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Distrito */}
        <div className="space-y-2">
          <Label className="text-slate-700">Distrito</Label>
          <Select 
            value={data.distrito} 
            onValueChange={(value) => handleChange("distrito", value)}
            disabled={disabled || !data.provincia}
          >
            <SelectTrigger className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20">
              <SelectValue placeholder="Selecciona tu distrito" />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-[300px] overflow-y-auto">
              {distritosList.map((distrito) => (
                <SelectItem key={distrito} value={distrito}>
                  {distrito}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
