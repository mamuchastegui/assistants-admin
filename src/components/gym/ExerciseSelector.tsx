import { useState, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { gymConsoleClient, type GymCatalogExercise, type ExerciseType } from '@/api/gymConsoleClient';

interface ExerciseSelectorProps {
  value: string;
  onChange: (exerciseName: string) => void;
  placeholder?: string;
  className?: string;
  /** Filter exercises by type (mobility, activation, strength, power, cardio, core) */
  exerciseType?: ExerciseType;
}

export function ExerciseSelector({
  value,
  onChange,
  placeholder = 'Buscar ejercicio...',
  className,
  exerciseType,
}: ExerciseSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<GymCatalogExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);

  // Debounced search
  const searchExercises = useCallback(async (query: string) => {
    if (query.length < 2) {
      setExercises([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await gymConsoleClient.searchExercises(query, exerciseType);
      setExercises(results);
    } catch (error) {
      console.error('Error searching exercises:', error);
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  }, [exerciseType]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchExercises(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchExercises]);

  // Reset state when popover closes
  useEffect(() => {
    if (!open) {
      setHasUserTyped(false);
      setSearchQuery('');
      setExercises([]);
    }
  }, [open]);

  // Initialize search with current value ONLY when opening and user hasn't typed yet
  useEffect(() => {
    if (open && value && !hasUserTyped && exercises.length === 0 && searchQuery === '') {
      setSearchQuery(value);
    }
  }, [open, value, exercises.length, hasUserTyped, searchQuery]);

  const handleSelect = (exerciseName: string) => {
    onChange(exerciseName);
    setOpen(false);
    setSearchQuery('');
    setExercises([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', className)}
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 z-[9999]" align="start" sideOffset={4}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar ejercicio..."
            value={searchQuery}
            onValueChange={(val) => {
              setHasUserTyped(true);
              setSearchQuery(val);
            }}
          />
          <CommandList
            className="max-h-[300px] overflow-y-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
              </div>
            ) : searchQuery.length < 2 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Escribe al menos 2 caracteres para buscar
              </div>
            ) : exercises.length === 0 ? (
              <CommandEmpty>No se encontraron ejercicios</CommandEmpty>
            ) : (
              <CommandGroup>
                {exercises.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.name}
                    onSelect={() => handleSelect(exercise.name)}
                    className="flex flex-col items-start gap-1"
                  >
                    <div className="flex w-full items-center">
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === exercise.name ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="font-medium">{exercise.name}</span>
                    </div>
                    <div className="ml-6 flex gap-2 text-xs text-muted-foreground">
                      {exercise.movementPattern && (
                        <span className="rounded bg-muted px-1">{exercise.movementPattern}</span>
                      )}
                      {exercise.bodyPart && (
                        <span>{exercise.bodyPart}</span>
                      )}
                      {exercise.equipment && (
                        <span>{exercise.equipment}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
