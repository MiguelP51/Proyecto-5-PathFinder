"use client";

import { useRef, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    FileText,
    Loader2,
    Upload,
} from "lucide-react";

import { SkillPathEvidence } from "@/lib/skillpath/types";
import {
    getSkillPathEvidenceStatusClasses,
    getSkillPathEvidenceStatusLabel,
} from "@/lib/skillpath/display";

interface SkillPathEvidenceSectionProps {
    skillPathId: string;
    initialEvidence?: SkillPathEvidence;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function SkillPathEvidenceSection({
                                             skillPathId,
                                             initialEvidence,
                                         }: SkillPathEvidenceSectionProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [evidence, setEvidence] = useState<SkillPathEvidence | undefined>(
        initialEvidence,
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const evidenceStatus = evidence?.status ?? "SIN_EVIDENCIA";

    const handleSelectFile = (file: File | undefined) => {
        setErrorMessage(null);

        if (!file) {
            return;
        }

        if (file.type !== "application/pdf") {
            setSelectedFile(null);
            setErrorMessage("El archivo debe estar en formato PDF.");
            return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            setSelectedFile(null);
            setErrorMessage(`El archivo no debe superar los ${MAX_FILE_SIZE_MB} MB.`);
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setErrorMessage("Selecciona un archivo PDF antes de continuar.");
            return;
        }

        setIsUploading(true);
        setErrorMessage(null);

        await new Promise((resolve) => setTimeout(resolve, 700));

        setEvidence({
            id: `mock-evidence-${skillPathId}`,
            fileName: selectedFile.name,
            status: "PENDIENTE",
            uploadedAt: new Date().toLocaleDateString("es-PE"),
        });

        setSelectedFile(null);
        setIsUploading(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                            <Upload className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-950">
                                Certificado o evidencia
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Sube un PDF que demuestre que completaste este recurso externo.
                            </p>
                        </div>
                    </div>
                </div>

                <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getSkillPathEvidenceStatusClasses(
                        evidenceStatus,
                    )}`}
                >
          {getSkillPathEvidenceStatusLabel(evidenceStatus)}
        </span>
            </div>

            {evidence && (
                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                        <FileText className="mt-0.5 h-5 w-5 text-[#7447D7]" />

                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                {evidence.fileName}
                            </p>

                            {evidence.uploadedAt && (
                                <p className="mt-1 text-sm text-slate-500">
                                    Subido el {evidence.uploadedAt}
                                </p>
                            )}

                            {evidence.reviewerComment && (
                                <p className="mt-3 text-sm text-slate-600">
                                    Comentario: {evidence.reviewerComment}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            {evidence ? "Reemplazar evidencia" : "Subir nueva evidencia"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Formato permitido: PDF. Tamaño máximo: {MAX_FILE_SIZE_MB} MB.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf,.pdf"
                            className="hidden"
                            onChange={(event) => handleSelectFile(event.target.files?.[0])}
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            <FileText className="h-4 w-4" />
                            Seleccionar PDF
                        </button>

                        <button
                            type="button"
                            disabled={isUploading}
                            onClick={handleUpload}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7447D7] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6036c2] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Subiendo...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Enviar evidencia
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {selectedFile && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Archivo seleccionado: {selectedFile.name}
                    </div>
                )}

                {errorMessage && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        {errorMessage}
                    </div>
                )}
            </div>
        </section>
    );
}