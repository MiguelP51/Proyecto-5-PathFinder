"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User, Mail, Phone, MapPin } from "lucide-react";

interface PersonalData {
    fullName: string;
    email: string;
    phone: string;
    region: string;
    provincia: string;
    distrito: string;
}

interface PersonalDataSectionProps {
    data: PersonalData;
    onChange: (data: PersonalData) => void;
}

const regiones = [
    "Lima",
    "Arequipa",
    "La Libertad",
    "Piura",
    "Cusco",
    "Lambayeque",
    "Junín",
    "Ancash",
    "Callao",
    "Ica",
];

const provincias: Record<string, string[]> = {
    Lima: ["Lima", "Barranca", "Cajatambo", "Canta", "Cañete", "Huaral", "Huarochirí", "Huaura", "Oyón", "Yauyos"],
    Arequipa: ["Arequipa", "Camaná", "Caravelí", "Castilla", "Caylloma", "Condesuyos", "Islay", "La Unión"],
    "La Libertad": ["Trujillo", "Ascope", "Bolívar", "Chepén", "Gran Chimú", "Julcán", "Otuzco", "Pacasmayo"],
    Piura: ["Piura", "Ayabaca", "Huancabamba", "Morropón", "Paita", "Sechura", "Sullana", "Talara"],
    Cusco: ["Cusco", "Acomayo", "Anta", "Calca", "Canas", "Canchis", "Chumbivilcas", "Espinar"],
    Lambayeque: ["Chiclayo", "Ferreñafe", "Lambayeque"],
    Junín: ["Huancayo", "Chanchamayo", "Chupaca", "Concepción", "Jauja", "Junín", "Satipo", "Tarma", "Yauli"],
    Ancash: ["Huaraz", "Aija", "Antonio Raymondi", "Asunción", "Bolognesi", "Carhuaz", "Carlos Fermín Fitzcarrald"],
    Callao: ["Callao"],
    Ica: ["Ica", "Chincha", "Nazca", "Palpa", "Pisco"],
};

export function PersonalDataSection({
                                        data,
                                        onChange,
                                    }: PersonalDataSectionProps) {
    const handleChange = (field: keyof PersonalData, value: string) => {
        const newData = { ...data, [field]: value };

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

    const availableProvincias = data.region ? provincias[data.region] || [] : [];

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
                        placeholder="+51 999 999 999"
                        className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
                    />
                </div>

                {/* Region */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-slate-700">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        Región
                    </Label>
                    <Select value={data.region} onValueChange={(value) => handleChange("region", value)}>
                        <SelectTrigger className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20">
                            <SelectValue placeholder="Selecciona tu región" />
                        </SelectTrigger>
                        <SelectContent>
                            {regiones.map((region) => (
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
                        disabled={!data.region}
                    >
                        <SelectTrigger className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20">
                            <SelectValue placeholder="Selecciona tu provincia" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableProvincias.map((provincia) => (
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
                    <Input
                        value={data.distrito}
                        onChange={(e) => handleChange("distrito", e.target.value)}
                        placeholder="Ingresa tu distrito"
                        disabled={!data.provincia}
                        className="border-slate-200 focus:border-[#0E3E66] focus:ring-[#0E3E66]/20"
                    />
                </div>
            </div>
        </div>
    );
}
