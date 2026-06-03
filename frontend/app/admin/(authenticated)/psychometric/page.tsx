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

const PsychometricConfigPage = () =>  {
    const { data: session, status } = useSession();
    const [showQuestionDialog, setShowQuestionDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [showTypeConfigDialog, setShowTypeConfigDialog] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any>(null);
    const [deletingQuestion, setDeletingQuestion] = useState<any>(null);
    const [viewingQuestion, setViewingQuestion] = useState<any>(null);
    const [configuringType, setConfiguringType] = useState<any>(null);
    const [selectedQuestionType, setSelectedQuestionType] = useState('forced_choice');

    const [questions, setQuestions] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/disc/questions', {
        headers: {
          'Authorization': `Bearer ${session?.backendJwt}`, // <- reemplaza con tu JWT
        },
      });
      if (!res.ok) throw new Error('Error fetching questions');
      const data = await res.json();

      const mapped = data.map((q: any) => ({
        id: q.idPreguntaDisc,
        question: q.enunciado,
        dimension: q.categoriaDisc,
        order: q.orden,
        imageUrl: q.imagenUrl,
        required: q.obligatoria,
        type: q.codigoTipoPregunta.toLowerCase(),
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

  fetchQuestions();
}, []);

    const dimensionConfig = {
        D: { name: 'Dominancia', color: 'bg-red-100 text-red-700' },
        I: { name: 'Influencia', color: 'bg-yellow-100 text-yellow-700' },
        S: { name: 'Estabilidad', color: 'bg-green-100 text-green-700' },
        C: { name: 'Cumplimiento', color: 'bg-blue-100 text-blue-700' },
    };

    const handleEditQuestion = (question: any) => {
        setEditingQuestion(question);
        setSelectedQuestionType(question.type || 'forced_choice');
        setShowQuestionDialog(true);
    };

    const handleNewQuestion = () => {
        setEditingQuestion(null);
        setSelectedQuestionType('forced_choice');
        setShowQuestionDialog(true);
    };

    const handleViewQuestion = (question: any) => {
        setViewingQuestion(question);
        setShowViewDialog(true);
    };

    const handleDeleteClick = (question: any) => {
        setDeletingQuestion(question);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        console.log('Eliminando pregunta:', deletingQuestion);
        setShowDeleteDialog(false);
        setDeletingQuestion(null);
    };

    const handleConfigureType = (type: any) => {
        setConfiguringType(type);
        setShowTypeConfigDialog(true);
    };

    const handleSaveTypeConfig = () => {
        console.log('Guardando configuración del tipo:', configuringType);
        setShowTypeConfigDialog(false);
        setConfiguringType(null);
    };

    const questionTypes = [
        {
            value: 'forced_choice',
            label: 'Matriz de Elección Forzada',
            description: 'El formato estándar - El usuario debe elegir entre opciones que representan diferentes perfiles DISC',
            enabled: true,
            config: {
                optionsCount: 4,
                allowMultiple: false,
                showPercentage: true,
            }
        },
        {
            value: 'ranking',
            label: 'Preguntas de Ordenamiento',
            description: 'Ranking / Arrastrar y Soltar - El usuario ordena las opciones según su preferencia',
            enabled: true,
            config: {
                optionsCount: 4,
                dragAndDrop: true,
                showNumbers: true,
            }
        },
        {
            value: 'situational',
            label: 'Matriz de Juicio Situacional DISC',
            description: 'Presenta una situación y el usuario elige cómo reaccionaría según su perfil',
            enabled: true,
            config: {
                optionsCount: 4,
                showContext: true,
                timeLimit: 90,
            }
        },
        {
            value: 'image',
            label: 'Preguntas de Selección por Imagen',
            description: 'Formato Gamificado - El usuario elige entre imágenes que representan comportamientos DISC',
            enabled: true,
            config: {
                optionsCount: 4,
                imageSize: 'medium',
                allowedFormats: ['jpg', 'png', 'svg'],
            }
        },
        {
            value: 'likert',
            label: 'Preguntas de Escala Likert',
            description: 'Variantes DISC de Escala de Clasificación - El usuario califica afirmaciones del 1 al 5',
            enabled: true,
            config: {
                scalePoints: 5,
                showLabels: true,
                labels: ['Totalmente en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Totalmente de acuerdo'],
            }
        },
        {
            value: 'single_choice',
            label: 'Opción Múltiple Única',
            description: 'Selección de Perfil Dominante - El usuario elige la opción que más lo representa',
            enabled: true,
            config: {
                optionsCount: 4,
                showIcons: true,
                highlightSelection: true,
            }
        },
        {
            value: 'stepped',
            label: 'Opción Múltiple Escalonada o por Bloques',
            description: 'Preguntas agrupadas por bloques temáticos con opciones relacionadas',
            enabled: true,
            config: {
                optionsCount: 4,
                blocks: ['Situaciones de trabajo', 'Relaciones interpersonales', 'Ante desafíos'],
                showProgress: true,
            }
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Configuración del Test Psicométrico DISC</h1>
                    <p className="text-gray-600">Gestiona las preguntas y configuración del test</p>
                </div>
                <Button
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                    onClick={handleNewQuestion}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Pregunta
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Brain className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{questions.length}</div>
                                <div className="text-sm text-gray-600">Total Preguntas</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Badge className="bg-green-600">Activas</Badge>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {questions.filter((q) => q.active).length}
                                </div>
                                <div className="text-sm text-gray-600">Preguntas Activas</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div>
                            <div className="text-2xl font-bold">15 min</div>
                            <div className="text-sm text-gray-600">Tiempo Límite</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div>
                            <div className="text-2xl font-bold">1,247</div>
                            <div className="text-sm text-gray-600">Evaluaciones Completadas</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* DISC Dimensions Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Dimensiones DISC</CardTitle>
                    <CardDescription>Distribución de preguntas por dimensión</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                        {Object.entries(dimensionConfig).map(([key, dim]) => (
                            <div key={key} className="p-4 border rounded-lg">
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

            {/* Question Types Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Tipos de Preguntas</CardTitle>
                    <CardDescription>Configura los formatos de pregunta disponibles para el test</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {questionTypes.map((type) => (
                            <div key={type.value} className="flex items-start justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium">{type.label}</h4>
                                        {type.enabled ? (
                                            <Badge variant="default" className="text-xs">Habilitado</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-xs">Deshabilitado</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{type.description}</p>
                                    <Badge variant="outline" className="mt-2">
                                        {questions.filter((q) => q.type === type.value).length} preguntas usando este tipo
                                    </Badge>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleConfigureType(type)}
                                >
                                    Configurar
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Questions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Banco de Preguntas</CardTitle>
                    <CardDescription>Gestiona el conjunto de preguntas del test DISC</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
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
                                        <TableRow key={question.id}>
                                            <TableCell className="font-medium">{question.id}</TableCell>
                                            <TableCell className="max-w-md">
                                                <div className="line-clamp-2">{question.question}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={dim.color}>
                                                    {question.dimension} - {dim.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
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
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewQuestion(question)}
                                                        title="Ver pregunta completa"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditQuestion(question)}
                                                        title="Editar pregunta"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteClick(question)}
                                                        title="Eliminar pregunta"
                                                    >
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
                </CardContent>
            </Card>

            {/* Test Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Configuración General</CardTitle>
                    <CardDescription>Parámetros del test psicométrico</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="timeLimit">Tiempo límite (minutos)</Label>
                            <Input id="timeLimit" type="number" defaultValue="15" />
                        </div>
                        <div>
                            <Label htmlFor="questionsCount">Número de preguntas</Label>
                            <Input id="questionsCount" type="number" defaultValue="20" />
                        </div>
                        <div>
                            <Label htmlFor="retakeDelay">Período de espera para re-evaluación (días)</Label>
                            <Input id="retakeDelay" type="number" defaultValue="90" />
                        </div>
                        <div>
                            <Label htmlFor="passingScore">Puntuación mínima (%)</Label>
                            <Input id="passingScore" type="number" defaultValue="0" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Configuración
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Question Dialog */}
            <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
                        </DialogTitle>
                        <DialogDescription>
                            Configura la pregunta y sus opciones de respuesta
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="question">Pregunta</Label>
                            <Textarea
                                id="question"
                                placeholder="Escribe la pregunta aquí..."
                                defaultValue={editingQuestion?.question}
                                rows={3}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="dimension">Dimensión DISC</Label>
                                <Select defaultValue={editingQuestion?.dimension || 'D'}>
                                    <SelectTrigger id="dimension">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="D">D - Dominancia</SelectItem>
                                        <SelectItem value="I">I - Influencia</SelectItem>
                                        <SelectItem value="S">S - Estabilidad</SelectItem>
                                        <SelectItem value="C">C - Cumplimiento</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="questionType">Tipo de Pregunta</Label>
                                <Select
                                    value={selectedQuestionType}
                                    onValueChange={setSelectedQuestionType}
                                >
                                    <SelectTrigger id="questionType">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {questionTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
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
                                {Array.from({ length: selectedQuestionType === 'likert' ? 5 : 4 }, (_, i) => i + 1).map((i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                            {i}
                                        </div>
                                        <Input
                                            placeholder={
                                                selectedQuestionType === 'likert'
                                                    ? i === 1
                                                        ? 'Totalmente en desacuerdo'
                                                        : i === 2
                                                            ? 'En desacuerdo'
                                                            : i === 3
                                                                ? 'Neutral'
                                                                : i === 4
                                                                    ? 'De acuerdo'
                                                                    : 'Totalmente de acuerdo'
                                                    : `Opción ${i}`
                                            }
                                            defaultValue={editingQuestion?.options?.[i - 1]}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {selectedQuestionType === 'likert'
                                    ? 'Escala Likert usa 5 opciones (1-5)'
                                    : selectedQuestionType === 'ranking'
                                        ? 'El usuario ordenará estas opciones según su preferencia'
                                        : selectedQuestionType === 'situational'
                                            ? 'Presenta una situación y las posibles reacciones'
                                            : selectedQuestionType === 'image'
                                                ? 'Cada opción debe describir la imagen a mostrar'
                                                : 'Define las opciones entre las que el usuario puede elegir'}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
                            Cancelar
                        </Button>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                            {editingQuestion ? 'Guardar Cambios' : 'Crear Pregunta'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Question Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Ver Pregunta Completa</DialogTitle>
                        <DialogDescription>
                            Pregunta #{viewingQuestion?.id}
                        </DialogDescription>
                    </DialogHeader>
                    {viewingQuestion && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-gray-600">Dimensión</Label>
                                <div className="mt-1">
                                    <Badge className={dimensionConfig[viewingQuestion.dimension as keyof typeof dimensionConfig].color}>
                                        {viewingQuestion.dimension} - {dimensionConfig[viewingQuestion.dimension as keyof typeof dimensionConfig].name}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Tipo de Pregunta</Label>
                                <div className="mt-1">
                                    <Badge variant="outline">
                                        {questionTypes.find((t) => t.value === viewingQuestion.type)?.label || 'Selección Múltiple'}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Pregunta</Label>
                                <div className="mt-1 p-3 bg-gray-50 border rounded-lg">
                                    <p className="font-medium">{viewingQuestion.question}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Opciones de Respuesta</Label>
                                <div className="mt-1 space-y-2">
                                    {viewingQuestion.options.map((option: string, index: number) => (
                                        <div key={index} className="flex items-start gap-2 p-3 border rounded-lg">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <p className="flex-1">{option}</p>
                                        </div>
                                    ))}
                                </div>
                                {viewingQuestion.type === 'ranking' && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        El estudiante debe ordenar estas opciones según su preferencia
                                    </p>
                                )}
                                {viewingQuestion.type === 'likert' && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Escala Likert: El estudiante califica esta afirmación del 1 al 5
                                    </p>
                                )}
                                {viewingQuestion.type === 'situational' && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Juicio situacional: El estudiante elige cómo reaccionaría en esta situación
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label className="text-gray-600">Estado</Label>
                                <div className="mt-1">
                                    {viewingQuestion.active ? (
                                        <Badge variant="default">Activa</Badge>
                                    ) : (
                                        <Badge variant="secondary">Inactiva</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                            Cerrar
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                            onClick={() => {
                                setShowViewDialog(false);
                                handleEditQuestion(viewingQuestion);
                            }}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Pregunta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Eliminación</DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer
                        </DialogDescription>
                    </DialogHeader>
                    {deletingQuestion && (
                        <div className="py-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-800 mb-2">
                                    ¿Estás seguro de que deseas eliminar esta pregunta?
                                </p>
                                <p className="font-medium text-gray-900 mb-2">
                                    "{deletingQuestion.question}"
                                </p>
                                <div className="flex items-center gap-2">
                                    <Badge className={dimensionConfig[deletingQuestion.dimension as keyof typeof dimensionConfig].color}>
                                        {deletingQuestion.dimension}
                                    </Badge>
                                    <Badge variant="outline">
                                        ID: {deletingQuestion.id}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sí, Eliminar Pregunta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Question Type Configuration Dialog */}
            <Dialog open={showTypeConfigDialog} onOpenChange={setShowTypeConfigDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Configurar Tipo de Pregunta</DialogTitle>
                        <DialogDescription>
                            {configuringType?.label}
                        </DialogDescription>
                    </DialogHeader>
                    {configuringType && (
                        <div className="space-y-6">
                            {/* Enable/Disable Type */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <Label className="text-base font-medium">Estado del Tipo</Label>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Habilita o deshabilita este formato de pregunta
                                    </p>
                                </div>
                                <Button
                                    variant={configuringType.enabled ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setConfiguringType({
                                            ...configuringType,
                                            enabled: !configuringType.enabled,
                                        });
                                    }}
                                >
                                    {configuringType.enabled ? 'Habilitado' : 'Deshabilitado'}
                                </Button>
                            </div>

                            {/* Type-specific configurations */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Configuración Específica
                                </h3>

                                {/* Forced Choice Config */}
                                {configuringType.value === 'forced_choice' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="optionsCount">Número de Opciones</Label>
                                            <Input
                                                id="optionsCount"
                                                type="number"
                                                defaultValue={configuringType.config.optionsCount}
                                                min="2"
                                                max="6"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="showPercentage"
                                                defaultChecked={configuringType.config.showPercentage}
                                            />
                                            <label htmlFor="showPercentage" className="text-sm font-medium">
                                                Mostrar porcentaje de respuesta al completar
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Ranking Config */}
                                {configuringType.value === 'ranking' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="optionsCount">Número de Opciones a Ordenar</Label>
                                            <Input
                                                id="optionsCount"
                                                type="number"
                                                defaultValue={configuringType.config.optionsCount}
                                                min="3"
                                                max="6"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="dragAndDrop"
                                                defaultChecked={configuringType.config.dragAndDrop}
                                            />
                                            <label htmlFor="dragAndDrop" className="text-sm font-medium">
                                                Usar interfaz de arrastrar y soltar
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="showNumbers"
                                                defaultChecked={configuringType.config.showNumbers}
                                            />
                                            <label htmlFor="showNumbers" className="text-sm font-medium">
                                                Mostrar números de orden (1, 2, 3, 4)
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Situational Config */}
                                {configuringType.value === 'situational' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="timeLimit">Tiempo Límite por Pregunta (segundos)</Label>
                                            <Input
                                                id="timeLimit"
                                                type="number"
                                                defaultValue={configuringType.config.timeLimit}
                                                min="30"
                                                max="300"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="showContext"
                                                defaultChecked={configuringType.config.showContext}
                                            />
                                            <label htmlFor="showContext" className="text-sm font-medium">
                                                Mostrar contexto adicional de la situación
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Image Config */}
                                {configuringType.value === 'image' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="imageSize">Tamaño de Imagen</Label>
                                            <Select defaultValue={configuringType.config.imageSize}>
                                                <SelectTrigger id="imageSize" className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="small">Pequeño (150x150px)</SelectItem>
                                                    <SelectItem value="medium">Mediano (300x300px)</SelectItem>
                                                    <SelectItem value="large">Grande (500x500px)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Formatos Permitidos</Label>
                                            <div className="mt-2 space-y-2">
                                                {['jpg', 'png', 'svg', 'gif'].map((format) => (
                                                    <div key={format} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`format-${format}`}
                                                            defaultChecked={configuringType.config.allowedFormats.includes(format)}
                                                        />
                                                        <label htmlFor={`format-${format}`} className="text-sm">
                                                            {format.toUpperCase()}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Likert Config */}
                                {configuringType.value === 'likert' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="scalePoints">Puntos en la Escala</Label>
                                            <Select defaultValue={String(configuringType.config.scalePoints)}>
                                                <SelectTrigger id="scalePoints" className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="3">3 puntos</SelectItem>
                                                    <SelectItem value="5">5 puntos (recomendado)</SelectItem>
                                                    <SelectItem value="7">7 puntos</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="showLabels"
                                                defaultChecked={configuringType.config.showLabels}
                                            />
                                            <label htmlFor="showLabels" className="text-sm font-medium">
                                                Mostrar etiquetas textuales en la escala
                                            </label>
                                        </div>
                                        {configuringType.config.showLabels && (
                                            <div>
                                                <Label>Etiquetas de la Escala</Label>
                                                <div className="mt-2 space-y-2">
                                                    {configuringType.config.labels.map((label: string, idx: number) => (
                                                        <Input
                                                            key={idx}
                                                            placeholder={`Etiqueta ${idx + 1}`}
                                                            defaultValue={label}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Single Choice Config */}
                                {configuringType.value === 'single_choice' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="showIcons"
                                                defaultChecked={configuringType.config.showIcons}
                                            />
                                            <label htmlFor="showIcons" className="text-sm font-medium">
                                                Mostrar íconos representativos para cada opción
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="highlightSelection"
                                                defaultChecked={configuringType.config.highlightSelection}
                                            />
                                            <label htmlFor="highlightSelection" className="text-sm font-medium">
                                                Resaltar la opción seleccionada con color
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Stepped/Blocks Config */}
                                {configuringType.value === 'stepped' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Bloques Temáticos</Label>
                                            <div className="mt-2 space-y-2">
                                                {configuringType.config.blocks.map((block: string, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <Input
                                                            placeholder={`Bloque ${idx + 1}`}
                                                            defaultValue={block}
                                                        />
                                                        <Button variant="ghost" size="sm" className="text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Agregar Bloque
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="showProgress"
                                                defaultChecked={configuringType.config.showProgress}
                                            />
                                            <label htmlFor="showProgress" className="text-sm font-medium">
                                                Mostrar barra de progreso entre bloques
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info section */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Nota:</strong> Los cambios en la configuración afectarán solo a las nuevas preguntas creadas con este tipo. Las preguntas existentes mantendrán su configuración actual.
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTypeConfigDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                            onClick={handleSaveTypeConfig}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Configuración
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default PsychometricConfigPage;