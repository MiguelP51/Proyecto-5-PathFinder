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
  linkedinUrl?: string | null;
  perfilProfesional?: string | null;
  celular?: string | null;
  correoContacto?: string | null;
  calificacionPromedio?: number | null;
  totalEvaluaciones?: number | null;
}

interface HolidayDTO {
  fecha: string;
  descripcion: string;
}

const PRESET_ROLES = [
  "Analista de RRHH",
  "Analista de Marketing",
  "Analista Financiero",
  "Consultor de Negocios"
];

export default function SimulationSchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Data states
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedRoleType, setSelectedRoleType] = useState<string>("");

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

  // Mentor profile modal states
  const [showMentorProfileModal, setShowMentorProfileModal] = useState(false);
  const [mentorProfileDetails, setMentorProfileDetails] = useState<any>(null);
  const [loadingProfileDetails, setLoadingProfileDetails] = useState(false);

  const handleVerPerfilCompleto = async (mentorId: number) => {
    try {
      setLoadingProfileDetails(true);
      setShowMentorProfileModal(true);
      const res = await apiFetch<any>(`/api/mentor/profile/${mentorId}`, {}, session?.backendJwt);
      setMentorProfileDetails(res);
    } catch (err) {
      console.error("Error cargando perfil completo del mentor:", err);
      toast.error("No se pudo cargar el perfil detallado del mentor.");
      setShowMentorProfileModal(false);
    } finally {
      setLoadingProfileDetails(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const formatSpanishDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      const formatted = date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
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
            const interest = profile.interesesProfesionales.trim();
            setPuestoInteres(interest);
            if (PRESET_ROLES.includes(interest)) {
              setSelectedRoleType(interest);
            } else if (interest !== "") {
              setSelectedRoleType("Otros");
            }
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

    if (!puestoInteres || !puestoInteres.trim()) {
      toast.warning("Por favor ingresa el puesto al que postulas.");
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
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition cursor-pointer ${selectedMentor?.idUsuario === mentor.idUsuario
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
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                          {mentor.calificacionPromedio !== undefined && mentor.calificacionPromedio !== null && mentor.calificacionPromedio > 0 ? (
                            <>
                              <span className="text-amber-500 font-bold">★ {mentor.calificacionPromedio.toFixed(1)}</span>
                              <span className="text-slate-400 font-medium">({mentor.totalEvaluaciones || 0} {mentor.totalEvaluaciones === 1 ? 'evaluación' : 'evaluaciones'})</span>
                            </>
                          ) : (
                            <span className="text-slate-400 font-medium">★ -- (Sin evaluaciones)</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedMentor && (selectedMentor.perfilProfesional || selectedMentor.linkedinUrl || selectedMentor.correoContacto || selectedMentor.celular) && (
                  <div className="mt-6 p-4 rounded-xl bg-purple-50/30 border border-purple-100/50 space-y-3 animate-fade-in">
                    <h4 className="text-xs font-bold text-[#7447D7] uppercase tracking-wider">Acerca del PathMentor</h4>
                    {selectedMentor.perfilProfesional && (
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        &ldquo;{selectedMentor.perfilProfesional}&rdquo;
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 pt-2 border-t border-purple-100/30">
                      {selectedMentor.linkedinUrl && (
                        <a
                          href={selectedMentor.linkedinUrl.startsWith("http") ? selectedMentor.linkedinUrl : `https://${selectedMentor.linkedinUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#0077B5] hover:underline font-semibold"
                        >
                          <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                          LinkedIn
                        </a>
                      )}
                      {selectedMentor.correoContacto && (
                        <span>📧 {selectedMentor.correoContacto}</span>
                      )}
                      {selectedMentor.celular && (
                        <span>📞 {selectedMentor.celular}</span>
                      )}
                    </div>
                    <div className="pt-2 border-t border-purple-100/30">
                      <button
                        type="button"
                        onClick={() => handleVerPerfilCompleto(selectedMentor.idUsuario)}
                        className="text-xs font-bold text-[#7447D7] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Ver perfil completo →
                      </button>
                    </div>
                  </div>
                )}
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
                                    className={`h-9 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${isSelected
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
                        className={`flex-1 h-9 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${modality === "virtual"
                          ? "bg-purple-100 border-[#7447D7]/30 text-[#7447D7]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                      >
                        <Video className="h-3.5 w-3.5" />
                        Virtual
                      </button>
                      <button
                        onClick={() => setModality("presencial")}
                        className={`flex-1 h-9 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${modality === "presencial"
                          ? "bg-purple-100 border-[#7447D7]/30 text-[#7447D7]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Presencial
                      </button>
                    </div>
                    {modality === "presencial" && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                        💡 <strong>Coordinación Presencial:</strong> Deberás ponerte en contacto con tu mentor por correo electrónico ({selectedMentor?.correo || "correo de contacto"}) para coordinar el lugar de encuentro.
                      </div>
                    )}
                  </div>

                  {/* Position Selector */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-xs text-slate-400 block uppercase font-bold">Puesto al que Postulas</span>
                    
                    {/* Chips Navbar */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {PRESET_ROLES.map((role) => {
                        const isSelected = selectedRoleType === role;
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              setSelectedRoleType(role);
                              setPuestoInteres(role);
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "bg-gradient-to-r from-[#7447D7] to-[#D43EE6] border-purple-400 text-white shadow-sm shadow-purple-100/50"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350"
                            }`}
                          >
                            {role}
                          </button>
                        );
                      })}
                      
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRoleType("Otros");
                          if (PRESET_ROLES.includes(puestoInteres)) {
                            setPuestoInteres("");
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                          selectedRoleType === "Otros"
                            ? "bg-gradient-to-r from-[#7447D7] to-[#D43EE6] border-purple-400 text-white shadow-sm shadow-purple-100/50"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350"
                        }`}
                      >
                        Otros
                      </button>
                    </div>

                    {/* Manual Text Input (only shown when 'Otros' is selected) */}
                    {selectedRoleType === "Otros" && (
                      <div className="pt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <input
                          type="text"
                          placeholder="Escribe el puesto manualmente..."
                          value={puestoInteres}
                          onChange={(e) => setPuestoInteres(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#7447D7] bg-white text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  disabled={!selectedMentor || !selectedDate || !selectedSlot || !puestoInteres.trim() || scheduling}
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

      {/* MODAL: PERFIL COMPLETO DE MENTOR */}
      {showMentorProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 flex flex-col p-6 relative">

            {/* Close Button */}
            <button
              type="button"
              onClick={() => { setShowMentorProfileModal(false); setMentorProfileDetails(null); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {loadingProfileDetails ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#7447D7]" />
                <p className="text-slate-500 text-xs font-semibold">Cargando perfil completo...</p>
              </div>
            ) : mentorProfileDetails ? (
              <div className="space-y-6">

                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <img
                    src={mentorProfileDetails.avatarUrl || "https://avatar.iran.liara.run/public/boy"}
                    alt={mentorProfileDetails.nombreCompleto}
                    className="h-20 w-20 rounded-full object-cover border-2 border-purple-100 shadow-sm"
                  />
                  <div className="text-center sm:text-left space-y-1">
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                      {mentorProfileDetails.nombreCompleto}
                    </h3>
                    {mentorProfileDetails.titulo && (
                      <p className="text-sm font-bold text-[#7447D7] dark:text-purple-400">
                        {mentorProfileDetails.titulo}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-400 font-semibold pt-1">
                      {mentorProfileDetails.ubicacion && <span>📍 {mentorProfileDetails.ubicacion}</span>}
                      <span>✉️ {mentorProfileDetails.correo}</span>
                      {mentorProfileDetails.telefono && <span>📞 {mentorProfileDetails.telefono}</span>}
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                {mentorProfileDetails.metrics && (
                  <div className="grid grid-cols-3 gap-3 bg-purple-50/20 dark:bg-purple-950/10 p-4 rounded-2xl border border-purple-100/30 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase block">Entrevistas</span>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-200">{mentorProfileDetails.metrics.totalEntrevistas}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase block">Aprobación</span>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-200">{mentorProfileDetails.metrics.tasaAprobacion}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase block">Calificación</span>
                      <div className="flex items-center justify-center gap-1 mt-0.5 text-amber-500">
                        <span className="text-sm font-black">{mentorProfileDetails.metrics.calificacionPromedio}</span>
                        <span>★</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Sections */}
                <div className="space-y-5 text-slate-700 dark:text-slate-300">

                  {mentorProfileDetails.bio && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Biografía</h4>
                      <p className="text-xs leading-relaxed font-semibold italic bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        &ldquo;{mentorProfileDetails.bio}&rdquo;
                      </p>
                    </div>
                  )}

                  {mentorProfileDetails.especialidades && mentorProfileDetails.especialidades.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Especialidades</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {mentorProfileDetails.especialidades.map((esp: string) => (
                          <span key={esp} className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-[#7447D7] dark:text-purple-400 text-[10px] font-bold border border-purple-100/30">
                            {esp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {mentorProfileDetails.areasExpertise && mentorProfileDetails.areasExpertise.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Áreas de Expertise</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {mentorProfileDetails.areasExpertise.map((area: any) => (
                          <div key={area.id || area.nombre} className="bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-[11px] font-semibold space-y-1.5">
                            <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                              <span>{area.nombre}</span>
                              <span className="text-[#7447D7] dark:text-purple-400">{area.aniosExperiencia} años</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#7447D7] to-[#D43EE6] rounded-full" style={{ width: `${Math.min(100, (area.aniosExperiencia / 15) * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mentorProfileDetails.certificaciones && mentorProfileDetails.certificaciones.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certificaciones</h4>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {mentorProfileDetails.certificaciones.map((cert: any) => (
                          <div key={cert.id || cert.titulo} className="flex justify-between items-center text-xs font-semibold p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10">
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">{cert.titulo}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{cert.emisor}</div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-extrabold">{cert.anio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mentorProfileDetails.linkedinUrl && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <a
                        href={mentorProfileDetails.linkedinUrl.startsWith("http") ? mentorProfileDetails.linkedinUrl : `https://${mentorProfileDetails.linkedinUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0077B5] hover:bg-[#006396] text-white text-xs font-bold shadow-sm transition"
                      >
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        Ver Perfil de LinkedIn
                      </a>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">No se pudo recuperar el perfil del mentor.</div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setShowMentorProfileModal(false); setMentorProfileDetails(null); }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
