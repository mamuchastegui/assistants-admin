# Plan de Implementación del Módulo Gym - Sistema Completo

## Visión General
Transformar el módulo gym de un prototipo hardcodeado a un sistema completo de gestión que integra:
- Admin panel (assistants-admin)
- WhatsApp assistant (assistants-api)
- App de usuario final (personal-os-console)

## 📅 Fase 1: Backend API - Modelos y Base de Datos ✅ COMPLETADO
### Semana 1

#### 1.1 Modelos de dominio extendidos ✅
- [x] **GymMember**: datos completos del miembro, plan activo, estado de pago
- [x] **GymMembershipPlan**: tipos de membresías, precios, duraciones, características
- [x] **GymPayment**: historial de pagos, métodos, estados, vencimientos
- [x] **GymCheckIn**: registro de asistencias/entradas al gym
- [ ] **MemberProgress**: mediciones, peso, métricas de progreso
- [ ] **WorkoutPlan**: planes de entrenamiento personalizados

#### 1.2 Migraciones PostgreSQL ✅
- [x] Tablas para todos los modelos con relaciones apropiadas
- [x] Índices para búsquedas frecuentes
- [x] Triggers para actualizar estados automáticamente

#### 1.3 Repositorios y Ports ✅
- [x] **MemberRepository**: CRUD completo de miembros
- [x] **PaymentRepository**: gestión de pagos y suscripciones
- [ ] **CheckInRepository**: registro de asistencias
- [ ] **WorkoutRepository**: planes y rutinas

## 📅 Fase 2: Backend API - Funciones y Webhooks ⚠️ PARCIALMENTE COMPLETADO
### Semana 1-2

#### 2.1 Function Calling expandido para WhatsApp Assistant ✅
- [x] **register_member**: registro completo con validaciones
- [x] **check_membership_status**: verificar estado de membresía
- [x] **create_membership_payment**: procesar pagos (preparado para MercadoPago)
- [x] **record_checkin**: registrar entrada al gym
- [ ] **get_workout_plan**: obtener plan de entrenamiento
- [x] **update_member_info**: actualizar métricas de progreso

#### 2.2 Webhooks y notificaciones 🔄
- [ ] Webhook MercadoPago para pagos
- [ ] Notificaciones de vencimiento de membresía
- [ ] Recordatorios de clases reservadas
- [ ] Alertas de cupos disponibles

#### 2.3 Endpoints REST para admin ✅
- [x] **/api/gym/members**: gestión completa de miembros
- [x] **/api/gym/payments**: gestión de pagos
- [ ] **/api/gym/plans**: gestión de planes de membresía
- [ ] **/api/gym/checkins**: registro de asistencias
- [ ] **/api/gym/reports**: reportes y estadísticas

## 📅 Fase 3: Admin Frontend - Componentes Base ⚠️ PARCIALMENTE COMPLETADO
### Semana 2

#### 3.1 Hooks y servicios ✅
- [x] **useGymMembers**: hook para gestión de miembros
- [x] **useGymPayments**: hook para pagos
- [ ] **useGymClasses**: hook mejorado con capacidad real
- [ ] **GymApiService**: cliente API centralizado

#### 3.2 Páginas mejoradas 🔄
- [ ] **Members**: formularios de alta/edición, historial completo
- [ ] **Payments**: integración real con MercadoPago, estados detallados
- [ ] **Classes**: gestión de capacidad real, lista de espera
- [ ] **Dashboard**: métricas reales, gráficos de tendencias

#### 3.3 Componentes reutilizables 🔄
- [ ] **MemberForm**: formulario completo con validación
- [ ] **PaymentHistory**: tabla con filtros avanzados
- [ ] **ClassBookingCalendar**: calendario interactivo
- [ ] **MembershipCard**: tarjeta visual de membresía

## 📅 Fase 4: Personal-OS-Console Integration 🔄 PENDIENTE
### Semana 3

#### 4.1 Módulo Gym para usuarios finales
- [ ] Estructura de carpetas siguiendo patrón modular
- [ ] Vista de mi membresía actual
- [ ] Mis clases reservadas con calendario
- [ ] Mi plan de entrenamiento personalizado
- [ ] Tracking de progreso y métricas

#### 4.2 Componentes del módulo
- [ ] **MyMembership**: estado de membresía, próximo pago
- [ ] **MyWorkouts**: plan semanal interactivo
- [ ] **MyProgress**: gráficos de evolución
- [ ] **ClassBooking**: reservar desde la app

#### 4.3 Integración con otros módulos
- [ ] **Nutrition**: conectar planes de alimentación
- [ ] **Habits**: crear hábitos de ejercicio
- [ ] **Calendar**: sincronizar clases y entrenamientos

## 📅 Fase 5: Funcionalidades Avanzadas 🔄 PENDIENTE
### Semana 3-4

#### 5.1 Sistema de check-in
- [ ] QR code para entrada
- [ ] Check-in por WhatsApp
- [ ] Registro automático de asistencia

#### 5.2 Gestión financiera
- [ ] Reportes de ingresos mensuales
- [ ] Proyecciones basadas en renovaciones
- [ ] Alertas de morosidad
- [ ] Descuentos y promociones

#### 5.3 Comunicación automatizada
- [ ] Templates de WhatsApp para recordatorios
- [ ] Campañas de retención
- [ ] Encuestas de satisfacción
- [ ] Newsletter con tips de ejercicio

## 📅 Fase 6: Analytics y Reportes 🔄 PENDIENTE
### Semana 4

#### 6.1 Dashboard analytics
- [ ] Métricas de retención
- [ ] Ocupación por clase y horario
- [ ] Tendencias de crecimiento
- [ ] ROI por tipo de membresía

#### 6.2 Reportes exportables
- [ ] Lista de miembros activos
- [ ] Reporte financiero mensual
- [ ] Asistencia por período
- [ ] Clases más populares

#### 6.3 Inteligencia de negocio
- [ ] Predicción de cancelaciones
- [ ] Sugerencias de horarios óptimos
- [ ] Análisis de demanda por clase
- [ ] Segmentación de miembros

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: FastAPI (existente)
- **Base de datos**: PostgreSQL con nuevas tablas
- **Autenticación**: Auth0
- **Pagos**: MercadoPago API
- **Notificaciones**: WhatsApp Business API
- **Real-time**: SSE (Server-Sent Events)

### Frontend Admin
- **Framework**: React + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Estado**: React Query + Zustand
- **Forms**: React Hook Form + Zod

### Personal-OS-Console
- **Framework**: Next.js 14
- **UI**: shadcn/ui + Tailwind CSS
- **Estado**: Zustand + React Query
- **Routing**: App Router

### Analytics
- **Charts**: Recharts
- **Queries**: PostgreSQL views + functions
- **Export**: CSV/Excel/PDF generation

## 📊 Estado Actual del Proyecto

### ✅ Completado (40%)
- Modelos de dominio principales
- Migración de base de datos
- Repositorios de Members y Payments
- Function calling básico para WhatsApp
- APIs REST para members y payments
- Hooks de React para admin

### 🔄 En Progreso (20%)
- Integración con páginas del admin
- Testing de endpoints
- Documentación de APIs

### 📅 Pendiente (40%)
- Módulo personal-os-console
- Sistema de check-in con QR
- Webhooks de MercadoPago
- Dashboard analytics
- Reportes exportables
- Planes de entrenamiento
- Métricas de progreso

## 🚀 Próximos Pasos Inmediatos

1. **Aplicar migración a la base de datos**
   ```bash
   psql $DATABASE_URL < migrations/2025_12_28_enhance_gym_tables.sql
   ```

2. **Registrar nuevos routers en FastAPI**
   - Agregar gym_members_router
   - Agregar gym_payments_router

3. **Actualizar páginas del admin**
   - Reemplazar mockData con hooks reales
   - Implementar formularios de creación/edición

4. **Configurar MercadoPago**
   - Obtener credenciales
   - Configurar webhook endpoint
   - Testear flujo de pago

5. **Comenzar módulo personal-os-console**
   - Crear estructura de carpetas
   - Implementar componentes básicos
   - Conectar con API

## 📝 Notas Importantes

- **Prioridad**: El flujo completo de membresía (registro → pago → activación) debe funcionar end-to-end
- **Testing**: Cada fase debe ser testeada antes de continuar
- **Documentación**: Mantener actualizada la documentación de APIs
- **Seguridad**: Validar permisos por tenant_id en todos los endpoints
- **Performance**: Implementar paginación y lazy loading donde corresponda

## 🎯 Métricas de Éxito

- [ ] Admin puede gestionar miembros y pagos completamente desde la web
- [ ] WhatsApp assistant puede registrar nuevos miembros y procesar pagos
- [ ] Miembros pueden ver su estado desde personal-os-console
- [ ] Sistema genera reportes automáticos mensuales
- [ ] Reducción del 80% en tareas manuales administrativas
- [ ] Tasa de renovación automática > 70%

---

**Última actualización**: 2025-12-28
**Estado general**: 40% completado
**Próxima revisión**: Después de completar Fase 3