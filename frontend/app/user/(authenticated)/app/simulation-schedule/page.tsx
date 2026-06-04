"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Video, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

interface Mentor {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  avatarUrl: string;
}

export default function SimulationSchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Data states
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [modality, setModality] = useState<"virtual" | "presencial">("virtual");

  // UX states
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState("");

  // Min date is tomorrow, max date is 14 days from now
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const future = new Date();
    future.setDate(future.getDate() + 14);
    return future.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.backendJwt) {
      loadMentors();
    }
  }, [status, session]);

  const loadMentors = async () => {
    try {
      setLoadingMentors(true);
      setError("");
      const data = await apiFetch<Mentor[]>("/api/disponibilidad/estudiante/mentores", {}, session?.backendJwt);
      setMentors(data);
      if (data.length > 0) {
        setSelectedMentor(data[0]);
      }
    } catch (err) {
      console.error("Error cargando mentores:", err);
      setError("No se pudieron cargar los mentores disponibles en este momento.");
    } finally {
      setLoadingMentors(false);
    }
  };

  useEffect(() => {
    if (selectedMentor && selectedDate && session?.backendJwt) {
      loadSlots(selectedMentor.idUsuario, selectedDate);
    } else {
      setAvailableSlots([]);
      setSelectedSlot("");
    }
  }, [selectedMentor, selectedDate]);

  const loadSlots = async (mentorId: number, dateStr: string) => {
    try {
      setLoadingSlots(true);
      setSelectedSlot("");
      const data = await apiFetch<string[]>(
        `/api/disponibilidad/estudiante/mentores/${mentorId}/slots?fecha=${dateStr}`,
        {},
        session?.backendJwt
      );
      setAvailableSlots(data);
    } catch (err) {
      console.error("Error cargando slots:", err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedMentor || !selectedDate || !selectedSlot || !session?.backendJwt) {
      alert("Por favor completa todos los campos del formulario.");
      return;
    }

    try {
      setScheduling(true);
      setError("");
      await apiFetch("/api/entrevistas/agendar", {
        method: "POST",
        body: JSON.stringify({
          idMentor: selectedMentor.idUsuario,
          fecha: selectedDate,
          hora: selectedSlot,
          tipo: modality
        })
      }, session?.backendJwt);

      alert("¡Entrevista agendada con éxito! Te hemos enviado un correo de confirmación.");
      router.push("/user/home");
    } catch (err) {
      console.error("Error agendando entrevista:", err);
      setError(err instanceof Error ? err.message : "Error al procesar el agendamiento.");
    } finally {
      setScheduling(false);
    }
  };

  if (status === "loading" || loadingMentors) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#7447D7]" />
          <p className="text-slate-600 font-medium">Buscando mentores disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20 text-slate-900 pb-16 font-sans">
      <main className="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
        
        {/* Back Link */}
        <Link 
          href="/user/home" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#7447D7] transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel principal
        </Link>

        <section className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Agendar Simulación de Entrevista</h1>
          <p className="mt-2 text-slate-600">
            Selecciona a tu mentor de preparación y encuentra el horario que mejor se adapte a ti para tu simulación en vivo.
          </p>
        </section>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        {mentors.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No hay mentores disponibles</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Actualmente ningún PathMentor ha registrado su disponibilidad semanal. Por favor, vuelve a intentar más tarde.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            
            {/* LADO IZQUIERDO: Formulario de Selección */}
            <div className="md:col-span-2 space-y-6">
              
              {/* 1. Seleccionar Mentor */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-black text-[#7447D7]">1</span>
                  Selecciona a tu PathMentor
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {mentors.map((mentor) => (
                    <button
                      key={mentor.idUsuario}
                      onClick={() => setSelectedMentor(mentor)}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition cursor-pointer ${
                        selectedMentor?.idUsuario === mentor.idUsuario
                          ? "border-[#7447D7] bg-purple-50/20 ring-1 ring-purple-100"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <img 
                        src={mentor.avatarUrl || "https://avatar.iran.liara.run/public/boy"} 
                        alt={mentor.nombreCompleto} 
                        className="h-12 w-12 rounded-full object-cover border border-slate-100"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{mentor.nombreCompleto}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{mentor.correo}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Seleccionar Fecha */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-black text-[#7447D7]">2</span>
                  Elige la Fecha
                </h2>
                <div className="max-w-xs relative">
                  <input
                    type="date"
                    min={getMinDate()}
                    max={getMaxDate()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#7447D7] bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* 3. Seleccionar Hora */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-md font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-black text-[#7447D7]">3</span>
                  Selecciona la Hora
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  * Duración estimada de la sesión: 60 minutos.
                </p>

                {!selectedDate ? (
                  <p className="text-sm text-slate-400 font-medium italic">
                    Selecciona una fecha primero para ver los horarios disponibles.
                  </p>
                ) : loadingSlots ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-[#7447D7]" />
                    Cargando horarios disponibles...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-amber-600 font-medium bg-amber-50 border border-amber-100 p-3 rounded-xl">
                    No hay horarios disponibles para esta fecha. Intenta con otro día u otro mentor.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`h-10 rounded-xl border text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          selectedSlot === slot
                            ? "bg-[#7447D7] border-[#7447D7] text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* LADO DERECHO: Resumen e Info de Contacto */}
            <div className="space-y-6">
              
              {/* Resumen */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
                  Resumen de la Cita
                </h3>

                <div className="space-y-4 text-sm mb-6">
                  {selectedMentor && (
                    <div className="flex gap-3">
                      <User className="h-5 w-5 text-slate-400 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-slate-400 block uppercase font-bold">Mentor</span>
                        <span className="font-bold text-slate-700">{selectedMentor.nombreCompleto}</span>
                      </div>
                    </div>
                  )}

                  {selectedDate && (
                    <div className="flex gap-3">
                      <CalendarIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-slate-400 block uppercase font-bold">Fecha</span>
                        <span className="font-bold text-slate-700">{selectedDate}</span>
                      </div>
                    </div>
                  )}

                  {selectedSlot && (
                    <div className="flex gap-3">
                      <Clock className="h-5 w-5 text-slate-400 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-slate-400 block uppercase font-bold">Hora</span>
                        <span className="font-bold text-slate-700">{selectedSlot} hs</span>
                      </div>
                    </div>
                  )}

                  {/* Modality Selector */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400 block uppercase font-bold mb-2">Modalidad</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModality("virtual")}
                        className={`flex-1 h-9 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          modality === "virtual"
                            ? "bg-purple-100 border-[#7447D7]/30 text-[#7447D7]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <Video className="h-3.5 w-3.5" />
                        Virtual
                      </button>
                      <button
                        onClick={() => setModality("presencial")}
                        className={`flex-1 h-9 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          modality === "presencial"
                            ? "bg-purple-100 border-[#7447D7]/30 text-[#7447D7]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Presencial
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  disabled={!selectedMentor || !selectedDate || !selectedSlot || scheduling}
                  onClick={handleSchedule}
                  className="w-full h-11 bg-gradient-to-r from-[#7447D7] to-[#D43EE6] hover:opacity-95 text-white font-bold rounded-xl transition shadow-md shadow-purple-200/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {scheduling ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Agendando...
                    </>
                  ) : (
                    "Confirmar y Agendar"
                  )}
                </button>
              </div>

              {/* Tips de preparación */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6">
                <h4 className="font-bold text-blue-950 text-sm mb-2">Tips de preparación:</h4>
                <ul className="text-xs space-y-2 text-blue-900 leading-relaxed list-disc list-inside">
                  <li>Llega 5 minutos antes a la reunión.</li>
                  <li>Asegúrate de que tu cámara y micrófono funcionen bien.</li>
                  <li>Ten a la mano una copia de tu CV consolidado.</li>
                  <li>Revisa tu perfil de comportamiento DISC antes de la sesión.</li>
                </ul>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
