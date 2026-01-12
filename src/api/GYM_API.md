# Integracion con Gym API

Este documento explica como assistants-admin interactua con las APIs de gym.

## Dos APIs Diferentes

| API | URL | Autenticacion | Uso |
|-----|-----|---------------|-----|
| assistants-api | api.condamind.com | Auth0 token | Otros modulos (miembros, pagos, checkins, clases) |
| gym app | gym.condamind.com | Internal API Key | **Trainers, clientes, planes** |

## Configuracion

```env
VITE_API_URL=https://api.condamind.com
VITE_GYM_CONSOLE_URL=https://gym.condamind.com
VITE_GYM_INTERNAL_API_KEY=<misma key que INTERNAL_API_KEY en gym app>
```

## Clientes de API

### assistants-api (con token de usuario)
```typescript
import { useAuthApi } from '@/api/client';

const authApi = useAuthApi();
// Usa token de Auth0 automaticamente
await authApi.get('/api/gym/members');
```

### gym app (con API key)
```typescript
import { gymConsoleClient } from '@/api/gymConsoleClient';

// Usa INTERNAL_API_KEY automaticamente
const trainer = await gymConsoleClient.getTrainerByTenant(tenantId);
const clients = await gymConsoleClient.getTrainerClients(trainerId);
```

## Hook Principal para Gym

Usar `useGymWorkoutPlans()` para TODO lo relacionado a trainers/clientes/planes.

```typescript
import { useGymWorkoutPlans } from '@/hooks/gym/useGymWorkoutPlans';

const {
  useTrainer,        // Obtener trainer del tenant actual
  useClients,        // Listar clientes de un trainer
  usePlans,          // Listar planes
  useListTrainers,   // Listar todos los trainers (para dropdowns)
  // ... mutations
} = useGymWorkoutPlans();

// Ejemplo de uso
const { data: trainer } = useTrainer();
const { data: clientsData } = useClients(trainer?.id || '', 'active');
```

## TenantId

El `orgId` de TenantContext debe coincidir con `tenant_id` en gym_trainers.

```typescript
import { useTenant } from '@/context/TenantContext';

const { orgId } = useTenant();
// orgId se usa para buscar el trainer en gym app
```

## Flujo de Datos

```
TenantContext (orgId)
      │
      ▼
useGymWorkoutPlans.useTrainer()
      │
      ▼
gymConsoleClient.getTrainerByTenant(tenantId)
      │
      ▼
gym.condamind.com/api/admin/trainers?tenantId=...
      │
      ▼
trainer.id
      │
      ▼
gymConsoleClient.getTrainerClients(trainerId)
gymConsoleClient.getTrainerClientPlans(trainerId)
```

## Paginas que usan gym app

- `/gym/workout-plans` (WorkoutPlans.tsx) - Lista planes de clientes
- `/gym/clients` (Clients.tsx) - Lista clientes vinculados
- `/gym/ai-workout-plans` (AIWorkoutPlans.tsx) - Planes generados por IA
- `/gym/trainer-settings` (TrainerSettings.tsx) - Configuracion del trainer
- `/gym/classes` (Classes.tsx) - Clases (usa useListTrainers para dropdown)

## Archivos de codigo

- `src/api/gymConsoleClient.ts` - Cliente HTTP para gym app admin API
- `src/hooks/gym/useGymWorkoutPlans.ts` - Hook principal con React Query

## DEPRECADO

NO usar `useGymTrainer` (eliminado). Consultaba assistants-api que ya no tiene trainers.
