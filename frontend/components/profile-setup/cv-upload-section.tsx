"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CVUploadSectionProps {
  onCVUpload: (file: File) => void;
  isProcessing?: boolean;
  cvUploaded?: boolean;
  cvFileName?: string;
  disabled?: boolean;
  onDownloadCV?: (download: boolean) => void;
}

export function CVUploadSection({
  onCVUpload,
  isProcessing = false,
  cvUploaded = false,
  cvFileName,
  disabled = false,
  onDownloadCV,
}: CVUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Formato no válido. Solo se permiten archivos PDF para el CV.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo excede el límite permitido de 10 MB.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      onCVUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    if (disabled) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Formato no válido. Solo se permiten archivos PDF para el CV.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo excede el límite permitido de 10 MB.");
        return;
      }
      onCVUpload(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
        isDragging && !disabled
          ? "border-[#643781] bg-[#643781]/5"
          : cvUploaded
          ? "border-green-400 bg-green-50"
          : disabled
          ? "border-slate-200 bg-slate-50 text-slate-400"
          : "border-slate-300 bg-slate-50/50 hover:border-[#0E3E66]/50 hover:bg-slate-100/50"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        disabled={disabled}
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
            {!disabled && (
              <p className="mt-1 text-sm text-slate-500">
                Los campos han sido autocompletados
              </p>
            )}
          </div>
          {onDownloadCV && (
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              <Button
                variant="outline"
                onClick={() => onDownloadCV(false)}
                className="border-[#0E3E66] text-[#0E3E66] hover:bg-slate-50 text-xs py-1 h-7 font-semibold"
              >
                Ver CV (PDF)
              </Button>
              <Button
                variant="outline"
                onClick={() => onDownloadCV(true)}
                className="border-[#0E3E66] text-[#0E3E66] hover:bg-slate-50 text-xs py-1 h-7 font-semibold"
              >
                Descargar CV
              </Button>
            </div>
          )}
          {!disabled && (
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 border-green-600 text-green-600 hover:bg-green-50 text-xs py-1 h-7"
            >
              <FileText className="mr-2 h-3.5 w-3.5" />
              Cambiar CV
            </Button>
          )}
        </div>
      ) : disabled ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-500">
              Sin CV adjunto
            </p>
            <p className="text-sm text-slate-400">
              No se ha subido ningún archivo de CV para este perfil
            </p>
          </div>
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
            <p className="mt-1 text-xs text-slate-400 font-medium">
              Formatos aceptados: Solo PDF
            </p>
            <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2 max-w-sm mx-auto font-medium">
              ⚠️ Nota: El CV es analizado automáticamente para extraer tu perfil. Solo se admite PDF.
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
