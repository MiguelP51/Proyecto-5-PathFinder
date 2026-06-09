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
import { toast } from "sonner";

interface Mentor {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  avatarUrl: string;
}

interface HolidayDTO {
  fecha: string;
  descripcion: string;
}

export default function SimulationSchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Data states
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  
  // Date range states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rangeSlots, setRangeSlots] = useState<{ [date: string]: string[] }>({});
  
  // Selected single slot states (populated on clicking a slot button)
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [modality, setModality] = useState<"virtual" | "presencial">("virtual");
  const [puestoInteres, setPuestoInteres] = useState("");

  // Holiday states
  const [holidays, setHolidays] = useState<string[]>([]);
  const [holidayMap, setHolidayMap] = useState<{ [date: string]: string }>({});

  // UX states
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const formatSpanishDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const validateDates = (start: string, end: string): boolean => {
    if (!start || !end) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startD = new Date(start + "T00:00:00");
    const endD = new Date(end + "T00:00:00");

    const maxD = new Date();
    maxD.setDate(today.getDate() + 365);
    maxD.setHours(23, 59, 59, 999);

    if (startD > maxD || endD > maxD) {
      toast.warning("No es viable programar citas con más de un año de anticipación.");
      return false;
    }
    
    if (endD < startD) {
      toast.warning("La fecha fin no puede ser anterior a la fecha inicio.");
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.backendJwt) {
      const params = new URLSearchParams(window.location.search);
      const mentorIdParam = params.get("mentorId");
      if (mentorIdParam) {
        setIsRescheduling(true);
      }
      
      loadMentors(mentorIdParam);
      loadHolidays();

      // Fetch profile to pre-fill the practicing role
      apiFetch<any>("/api/profile", {}, session.backendJwt)
        .then(profile => {
          if (profile && profile.interesesProfesionales) {
            setPuestoInteres(profile.interesesProfesionales);
          }
        })
        .catch(err => console.log("Error loading profile interests:", err));

      // Default range: tomorrow until 7 days later
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startStr = tomorrow.toISOString().split("T")[0];

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const endStr = nextWeek.toISOString().split("T")[0];

      setStartDate(startStr);
      setEndDate(endStr);
    }
  }, [status, session]);

  const loadMentors = async (mentorIdParam?: string | null) => {
    try {
      setLoadingMentors(true);
      setError("");
      const data = await apiFetch<Mentor[]>("/api/disponibilidad/estudiante/mentores", {}, session?.backendJwt);
      
      if (mentorIdParam) {
        const parsedId = parseInt(mentorIdParam);
        const filtered = data.filter(m => m.idUsuario === parsedId);
        setMentors(filtered);
        if (filtered.length > 0) {
          setSelectedMentor(filtered[0]);
        }
      } else {
        setMentors(data);
        if (data.length > 0) {
          setSelectedMentor(data[0]);
        }
      }
    } catch (err) {
      console.error("Error cargando mentores:", err);
      setError("No se pudieron cargar los mentores disponibles en este momento.");
    } finally {
      setLoadingMentors(false);
    }
  };

  const loadHolidays = async () => {
    try {
      const data = await apiFetch<HolidayDTO[]>("/api/feriados", {}, session?.backendJwt);
      const dates = data.map(h => h.fecha);
      const mapping: { [date: string]: string } = {};
      data.forEach(h => {
        mapping[h.fecha] = h.descripcion;
      });
      setHolidays(dates);
      setHolidayMap(mapping);
    } catch (err) {
      console.error("Error cargando feriados:", err);
    }
  };

  useEffect(() => {
    if (selectedMentor && startDate && endDate && session?.backendJwt) {
      loadSlotsForRange(selectedMentor.idUsuario, startDate, endDate);
    } else {
      setRangeSlots({});
    }
  }, [selectedMentor, startDate, endDate]);

  const loadSlotsForRange = async (mentorId: number, start: string, end: string) => {
    if (!validateDates(start, end)) {
      setRangeSlots({});
      return;
    }

    try {
      setLoadingSlots(true);
      setError("");

      const startLocalDate = new Date(start + "T00:00:00");
      const endLocalDate = new Date(end + "T00:00:00");
      const diffTime = Math.abs(endLocalDate.getTime() - startLocalDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 30) {
        toast.warning("El rango de fechas no puede ser mayor a 30 días.");
        setRangeSlots({});
        return;
      }

      const dateList: string[] = [];
      for (let i = 0; i < diffDays; i++) {
        const currentDate = new Date(startLocalDate);
        currentDate.setDate(startLocalDate.getDate() + i);
        dateList.push(currentDate.toISOString().split("T")[0]);
      }

      const newRangeSlots: { [date: string]: string[] } = {};

      await Promise.all(
        dateList.map(async (dateStr) => {
          try {
            const data = await apiFetch<string[]>(
              `/api/disponibilidad/estudiante/mentores/${mentorId}/slots?fecha=${dateStr}`,
              {},
              session?.backendJwt
            );
            if (data && data.length > 0) {
              newRangeSlots[dateStr] = data;
            }
          } catch (err) {
            console.error(`Error loading slots for ${dateStr}:`, err);
          }
        })
      );

      setRangeSlots(newRangeSlots);
    } catch (err) {
      console.error("Error loading range slots:", err);
      setRangeSlots({});
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedMentor || !selectedDate || !selectedSlot || !session?.backendJwt) {
      toast.warning("Por favor completa todos los campos del formulario.");
      return;
    }

    if (holidays.includes(selectedDate)) {
      toast.warning("La fecha seleccionada es feriado nacional. No se puede programar en este día.");
      return;
    }

    try {
      setScheduling(true);
      setError("");
      const response = await apiFetch<{ emailEnviado?: boolean }>("/api/entrevistas/agendar", {
        method: "POST",
        body: JSON.stringify({
          idMentor: selectedMentor.idUsuario,
          fecha: selectedDate,
          hora: selectedSlot,
          tipo: modality,
          puesto: puestoInteres
        })
      }, session?.backendJwt);

      if (response && response.emailEnviado === false) {
        toast.warning("¡Entrevista agendada! Sin embargo, no se pudo enviar el correo de confirmación por un problema técnico temporal.");
      } else {
        toast.success("¡Entrevista agendada con éxito! Te hemos enviado un correo de confirmación.");
      }
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
                {isRescheduling && (
                  <p className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-100 p-3 rounded-xl mb-4">
                    ⚠️ Estás reagendando tu cita. Solo puedes agendar con tu mentor original.
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {mentors.map((mentor) => (
                    <button
                      key={mentor.idUsuario}
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setSelectedDate("");
                        setSelectedSlot("");
                      }}
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

              {/* 2. Seleccionar Rango de Fechas */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-black text-[#7447D7]">2</span>
                  Rango de Fechas
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block uppercase">Desde</label>
                    <input
                      type="date"
                      min={getMinDate()}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setSelectedDate("");
                        setSelectedSlot("");
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#7447D7] bg-white text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block uppercase">Hasta</label>
                    <input
                      type="date"
                      min={startDate || getMinDate()}
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setSelectedDate("");
                        setSelectedSlot("");
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#7447D7] bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Seleccionar Hora */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-md font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-black text-[#7447D7]">3</span>
                  Selecciona la Fecha y Hora
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  * Selecciona uno de los horarios libres en el rango indicado. Duración de la sesión: 60 minutos.
                </p>

                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-[#7447D7]" />
                    Cargando horarios disponibles en el rango...
                  </div>
                ) : Object.keys(rangeSlots).length === 0 ? (
                  <p className="text-sm text-amber-600 font-medium bg-amber-50 border border-amber-100 p-3 rounded-xl">
                    No hay horarios disponibles en este rango de fechas. Intenta con otras fechas u otro mentor.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                    {Object.keys(rangeSlots).sort().map((dateStr) => {
                      const slots = rangeSlots[dateStr];
                      const isHolidayDate = holidays.includes(dateStr);
                      const holidayDesc = holidayMap[dateStr];
                      
                      return (
                        <div key={dateStr} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                          <h4 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-2">
                            📅 {formatSpanishDate(dateStr)}
                            {isHolidayDate && (
                              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                Feriado: {holidayDesc}
                              </span>
                            )}
                          </h4>
                          
                          {isHolidayDate ? (
                            <p className="text-xs text-red-500 italic">Día no laborable por feriado.</p>
                          ) : (
                            <div className="grid grid-cols-4 gap-2">
                              {slots.map((slot) => {
                                const isSelected = selectedDate === dateStr && selectedSlot === slot;
                                return (
                                  <button
                                    key={slot}
                                    onClick={() => {
                                      setSelectedDate(dateStr);
                                      setSelectedSlot(slot);
                                    }}
                                    className={`h-9 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                      isSelected
                                        ? "bg-[#7447D7] border-[#7447D7] text-white"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                    }`}
                                  >
                                    <Clock className="h-3 w-3" />
                                    {slot}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
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

                  {/* Position Input */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-xs text-slate-400 block uppercase font-bold">Puesto al que Postulas</span>
                    <input
                      type="text"
                      placeholder="Ej: UX/UI Designer, Backend Dev"
                      value={puestoInteres}
                      onChange={(e) => setPuestoInteres(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#7447D7] bg-white text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    />
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
