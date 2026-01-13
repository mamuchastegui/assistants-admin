import { useState } from 'react';
import { Plus, Trash2, Timer, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExerciseSelector } from './ExerciseSelector';
import type { WarmupBlock, WarmupExercise } from '@/api/gymConsoleClient';

interface WarmupEditorProps {
  value: WarmupBlock;
  onChange: (warmup: WarmupBlock) => void;
}

const EMPTY_EXERCISE: WarmupExercise = {
  name: '',
  sets: 2,
  reps: '10',
  duration: undefined,
  notes: '',
};

export function WarmupEditor({ value, onChange }: WarmupEditorProps) {
  // Cardio handlers
  const updateCardio = (updates: Partial<{ duration: number; description: string }>) => {
    onChange({
      ...value,
      cardio: value.cardio
        ? { ...value.cardio, ...updates }
        : { duration: updates.duration ?? 5, description: updates.description ?? '' },
    });
  };

  const removeCardio = () => {
    const { cardio, ...rest } = value;
    onChange(rest as WarmupBlock);
  };

  const addCardio = () => {
    onChange({
      ...value,
      cardio: { duration: 5, description: 'Cinta, bici o remo a ritmo suave' },
    });
  };

  // Mobility handlers
  const addMobilityExercise = () => {
    onChange({
      ...value,
      mobility: [...value.mobility, { ...EMPTY_EXERCISE }],
    });
  };

  const updateMobilityExercise = (index: number, updates: Partial<WarmupExercise>) => {
    onChange({
      ...value,
      mobility: value.mobility.map((ex, i) =>
        i === index ? { ...ex, ...updates } : ex
      ),
    });
  };

  const removeMobilityExercise = (index: number) => {
    onChange({
      ...value,
      mobility: value.mobility.filter((_, i) => i !== index),
    });
  };

  // Activation handlers
  const addActivationExercise = () => {
    onChange({
      ...value,
      activation: [...value.activation, { ...EMPTY_EXERCISE }],
    });
  };

  const updateActivationExercise = (index: number, updates: Partial<WarmupExercise>) => {
    onChange({
      ...value,
      activation: value.activation.map((ex, i) =>
        i === index ? { ...ex, ...updates } : ex
      ),
    });
  };

  const removeActivationExercise = (index: number) => {
    onChange({
      ...value,
      activation: value.activation.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      {/* Cardio Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Timer className="h-4 w-4 text-orange-500" />
            Cardio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {value.cardio ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Duracion (min)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={value.cardio.duration}
                    onChange={(e) => updateCardio({ duration: parseInt(e.target.value) || 5 })}
                    className="h-8"
                  />
                </div>
                <div className="flex-[3] space-y-1">
                  <Label className="text-xs">Descripcion</Label>
                  <Input
                    value={value.cardio.description}
                    onChange={(e) => updateCardio({ description: e.target.value })}
                    placeholder="Ej: Cinta a ritmo suave"
                    className="h-8"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive mt-5"
                  onClick={removeCardio}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={addCardio} className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              Agregar cardio
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Mobility Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            Movilidad
            <span className="text-xs text-muted-foreground font-normal">
              ({value.mobility.length} ejercicios)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {value.mobility.map((exercise, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Ejercicio {index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => removeMobilityExercise(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <ExerciseSelector
                value={exercise.name}
                onChange={(name) => updateMobilityExercise(index, { name })}
                placeholder="Buscar ejercicio de movilidad..."
                exerciseType="mobility"
              />
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Series</Label>
                  <Input
                    type="number"
                    min="1"
                    value={exercise.sets ?? ''}
                    onChange={(e) => updateMobilityExercise(index, { sets: parseInt(e.target.value) || undefined })}
                    className="h-8"
                    placeholder="2"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Reps/Tiempo</Label>
                  <Input
                    value={exercise.reps ?? ''}
                    onChange={(e) => updateMobilityExercise(index, { reps: e.target.value })}
                    className="h-8"
                    placeholder="30s"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duracion (s)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={exercise.duration ?? ''}
                    onChange={(e) => updateMobilityExercise(index, { duration: parseInt(e.target.value) || undefined })}
                    className="h-8"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addMobilityExercise} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Agregar ejercicio de movilidad
          </Button>
        </CardContent>
      </Card>

      {/* Activation Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Activacion
            <span className="text-xs text-muted-foreground font-normal">
              ({value.activation.length} ejercicios)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {value.activation.map((exercise, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Ejercicio {index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => removeActivationExercise(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <ExerciseSelector
                value={exercise.name}
                onChange={(name) => updateActivationExercise(index, { name })}
                placeholder="Buscar ejercicio de activacion..."
                exerciseType="activation"
              />
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Series</Label>
                  <Input
                    type="number"
                    min="1"
                    value={exercise.sets ?? ''}
                    onChange={(e) => updateActivationExercise(index, { sets: parseInt(e.target.value) || undefined })}
                    className="h-8"
                    placeholder="2"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Reps</Label>
                  <Input
                    value={exercise.reps ?? ''}
                    onChange={(e) => updateActivationExercise(index, { reps: e.target.value })}
                    className="h-8"
                    placeholder="12"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duracion (s)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={exercise.duration ?? ''}
                    onChange={(e) => updateActivationExercise(index, { duration: parseInt(e.target.value) || undefined })}
                    className="h-8"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addActivationExercise} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Agregar ejercicio de activacion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper to create an empty warmup block
export function createEmptyWarmupBlock(): WarmupBlock {
  return {
    mobility: [],
    activation: [],
  };
}

// Helper to check if warmup is the new structured format
export function isWarmupBlock(warmup: string[] | WarmupBlock | undefined): warmup is WarmupBlock {
  if (!warmup) return false;
  if (Array.isArray(warmup)) return false;
  return 'mobility' in warmup || 'activation' in warmup;
}
