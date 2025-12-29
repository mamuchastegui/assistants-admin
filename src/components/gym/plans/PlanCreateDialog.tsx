import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Dumbbell, Calendar, Target } from 'lucide-react';
import { useWorkoutPlans, type PlanCreate, type SessionCreate, type ExerciseCreate } from '@/hooks/gym/useWorkoutPlans';

interface PlanCreateDialogProps {
  open: boolean;
  onClose: () => void;
  members: any[];
}

// Mock exercise library - in production this would come from API
const exerciseLibrary = [
  { id: '1', name: 'Press de Banca', muscle_groups: ['pecho', 'tríceps'] },
  { id: '2', name: 'Sentadilla', muscle_groups: ['cuádriceps', 'glúteos'] },
  { id: '3', name: 'Peso Muerto', muscle_groups: ['espalda', 'isquiotibiales'] },
  { id: '4', name: 'Press Militar', muscle_groups: ['hombros', 'tríceps'] },
  { id: '5', name: 'Dominadas', muscle_groups: ['espalda', 'bíceps'] },
  { id: '6', name: 'Remo con Barra', muscle_groups: ['espalda', 'bíceps'] },
  { id: '7', name: 'Press de Piernas', muscle_groups: ['cuádriceps', 'glúteos'] },
  { id: '8', name: 'Curl de Bíceps', muscle_groups: ['bíceps'] },
  { id: '9', name: 'Extensión de Tríceps', muscle_groups: ['tríceps'] },
  { id: '10', name: 'Elevaciones Laterales', muscle_groups: ['hombros'] },
];

export const PlanCreateDialog: React.FC<PlanCreateDialogProps> = ({
  open,
  onClose,
  members,
}) => {
  const { useCreatePlan } = useWorkoutPlans();
  const createPlan = useCreatePlan();

  const [step, setStep] = useState(1);
  const [planData, setPlanData] = useState<PlanCreate>({
    name: '',
    description: '',
    goal: '',
    difficulty: 'intermediate',
    duration_weeks: 4,
    sessions_per_week: 3,
    is_template: false,
    tags: [],
    member_id: undefined,
    sessions: [],
  });

  const [currentTag, setCurrentTag] = useState('');

  const addTag = () => {
    if (currentTag && !planData.tags.includes(currentTag)) {
      setPlanData({
        ...planData,
        tags: [...planData.tags, currentTag],
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setPlanData({
      ...planData,
      tags: planData.tags.filter(t => t !== tag),
    });
  };

  const addSession = () => {
    const newSession: SessionCreate = {
      name: `Sesión ${planData.sessions.length + 1}`,
      description: '',
      session_type: 'training',
      focus_areas: [],
      exercises: [],
    };

    setPlanData({
      ...planData,
      sessions: [...planData.sessions, newSession],
    });
  };

  const updateSession = (index: number, session: SessionCreate) => {
    const newSessions = [...planData.sessions];
    newSessions[index] = session;
    setPlanData({
      ...planData,
      sessions: newSessions,
    });
  };

  const removeSession = (index: number) => {
    setPlanData({
      ...planData,
      sessions: planData.sessions.filter((_, i) => i !== index),
    });
  };

  const generateWeeklyPlan = () => {
    const sessions: SessionCreate[] = [];
    const sessionsPerWeek = planData.sessions_per_week;

    for (let week = 1; week <= planData.duration_weeks; week++) {
      for (let day = 1; day <= sessionsPerWeek; day++) {
        const sessionType = day % 2 === 0 ? 'upper' : 'lower';
        const session: SessionCreate = {
          name: `Semana ${week} - Día ${day}`,
          description: sessionType === 'upper' ? 'Tren superior' : 'Tren inferior',
          week_number: week,
          day_of_week: day,
          session_type: 'training',
          focus_areas: sessionType === 'upper'
            ? ['pecho', 'espalda', 'hombros', 'brazos']
            : ['cuádriceps', 'isquiotibiales', 'glúteos', 'pantorrillas'],
          exercises: [],
        };

        // Add template exercises based on session type
        if (sessionType === 'upper') {
          session.exercises = [
            { exercise_id: '1', order_index: 1, sets: 4, reps: 8, rest_seconds: 90 },
            { exercise_id: '4', order_index: 2, sets: 3, reps: 10, rest_seconds: 60 },
            { exercise_id: '5', order_index: 3, sets: 3, reps: 8, rest_seconds: 90 },
            { exercise_id: '8', order_index: 4, sets: 3, reps: 12, rest_seconds: 45 },
            { exercise_id: '9', order_index: 5, sets: 3, reps: 12, rest_seconds: 45 },
          ];
        } else {
          session.exercises = [
            { exercise_id: '2', order_index: 1, sets: 4, reps: 8, rest_seconds: 120 },
            { exercise_id: '3', order_index: 2, sets: 4, reps: 6, rest_seconds: 120 },
            { exercise_id: '7', order_index: 3, sets: 3, reps: 12, rest_seconds: 90 },
          ];
        }

        sessions.push(session);
      }
    }

    setPlanData({
      ...planData,
      sessions,
    });
  };

  const handleSubmit = async () => {
    await createPlan.mutateAsync(planData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Plan de Entrenamiento</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Configura los detalles básicos del plan'}
            {step === 2 && 'Define las sesiones y ejercicios'}
            {step === 3 && 'Revisa y confirma el plan'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  s <= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    s < step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nombre del Plan</Label>
                <Input
                  id="name"
                  value={planData.name}
                  onChange={(e) => setPlanData({ ...planData, name: e.target.value })}
                  placeholder="Ej: Plan de Fuerza Básico"
                />
              </div>
              <div>
                <Label htmlFor="member">Miembro (Opcional)</Label>
                <Select
                  value={planData.member_id}
                  onValueChange={(value) => setPlanData({ ...planData, member_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un miembro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.member_id} value={member.member_id}>
                        {member.first_name} {member.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={planData.description}
                onChange={(e) => setPlanData({ ...planData, description: e.target.value })}
                placeholder="Describe el objetivo y enfoque del plan"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="goal">Objetivo</Label>
                <Select
                  value={planData.goal}
                  onValueChange={(value) => setPlanData({ ...planData, goal: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muscle_gain">Ganar Músculo</SelectItem>
                    <SelectItem value="weight_loss">Perder Peso</SelectItem>
                    <SelectItem value="strength">Fuerza</SelectItem>
                    <SelectItem value="endurance">Resistencia</SelectItem>
                    <SelectItem value="general_fitness">Fitness General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty">Dificultad</Label>
                <Select
                  value={planData.difficulty}
                  onValueChange={(value: any) => setPlanData({ ...planData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                    <SelectItem value="expert">Experto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="duration">Duración (semanas)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="52"
                  value={planData.duration_weeks}
                  onChange={(e) => setPlanData({
                    ...planData,
                    duration_weeks: parseInt(e.target.value) || 1
                  })}
                />
              </div>
              <div>
                <Label htmlFor="frequency">Sesiones por semana</Label>
                <Input
                  id="frequency"
                  type="number"
                  min="1"
                  max="7"
                  value={planData.sessions_per_week}
                  onChange={(e) => setPlanData({
                    ...planData,
                    sessions_per_week: parseInt(e.target.value) || 1
                  })}
                />
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Agregar tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {planData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={planData.is_template}
                onCheckedChange={(checked) => setPlanData({ ...planData, is_template: checked })}
              />
              <Label>Guardar como plantilla</Label>
            </div>
          </div>
        )}

        {/* Step 2: Sessions */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Sesiones de Entrenamiento</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={generateWeeklyPlan}
                >
                  Generar Plan Automático
                </Button>
                <Button onClick={addSession}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Sesión
                </Button>
              </div>
            </div>

            {planData.sessions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No hay sesiones agregadas. Puedes agregarlas manualmente o generar un plan automático.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="0">
                <TabsList>
                  {planData.sessions.map((_, index) => (
                    <TabsTrigger key={index} value={index.toString()}>
                      Sesión {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {planData.sessions.map((session, index) => (
                  <TabsContent key={index} value={index.toString()}>
                    <SessionEditor
                      session={session}
                      onChange={(s) => updateSession(index, s)}
                      onRemove={() => removeSession(index)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{planData.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{planData.description}</p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Objetivo</p>
                    <p className="text-muted-foreground">{planData.goal}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dificultad</p>
                    <p className="text-muted-foreground">{planData.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Duración</p>
                    <p className="text-muted-foreground">{planData.duration_weeks} semanas</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Frecuencia</p>
                    <p className="text-muted-foreground">{planData.sessions_per_week} sesiones/semana</p>
                  </div>
                </div>

                {planData.member_id && (
                  <div>
                    <p className="text-sm font-medium">Asignado a</p>
                    <p className="text-muted-foreground">
                      {members.find(m => m.member_id === planData.member_id)?.first_name}{' '}
                      {members.find(m => m.member_id === planData.member_id)?.last_name}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium">Sesiones totales</p>
                  <p className="text-muted-foreground">{planData.sessions.length}</p>
                </div>

                {planData.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {planData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else onClose();
            }}
          >
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </Button>
          <Button
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleSubmit();
            }}
            disabled={step === 1 && !planData.name}
          >
            {step === 3 ? 'Crear Plan' : 'Siguiente'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Session Editor Component
const SessionEditor: React.FC<{
  session: SessionCreate;
  onChange: (session: SessionCreate) => void;
  onRemove: () => void;
}> = ({ session, onChange, onRemove }) => {
  const addExercise = (exerciseId: string) => {
    const exercise = exerciseLibrary.find(e => e.id === exerciseId);
    if (!exercise) return;

    const newExercise: ExerciseCreate = {
      exercise_id: exerciseId,
      order_index: session.exercises.length + 1,
      sets: 3,
      reps: 10,
      rest_seconds: 60,
    };

    onChange({
      ...session,
      exercises: [...session.exercises, newExercise],
    });
  };

  const updateExercise = (index: number, exercise: ExerciseCreate) => {
    const newExercises = [...session.exercises];
    newExercises[index] = exercise;
    onChange({
      ...session,
      exercises: newExercises,
    });
  };

  const removeExercise = (index: number) => {
    onChange({
      ...session,
      exercises: session.exercises.filter((_, i) => i !== index),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="space-y-2 flex-1">
            <Input
              value={session.name}
              onChange={(e) => onChange({ ...session, name: e.target.value })}
              placeholder="Nombre de la sesión"
              className="font-semibold"
            />
            <Textarea
              value={session.description}
              onChange={(e) => onChange({ ...session, description: e.target.value })}
              placeholder="Descripción de la sesión"
              rows={2}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="ml-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Día de la semana</Label>
            <Select
              value={session.day_of_week?.toString()}
              onValueChange={(value) => onChange({
                ...session,
                day_of_week: value ? parseInt(value) : undefined
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un día" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Lunes</SelectItem>
                <SelectItem value="2">Martes</SelectItem>
                <SelectItem value="3">Miércoles</SelectItem>
                <SelectItem value="4">Jueves</SelectItem>
                <SelectItem value="5">Viernes</SelectItem>
                <SelectItem value="6">Sábado</SelectItem>
                <SelectItem value="0">Domingo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Semana</Label>
            <Input
              type="number"
              min="1"
              value={session.week_number || ''}
              onChange={(e) => onChange({
                ...session,
                week_number: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="Número de semana"
            />
          </div>
        </div>

        <div>
          <Label>Ejercicios</Label>
          <div className="space-y-2 mt-2">
            {session.exercises.map((exercise, index) => {
              const exerciseInfo = exerciseLibrary.find(e => e.id === exercise.exercise_id);
              return (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <span className="text-sm font-medium flex-1">
                    {exerciseInfo?.name}
                  </span>
                  <Input
                    type="number"
                    min="1"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(index, {
                      ...exercise,
                      sets: parseInt(e.target.value) || 1,
                    })}
                    className="w-16"
                    placeholder="Sets"
                  />
                  <span>×</span>
                  <Input
                    type="number"
                    min="1"
                    value={exercise.reps}
                    onChange={(e) => updateExercise(index, {
                      ...exercise,
                      reps: parseInt(e.target.value) || 1,
                    })}
                    className="w-16"
                    placeholder="Reps"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            <Select onValueChange={addExercise}>
              <SelectTrigger>
                <SelectValue placeholder="Agregar ejercicio" />
              </SelectTrigger>
              <SelectContent>
                {exerciseLibrary.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCreateDialog;