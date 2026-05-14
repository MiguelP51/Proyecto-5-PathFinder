"use client";

import { useState } from "react";
import { ProfileHeader } from "../../../components/ProfileSetup/profile-header";
import { ProfilePhotoSection } from "../../../components/ProfileSetup/profile-photo-section";
import { CVUploadSection } from "../../../components/ProfileSetup/cv-upload-section";
import { PersonalDataSection } from "../../../components/ProfileSetup/personal-data-section";
import {
    EducationSection,
    type Education,
} from "../../../components/ProfileSetup/education-section";
import {
    WorkExperienceSection,
    type WorkExperience,
} from "../../../components/ProfileSetup/work-experience-section";
import {
    SkillsLanguagesToolsSection,
    type SkillItem,
} from "../../../components/ProfileSetup/skills-languages-tools-section";

import { Button } from "../../../components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function ProfileSetupPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [isProcessingCV, setIsProcessingCV] = useState(false);
    const [cvUploaded, setCvUploaded] = useState(false);
    const [cvFileName, setCvFileName] = useState("");

    // Photo
    const [photoUrl, setPhotoUrl] = useState("");

    // Personal Data
    const [personalData, setPersonalData] = useState({
        fullName: "María García López",
        email: "maria.garcia@gmail.com",
        phone: "",
        region: "",
        provincia: "",
        distrito: "",
    });

    // Education
    const [educations, setEducations] = useState<Education[]>([]);

    // Work Experience
    const [experiences, setExperiences] = useState<WorkExperience[]>([]);

    // Skills, Languages, Tools
    const [skills, setSkills] = useState<SkillItem[]>([]);
    const [languages, setLanguages] = useState<SkillItem[]>([
        { name: "Español", level: "Avanzado" },
    ]);
    const [tools, setTools] = useState<SkillItem[]>([]);

    const handlePhotoChange = (file: File) => {
        const url = URL.createObjectURL(file);
        setPhotoUrl(url);
    };

    const handleCVUpload = async (file: File) => {
        setIsProcessingCV(true);
        setCvFileName(file.name);

        // Simulate CV processing
        await new Promise((resolve) => setTimeout(resolve, 2500));

        // Auto-fill data (simulated)
        setPersonalData((prev) => ({
            ...prev,
            phone: "+51 999 888 777",
            region: "Lima",
            provincia: "Lima",
            distrito: "Miraflores",
        }));

        setEducations([
            {
                id: "1",
                institution: "Universidad de Lima",
                career: "Administración de Empresas",
                startDate: "2020-03",
                endDate: "2024-12",
                relevantCourses: ["Gestión de Proyectos", "Marketing Digital", "Finanzas Corporativas"],
            },
        ]);

        setExperiences([
            {
                id: "1",
                company: "Empresa Demo S.A.",
                position: "Practicante de Administración",
                startDate: "2023-01",
                endDate: "2023-06",
                functions: "Apoyo en la gestión administrativa y elaboración de reportes",
                achievements: "Implementé un sistema de seguimiento que mejoró la eficiencia en 15%",
            },
        ]);

        setSkills([
            { name: "Trabajo en equipo", level: "Avanzado" },
            { name: "Comunicación efectiva", level: "Intermedio" },
            { name: "Gestión del tiempo", level: "Intermedio" },
        ]);

        setTools([
            { name: "Microsoft Excel", level: "Avanzado" },
            { name: "Microsoft PowerPoint", level: "Intermedio" },
            { name: "Google Workspace", level: "Avanzado" },
        ]);

        setIsProcessingCV(false);
        setCvUploaded(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSaving(false);
        // Navigate to next step or dashboard
        alert("¡Perfil guardado exitosamente!");
    };

    const handleSkip = () => {
        // Navigate to dashboard
        alert("Has omitido la configuración del perfil");
    };

    // Calculate completion percentage
    const completionItems = [
        personalData.fullName,
        personalData.phone,
        personalData.region,
        educations.length > 0,
        skills.length > 0,
        languages.length > 0,
        tools.length > 0,
    ];
    const completedItems = completionItems.filter(Boolean).length;
    const completionPercentage = Math.round(
        (completedItems / completionItems.length) * 100
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
            <ProfileHeader
                onSave={handleSave}
                onSkip={handleSkip}
                isSaving={isSaving}
            />

            <main className="container mx-auto px-4 py-8 md:px-6">
                {/* Progress Bar */}
                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-[#0E3E66]">
                                Progreso del perfil
                            </h2>
                            <p className="text-sm text-slate-500">
                                Completa tu perfil para tener mejores oportunidades
                            </p>
                        </div>
                        <div className="text-right">
              <span className="text-3xl font-bold text-[#0E3E66]">
                {completionPercentage}%
              </span>
                            <p className="text-sm text-slate-500">completado</p>
                        </div>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#0E3E66] via-[#643781] to-[#B9309C] transition-all duration-500"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
                    {/* Left Sidebar */}
                    <div className="space-y-6">
                        {/* Profile Photo */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <ProfilePhotoSection
                                photoUrl={photoUrl}
                                userName={personalData.fullName}
                                onPhotoChange={handlePhotoChange}
                            />
                        </div>

                        {/* CV Upload */}
                        <CVUploadSection
                            onCVUpload={handleCVUpload}
                            isProcessing={isProcessingCV}
                            cvUploaded={cvUploaded}
                            cvFileName={cvFileName}
                        />

                        {/* Quick tips */}
                        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0E3E66] to-[#643781] p-6 text-white shadow-sm">
                            <h3 className="mb-3 font-semibold">💡 Consejos</h3>
                            <ul className="space-y-2 text-sm text-white/90">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <span>Sube tu CV para autocompletar tu perfil</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <span>Completa todas las secciones para destacar</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <span>Agrega habilidades relevantes para el puesto</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-8">
                        {/* Personal Data */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                            <PersonalDataSection
                                data={personalData}
                                onChange={setPersonalData}
                            />
                        </section>

                        {/* Education */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                            <EducationSection
                                educations={educations}
                                onChange={setEducations}
                            />
                        </section>

                        {/* Work Experience */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                            <WorkExperienceSection
                                experiences={experiences}
                                onChange={setExperiences}
                            />
                        </section>

                        {/* Skills, Languages, Tools */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                            <SkillsLanguagesToolsSection
                                skills={skills}
                                languages={languages}
                                tools={tools}
                                onSkillsChange={setSkills}
                                onLanguagesChange={setLanguages}
                                onToolsChange={setTools}
                            />
                        </section>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4 pb-8">
                            <Button
                                variant="outline"
                                onClick={handleSkip}
                                className="border-slate-300 text-slate-600 hover:bg-slate-100"
                            >
                                Omitir por ahora
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                size="lg"
                                className="bg-gradient-to-r from-[#0E3E66] via-[#643781] to-[#8E348F] text-white hover:opacity-90"
                            >
                                {isSaving ? (
                                    "Guardando..."
                                ) : (
                                    <>
                                        Guardar y Continuar
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
