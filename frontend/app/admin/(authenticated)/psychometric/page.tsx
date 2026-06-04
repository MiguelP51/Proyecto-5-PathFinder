"use client";
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import style from '@/styles/PsychometricConfigPage.module.css';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../../components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../../components/ui/dialog';
import { Brain, Plus, Edit, Trash2, Save, Eye, Settings } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../components/ui/select';

// ─── DTOs ────────────────────────────────────────────────────────────────────

interface OpcionDto {
    textoOpcion: string;
    valorRespuesta: number;
    imagenUrl: string | null;
    ordenOpcion: number;
}

interface CreateQuestionDto {
    enunciado: string;
    categoriaDisc: 'D' | 'I' | 'S' | 'C';
    idTipoPreguntaDisc: number;
    ordenPregunta: number;
    imagenUrl: string | null;
    obligatoria: boolean;
    opciones: OpcionDto[];
}

type UpdateQuestionDto = CreateQuestionDto;

// Mapa de tipo (value local) → idTipoPreguntaDisc en el backend
const TIPO_MAP: Record<string, number> = {
    forced_choice: 1,
    ranking: 1,
    situational: 1,
    image: 2,
    likert: 1,
    seleccion: 1,
    stepped: 1,
};

function buildOpciones(options: string[]): OpcionDto[] {
    return options
        .filter((o) => o.trim() !== '')
        .map((textoOpcion, idx) => ({
            textoOpcion,
            valorRespuesta: idx + 1,
            imagenUrl: null,
            ordenOpcion: idx + 1,
        }));
}

// ─────────────────────────────────────────────────────────────────────────────

const PsychometricConfigPage = () => {
    const { data: session } = useSession();

    const [showQuestionDialog, setShowQuestionDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [showTypeConfigDialog, setShowTypeConfigDialog] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any>(null);
    const [deletingQuestion, setDeletingQuestion] = useState<any>(null);
    const [viewingQuestion, setViewingQuestion] = useState<any>(null);
    const [configuringType, setConfiguringType] = useState<any>(null);
    const [selectedQuestionType, setSelectedQuestionType] = useState('forced_choice');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state (controlled)
    const [formEnunciado, setFormEnunciado] = useState('');
    const [formDimension, setFormDimension] = useState<'D' | 'I' | 'S' | 'C'>('D');
    const [formOpciones, setFormOpciones] = useState<string[]>(['', '', '', '']);

    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const authHeader = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.backendJwt}`,
    });

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/disc/questions', {
                headers: authHeader(),
            });
            if (!res.ok) throw new Error('Error al cargar preguntas');
            const data = await res.json();

            const mapped = data.map((q: any) => ({
                id: q.idPreguntaDisc,
                question: q.enunciado,
                dimension: q.categoriaDisc,
                order: q.orden,
                imageUrl: q.imagenUrl,
                required: q.obligatoria,
                type: q.codigoTipoPregunta?.toLowerCase() ?? 'forced_choice',
                options: q.opciones.map((o: any) => o.textoOpcion),
                active: q.activo,
                optionsQty: q.cantidadOpciones,
            }));

            setQuestions(mapped);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.backendJwt) fetchQuestions();
    }, [session]);

    const dimensionConfig = {
        D: { name: 'Dominancia', color: 'bg-red-100 text-red-700' },
        I: { name: 'Influencia', color: 'bg-yellow-100 text-yellow-700' },
        S: { name: 'Estabilidad', color: 'bg-green-100 text-green-700' },
        C: { name: 'Cumplimiento', color: 'bg-blue-100 text-blue-700' },
    };

    const questionTypes = [
        { value: 'forced_choice', label: 'Matriz de Elección Forzada', description: 'El formato estándar - El usuario debe elegir entre opciones que representan diferentes perfiles DISC', enabled: true, config: { optionsCount: 4, allowMultiple: false, showPercentage: true } },
        { value: 'ranking', label: 'Preguntas de Ordenamiento', description: 'Ranking / Arrastrar y Soltar - El usuario ordena las opciones según su preferencia', enabled: true, config: { optionsCount: 4, dragAndDrop: true, showNumbers: true } },
        { value: 'situational', label: 'Matriz de Juicio Situacional DISC', description: 'Presenta una situación y el usuario elige cómo reaccionaría según su perfil', enabled: true, config: { optionsCount: 4, showContext: true, timeLimit: 90 } },
        { value: 'image', label: 'Preguntas de Selección por Imagen', description: 'Formato Gamificado - El usuario elige entre imágenes que representan comportamientos DISC', enabled: true, config: { optionsCount: 4, imageSize: 'medium', allowedFormats: ['jpg', 'png', 'svg'] } },
        { value: 'likert', label: 'Preguntas de Escala Likert', description: 'Variantes DISC de Escala de Clasificación - El usuario califica afirmaciones del 1 al 5', enabled: true, config: { scalePoints: 5, showLabels: true, labels: ['Totalmente en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Totalmente de acuerdo'] } },
        { value: 'seleccion', label: 'Opción Múltiple Única', description: 'Selección de Perfil Dominante - El usuario elige la opción que más lo representa', enabled: true, config: { optionsCount: 4, showIcons: true, highlightSelection: true } },
        { value: 'stepped', label: 'Opción Múltiple Escalonada o por Bloques', description: 'Preguntas agrupadas por bloques temáticos con opciones relacionadas', enabled: true, config: { optionsCount: 4, blocks: ['Situaciones de trabajo', 'Relaciones interpersonales', 'Ante desafíos'], showProgress: true } },
    ];

    // ── Helpers de diálogo ────────────────────────────────────────────────────

    const openNewQuestion = () => {
        setEditingQuestion(null);
        setFormEnunciado('');
        setFormDimension('D');
        setSelectedQuestionType('forced_choice');
        setFormOpciones(['', '', '', '']);
        setShowQuestionDialog(true);
    };

    const openEditQuestion = (question: any) => {
        setEditingQuestion(question);
        setFormEnunciado(question.question);
        setFormDimension(question.dimension);
        setSelectedQuestionType(question.type || 'forced_choice');
        const opts = [...(question.options ?? [])];
        const size = question.type === 'likert' ? 5 : 4;
        while (opts.length < size) opts.push('');
        setFormOpciones(opts);
        setShowQuestionDialog(true);
    };

    const handleTypeChange = (type: string) => {
        setSelectedQuestionType(type);
        const size = type === 'likert' ? 5 : 4;
        setFormOpciones((prev) => {
            const next = [...prev];
            while (next.length < size) next.push('');
            return next.slice(0, size);
        });
    };

    // ── API calls ─────────────────────────────────────────────────────────────

    const handleSaveQuestion = async () => {
        if (!formEnunciado.trim()) return;
        setIsSaving(true);

        const dto: CreateQuestionDto = {
            enunciado: formEnunciado.trim(),
            categoriaDisc: formDimension,
            idTipoPreguntaDisc: TIPO_MAP[selectedQuestionType] ?? 1,
            ordenPregunta: editingQuestion?.order ?? questions.length + 1,
            imagenUrl: null,
            obligatoria: true,
            opciones: buildOpciones(formOpciones),
        };

        try {
            const url = editingQuestion
                ? `/api/admin/disc/questions/${editingQuestion.id}`
                : '/api/admin/disc/questions';
            const method = editingQuestion ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: authHeader(),
                body: JSON.stringify(dto),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Error ${res.status}`);
            }

            await fetchQuestions();
            setShowQuestionDialog(false);
        } catch (err: any) {
            alert(`Error al guardar: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingQuestion) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/disc/questions/${deletingQuestion.id}`, {
                method: 'DELETE',
                headers: authHeader(),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Error ${res.status}`);
            }
            await fetchQuestions();
            setShowDeleteDialog(false);
            setDeletingQuestion(null);
        } catch (err: any) {
            alert(`Error al eliminar: ${err.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleConfigureType = (type: any) => {
        setConfiguringType(type);
        setShowTypeConfigDialog(true);
    };

    const handleSaveTypeConfig = () => {
        setShowTypeConfigDialog(false);
        setConfiguringType(null);
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Configuración del Test Psicométrico DISC</h1>
                    <p className="text-gray-600">Gestiona las preguntas y configuración del test</p>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" onClick={openNewQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Pregunta
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { icon: <Brain className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-100', value: questions.length, label: 'Total Preguntas' },
                ].map((s, i) => (
                    <Card key={i} className="border border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 ${s.bg} rounded-lg flex items-center justify-center`}>{s.icon}</div>
                                <div>
                                    <div className="text-2xl font-bold">{s.value}</div>
                                    <div className="text-sm text-gray-600">{s.label}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Badge className="bg-green-600">Activas</Badge>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{questions.filter((q) => q.active).length}</div>
                                <div className="text-sm text-gray-600">Preguntas Activas</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="text-2xl font-bold">15 min</div>
                        <div className="text-sm text-gray-600">Tiempo Límite</div>
                    </CardContent>
                </Card>
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <div className="text-2xl font-bold">1,247</div>
                        <div className="text-sm text-gray-600">Evaluaciones Completadas</div>
                    </CardContent>
                </Card>
            </div>

            {/* DISC Dimensions */}
            <Card className="border border-gray-200">
                <CardHeader>
                    <CardTitle>Dimensiones DISC</CardTitle>
                    <CardDescription>Distribución de preguntas por dimensión</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                        {Object.entries(dimensionConfig).map(([key, dim]) => (
                            <div key={key} className="p-4 border border-gray-200 rounded-lg">
                                <Badge className={dim.color}>{key}</Badge>
                                <h3 className="font-semibold mt-2">{dim.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {questions.filter((q) => q.dimension === key).length} preguntas
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Question Types */}
            <Card className="border border-gray-200">
                <CardHeader>
                    <CardTitle>Tipos de Preguntas</CardTitle>
                    <CardDescription>Configura los formatos de pregunta disponibles para el test</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {questionTypes.map((type) => (
                            <div key={type.value} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium">{type.label}</h4>
                                        <Badge variant={type.enabled ? 'default' : 'secondary'} className="text-xs">
                                            {type.enabled ? 'Habilitado' : 'Deshabilitado'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{type.description}</p>
                                    <Badge variant="outline" className="mt-2 border-gray-300">
                                        {questions.filter((q) => q.type === type.value).length} preguntas usando este tipo
                                    </Badge>
                                </div>
                                <Button variant="outline" size="sm" className="border-gray-300" onClick={() => handleConfigureType(type)}>
                                    Configurar
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Questions Table */}
            <Card className="border border-gray-200">
                <CardHeader>
                    <CardTitle>Banco de Preguntas</CardTitle>
                    <CardDescription>Gestiona el conjunto de preguntas del test DISC</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-gray-500 py-4 text-center">Cargando preguntas...</p>
                    ) : error ? (
                        <p className="text-sm text-red-500 py-4 text-center">{error}</p>
                    ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-gray-200">
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Pregunta</TableHead>
                                        <TableHead>Dimensión</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead className="text-center">Opciones</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {questions.map((question) => {
                                        const dim = dimensionConfig[question.dimension as keyof typeof dimensionConfig];
                                        return (
                                            <TableRow key={question.id} className="border-b border-gray-200">
                                                <TableCell className="font-medium">{question.id}</TableCell>
                                                <TableCell className="max-w-md">
                                                    <div className="line-clamp-2">{question.question}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={dim?.color ?? ''}>
                                                        {question.dimension} - {dim?.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs border-gray-300">
                                                        {questionTypes.find((t) => t.value === question.type)?.label || 'Múltiple'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-sm text-gray-600">{question.options.length}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {question.active ? (
                                                        <Badge variant="default">Activa</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Inactiva</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => { setViewingQuestion(question); setShowViewDialog(true); }}>
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => openEditQuestion(question)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => { setDeletingQuestion(question); setShowDeleteDialog(true); }}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* General Config */}
            <Card className="border border-gray-200">
                <CardHeader>
                    <CardTitle>Configuración General</CardTitle>
                    <CardDescription>Parámetros del test psicométrico</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div><Label htmlFor="timeLimit">Tiempo límite (minutos)</Label><Input id="timeLimit" type="number" defaultValue="15" className="border-gray-300" /></div>
                        <div><Label htmlFor="questionsCount">Número de preguntas</Label><Input id="questionsCount" type="number" defaultValue="20" className="border-gray-300" /></div>
                        <div><Label htmlFor="retakeDelay">Período de espera para re-evaluación (días)</Label><Input id="retakeDelay" type="number" defaultValue="90" className="border-gray-300" /></div>
                        <div><Label htmlFor="passingScore">Puntuación mínima (%)</Label><Input id="passingScore" type="number" defaultValue="0" className="border-gray-300" /></div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Configuración
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── Question Dialog (Create / Edit) ─────────────────────────────── */}
            <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}</DialogTitle>
                        <DialogDescription>Configura la pregunta y sus opciones de respuesta</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="question">Pregunta</Label>
                            <Textarea
                                id="question"
                                placeholder="Escribe la pregunta aquí..."
                                value={formEnunciado}
                                onChange={(e) => setFormEnunciado(e.target.value)}
                                rows={3}
                                className="border-gray-300"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="dimension">Dimensión DISC</Label>
                                <Select value={formDimension} onValueChange={(v) => setFormDimension(v as any)}>
                                    <SelectTrigger id="dimension" className="border-gray-300 bg-white text-gray-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200">
                                        <SelectItem value="D">D - Dominancia</SelectItem>
                                        <SelectItem value="I">I - Influencia</SelectItem>
                                        <SelectItem value="S">S - Estabilidad</SelectItem>
                                        <SelectItem value="C">C - Cumplimiento</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="questionType">Tipo de Pregunta</Label>
                                <Select value={selectedQuestionType} onValueChange={handleTypeChange}>
                                    <SelectTrigger id="questionType" className="border-gray-300 bg-white text-gray-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200">
                                        {questionTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">
                                    {questionTypes.find((t) => t.value === selectedQuestionType)?.description}
                                </p>
                            </div>
                        </div>
                        <div>
                            <Label>Opciones de Respuesta</Label>
                            <div className="space-y-2 mt-2">
                                {formOpciones.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                            {i + 1}
                                        </div>
                                        <Input
                                            placeholder={
                                                selectedQuestionType === 'likert'
                                                    ? ['Totalmente en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Totalmente de acuerdo'][i]
                                                    : `Opción ${i + 1}`
                                            }
                                            value={opt}
                                            onChange={(e) => {
                                                const next = [...formOpciones];
                                                next[i] = e.target.value;
                                                setFormOpciones(next);
                                            }}
                                            className="border-gray-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-gray-300" onClick={() => setShowQuestionDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            onClick={handleSaveQuestion}
                            disabled={isSaving || !formEnunciado.trim()}
                        >
                            {isSaving ? 'Guardando...' : editingQuestion ? 'Guardar Cambios' : 'Crear Pregunta'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── View Dialog ──────────────────────────────────────────────────── */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Ver Pregunta Completa</DialogTitle>
                        <DialogDescription>Pregunta #{viewingQuestion?.id}</DialogDescription>
                    </DialogHeader>
                    {viewingQuestion && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-gray-600">Dimensión</Label>
                                <div className="mt-1">
                                    <Badge className={dimensionConfig[viewingQuestion.dimension as keyof typeof dimensionConfig]?.color}>
                                        {viewingQuestion.dimension} - {dimensionConfig[viewingQuestion.dimension as keyof typeof dimensionConfig]?.name}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Tipo de Pregunta</Label>
                                <div className="mt-1">
                                    <Badge variant="outline" className="border-gray-300">
                                        {questionTypes.find((t) => t.value === viewingQuestion.type)?.label || 'Selección Múltiple'}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Pregunta</Label>
                                <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <p className="font-medium">{viewingQuestion.question}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Opciones de Respuesta</Label>
                                <div className="mt-1 space-y-2">
                                    {viewingQuestion.options.map((option: string, index: number) => (
                                        <div key={index} className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <p className="flex-1">{option}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Estado</Label>
                                <div className="mt-1">
                                    {viewingQuestion.active ? <Badge variant="default">Activa</Badge> : <Badge variant="secondary">Inactiva</Badge>}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" className="border-gray-300" onClick={() => setShowViewDialog(false)}>Cerrar</Button>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" onClick={() => { setShowViewDialog(false); openEditQuestion(viewingQuestion); }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Pregunta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ────────────────────────────────────────────────── */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Eliminación</DialogTitle>
                        <DialogDescription>Esta acción no se puede deshacer</DialogDescription>
                    </DialogHeader>
                    {deletingQuestion && (
                        <div className="py-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-800 mb-2">¿Estás seguro de que deseas eliminar esta pregunta?</p>
                                <p className="font-medium text-gray-900 mb-2">"{deletingQuestion.question}"</p>
                                <div className="flex items-center gap-2">
                                    <Badge className={dimensionConfig[deletingQuestion.dimension as keyof typeof dimensionConfig]?.color}>
                                        {deletingQuestion.dimension}
                                    </Badge>
                                    <Badge variant="outline" className="border-gray-300">ID: {deletingQuestion.id}</Badge>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" className="border-gray-300" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
                        <Button variant="destructive" className="bg-gradient-to-r from-red-600 to-red-700 text-white" onClick={handleConfirmDelete} disabled={isDeleting}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeleting ? 'Eliminando...' : 'Sí, Eliminar Pregunta'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Type Config Dialog ───────────────────────────────────────────── */}
            <Dialog open={showTypeConfigDialog} onOpenChange={setShowTypeConfigDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Configurar Tipo de Pregunta</DialogTitle>
                        <DialogDescription>{configuringType?.label}</DialogDescription>
                    </DialogHeader>
                    {configuringType && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div>
                                    <Label className="text-base font-medium">Estado del Tipo</Label>
                                    <p className="text-sm text-gray-600 mt-1">Habilita o deshabilita este formato de pregunta</p>
                                </div>
                                <Button
                                    variant={configuringType.enabled ? 'default' : 'outline'}
                                    size="sm"
                                    className={configuringType.enabled ? '' : 'border-gray-300'}
                                    onClick={() => setConfiguringType({ ...configuringType, enabled: !configuringType.enabled })}
                                >
                                    {configuringType.enabled ? 'Habilitado' : 'Deshabilitado'}
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2"><Settings className="w-4 h-4" />Configuración Específica</h3>

                                {configuringType.value === 'forced_choice' && (
                                    <div className="space-y-4">
                                        <div><Label htmlFor="optionsCount">Número de Opciones</Label><Input id="optionsCount" type="number" defaultValue={configuringType.config.optionsCount} min="2" max="6" className="border-gray-300 mt-1" /></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="showPercentage" defaultChecked={configuringType.config.showPercentage} /><label htmlFor="showPercentage" className="text-sm font-medium">Mostrar porcentaje de respuesta al completar</label></div>
                                    </div>
                                )}
                                {configuringType.value === 'ranking' && (
                                    <div className="space-y-4">
                                        <div><Label>Número de Opciones a Ordenar</Label><Input type="number" defaultValue={configuringType.config.optionsCount} min="3" max="6" className="border-gray-300 mt-1" /></div>
                                        <div className="flex items-center space-x-2"><Checkbox defaultChecked={configuringType.config.dragAndDrop} /><label className="text-sm font-medium">Usar interfaz de arrastrar y soltar</label></div>
                                        <div className="flex items-center space-x-2"><Checkbox defaultChecked={configuringType.config.showNumbers} /><label className="text-sm font-medium">Mostrar números de orden (1, 2, 3, 4)</label></div>
                                    </div>
                                )}
                                {configuringType.value === 'situational' && (
                                    <div className="space-y-4">
                                        <div><Label>Tiempo Límite por Pregunta (segundos)</Label><Input type="number" defaultValue={configuringType.config.timeLimit} min="30" max="300" className="border-gray-300 mt-1" /></div>
                                        <div className="flex items-center space-x-2"><Checkbox defaultChecked={configuringType.config.showContext} /><label className="text-sm font-medium">Mostrar contexto adicional de la situación</label></div>
                                    </div>
                                )}
                                {configuringType.value === 'image' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Tamaño de Imagen</Label>
                                            <Select defaultValue={configuringType.config.imageSize}>
                                                <SelectTrigger className="border-gray-300 bg-white text-gray-900 mt-1"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-white border-gray-200">
                                                    <SelectItem value="small">Pequeño (150x150px)</SelectItem>
                                                    <SelectItem value="medium">Mediano (300x300px)</SelectItem>
                                                    <SelectItem value="large">Grande (500x500px)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Formatos Permitidos</Label>
                                            <div className="mt-2 space-y-2">
                                                {['jpg', 'png', 'svg', 'gif'].map((fmt) => (
                                                    <div key={fmt} className="flex items-center space-x-2">
                                                        <Checkbox id={`fmt-${fmt}`} defaultChecked={configuringType.config.allowedFormats.includes(fmt)} />
                                                        <label htmlFor={`fmt-${fmt}`} className="text-sm">{fmt.toUpperCase()}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {configuringType.value === 'likert' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Puntos en la Escala</Label>
                                            <Select defaultValue={String(configuringType.config.scalePoints)}>
                                                <SelectTrigger className="border-gray-300 bg-white text-gray-900 mt-1"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-white border-gray-200">
                                                    <SelectItem value="3">3 puntos</SelectItem>
                                                    <SelectItem value="5">5 puntos (recomendado)</SelectItem>
                                                    <SelectItem value="7">7 puntos</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center space-x-2"><Checkbox defaultChecked={configuringType.config.showLabels} /><label className="text-sm font-medium">Mostrar etiquetas textuales en la escala</label></div>
                                        <div>
                                            <Label>Etiquetas de la Escala</Label>
                                            <div className="mt-2 space-y-2">
                                                {configuringType.config.labels.map((label: string, idx: number) => (
                                                    <Input key={idx} placeholder={`Etiqueta ${idx + 1}`} defaultValue={label} className="border-gray-300" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {configuringType.value === 'stepped' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Bloques Temáticos</Label>
                                            <div className="mt-2 space-y-2">
                                                {configuringType.config.blocks.map((block: string, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <Input placeholder={`Bloque ${idx + 1}`} defaultValue={block} className="border-gray-300" />
                                                        <Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" className="w-full border-gray-300"><Plus className="w-4 h-4 mr-2" />Agregar Bloque</Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2"><Checkbox defaultChecked={configuringType.config.showProgress} /><label className="text-sm font-medium">Mostrar barra de progreso entre bloques</label></div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Nota:</strong> Los cambios afectarán solo a las nuevas preguntas creadas con este tipo.
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" className="border-gray-300" onClick={() => setShowTypeConfigDialog(false)}>Cancelar</Button>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" onClick={handleSaveTypeConfig}>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Configuración
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PsychometricConfigPage;