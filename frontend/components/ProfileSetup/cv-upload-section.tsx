"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";

interface CVUploadSectionProps {
    onCVUpload: (file: File) => void;
    isProcessing?: boolean;
    cvUploaded?: boolean;
    cvFileName?: string;
}

export function CVUploadSection({
                                    onCVUpload,
                                    isProcessing = false,
                                    cvUploaded = false,
                                    cvFileName,
                                }: CVUploadSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onCVUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
            onCVUpload(file);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                isDragging
                    ? "border-[#643781] bg-[#643781]/5"
                    : cvUploaded
                        ? "border-green-400 bg-green-50"
                        : "border-slate-300 bg-slate-50/50 hover:border-[#0E3E66]/50 hover:bg-slate-100/50"
            }`}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
            />

            {isProcessing ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0E3E66] to-[#643781]">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-[#0E3E66]">
                            Procesando tu CV...
                        </p>
                        <p className="text-sm text-slate-500">
                            Estamos extrayendo tu información
                        </p>
                    </div>
                </div>
            ) : cvUploaded ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-green-700">
                            CV subido correctamente
                        </p>
                        {cvFileName && (
                            <p className="text-sm text-slate-500">{cvFileName}</p>
                        )}
                        <p className="mt-1 text-sm text-slate-500">
                            Los campos han sido autocompletados
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 border-green-600 text-green-600 hover:bg-green-50"
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Cambiar CV
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0E3E66] to-[#643781]">
                        <Upload className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-[#0E3E66]">
                            Sube tu CV para autocompletar
                        </p>
                        <p className="text-sm text-slate-500">
                            Arrastra y suelta tu archivo o haz clic para seleccionar
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            Formatos aceptados: PDF, DOC, DOCX
                        </p>
                    </div>
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 bg-gradient-to-r from-[#0E3E66] via-[#643781] to-[#8E348F] text-white hover:opacity-90"
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Subir tu CV
                    </Button>
                </div>
            )}
        </div>
    );
}
