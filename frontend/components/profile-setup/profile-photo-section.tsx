"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface ProfilePhotoSectionProps {
  photoUrl: string;
  userName: string;
  onPhotoChange: (file: File) => void;
  compact?: boolean;
}

export function ProfilePhotoSection({
  photoUrl,
  userName,
  onPhotoChange,
  compact = false,
}: ProfilePhotoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoChange(file);
    }
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`flex items-center gap-4 ${compact ? "flex-row" : "flex-col"}`}>
      <div className="relative flex-shrink-0">
        <Avatar className={`border-4 border-white shadow-lg ${compact ? "h-20 w-20" : "h-28 w-28"}`}>
          <AvatarImage src={photoUrl} alt={userName} />
          <AvatarFallback className={`bg-gradient-to-br from-[#0E3E66] to-[#643781] font-semibold text-white ${compact ? "text-xl" : "text-2xl"}`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-[#0E3E66] text-white shadow-md transition-transform hover:scale-105 ${compact ? "h-7 w-7" : "h-9 w-9"}`}
          aria-label="Cambiar foto de perfil"
        >
          <Camera className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {compact ? (
        <div className="flex flex-col">
          <span className="font-semibold text-[#0E3E66]">{userName}</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-[#643781] hover:underline"
          >
            Cambiar foto
          </button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="border-[#0E3E66] text-[#0E3E66] hover:bg-[#0E3E66]/5"
        >
          <Camera className="mr-2 h-4 w-4" />
          Cambiar foto de perfil
        </Button>
      )}
    </div>
  );
}
