# Sistema de Roles y Permisos - Kronthor v2.0
**Fecha**: 29 de diciembre de 2025

## 1. Introducción

Este documento establece el modelo de roles y permisos para Kronthor v2.0, un sistema fundamental que determina quién puede acceder, editar y gestionar cada componente de la plataforma. Este modelo es la base de seguridad para la evolución de Kronthor hacia una plataforma multi-usuario con coaches, atletas y administradores.

## 2. Jerarquía de Roles

### 2.1. Superadmin (Nivel Plataforma)
**Propósito**: Gestión total de la plataforma y acceso sin restricciones.

**Permisos**:
- ✅ CRUD completo sobre todas las entidades del sistema
- ✅ Gestión de usuarios globales (crear/editar/eliminar/cambiar roles)
- ✅ Acceso a todas las empresas/equipos sin restricción
- ✅ Gestión del catálogo global (ejercicios, métodos, capacidades, equipamiento)
- ✅ Configuración de políticas RLS (Row Level Security)
- ✅ Acceso a logs y auditoría del sistema
- ✅ Gestión de integraciones y API keys

**Casos de uso**:
- Mantenimiento del catálogo universal de ejercicios
- Resolución de problemas críticos de usuarios
- Configuración inicial de empresas/equipos
- Supervisión de uso y rendimiento de la plataforma

---

### 2.2. Company Admin (Nivel Organización)
**Propósito**: Administrador de una empresa, equipo o gimnasio. Gestiona coaches y atletas dentro de su organización.

**Permisos**:
- ✅ CRUD sobre usuarios de su empresa (coaches y atletas)
- ✅ Asignación de roles dentro de su empresa
- ✅ Gestión de equipos y grupos
- ✅ Configuración de equipamiento disponible para la organización
- ✅ Crear/editar ejercicios privados de la empresa (no afectan catálogo global)
- ✅ Visualización de métricas y reportes agregados de su organización
- ✅ Gestión de suscripciones y facturación (si aplica)
- ❌ No puede acceder a datos de otras empresas
- ❌ No puede modificar el catálogo global
- ❌ No puede cambiar configuraciones de plataforma

**Casos de uso**:
- Director técnico de un gimnasio que gestiona múltiples coaches
- Gerente de un equipo deportivo profesional
- Administrador de un centro de alto rendimiento

---

### 2.3. Coach (Nivel Programación)
**Propósito**: Crea y gestiona planes de entrenamiento para atletas asignados.

**Permisos**:
- ✅ Visualizar catálogo global de ejercicios (lectura completa)
- ✅ Proponer nuevos ejercicios al catálogo privado de la empresa (requiere aprobación de Admin si está habilitado)
- ✅ CRUD sobre atletas asignados a él
- ✅ CRUD sobre planes, sesiones y bloques de sus atletas
- ✅ Editar/sustituir ejercicios en sesiones
- ✅ Registrar métricas y tests de sus atletas
- ✅ Visualizar historial, progresiones y analíticas de sus atletas
- ✅ Comentar y aprobar ajustes propuestos por el sistema o el atleta
- ✅ Exportar/importar planes (Excel)
- ✅ Acceso a biblioteca de documentos de su empresa
- ❌ No puede editar el catálogo global de ejercicios
- ❌ No puede acceder a atletas no asignados
- ❌ No puede gestionar otros coaches
- ❌ No puede modificar configuraciones de empresa

**Casos de uso**:
- Entrenador personal trabajando con atletas individuales
- Coach de un equipo gestionando un roster
- Preparador físico especializado en un deporte

---

### 2.4. Athlete (Nivel Ejecución)
**Propósito**: Ejecuta el plan de entrenamiento y registra feedback.

**Permisos**:
- ✅ Ver su propio plan de entrenamiento (calendario, sesiones, ejercicios)
- ✅ Registrar sesiones completadas (cargas, reps, RPE, tiempos, notas)
- ✅ Registrar cuestionarios de bienestar (sueño, fatiga, dolor, readiness)
- ✅ Registrar ciclo menstrual (si activó el módulo opt-in)
- ✅ Ver videos demostrativos de ejercicios del catálogo
- ✅ Comentar en sesiones (dudas, molestias, sugerencias)
- ✅ Ver su historial, PRs y analíticas personales
- ✅ Exportar sus propios reportes (PDF)
- ✅ Configurar notificaciones y preferencias de privacidad
- ❌ No puede ver ni editar planes de otros atletas
- ❌ No puede modificar la programación (solo comentar/sugerir)
- ❌ No puede acceder al catálogo de administración
- ❌ No puede agregar ejercicios

**Casos de uso**:
- Atleta siguiendo un plan individualizado
- Miembro de equipo registrando sesiones diarias
- Cliente de entrenamiento online

---

## 3. Matriz de Permisos por Entidad

| Entidad | Superadmin | Company Admin | Coach | Athlete |
|---------|------------|---------------|-------|---------|
| **Usuarios** |
| Ver todos | ✅ | ✅ (empresa) | ✅ (asignados) | ❌ |
| Crear | ✅ | ✅ (empresa) | ❌ | ❌ |
| Editar | ✅ | ✅ (empresa) | ✅ (sus atletas) | ✅ (perfil propio) |
| Eliminar | ✅ | ✅ (empresa) | ❌ | ❌ |
| Cambiar roles | ✅ | ✅ (empresa) | ❌ | ❌ |
| **Catálogo Global** |
| Ver ejercicios | ✅ | ✅ | ✅ | ✅ (solo demos) |
| Crear ejercicios | ✅ | ❌ | ❌ | ❌ |
| Editar ejercicios | ✅ | ❌ | ❌ | ❌ |
| Eliminar ejercicios | ✅ | ❌ | ❌ | ❌ |
| **Catálogo Privado (Empresa)** |
| Ver | ✅ | ✅ | ✅ | ✅ (solo demos) |
| Crear | ✅ | ✅ | ✅ (con aprobación*) | ❌ |
| Editar | ✅ | ✅ | ✅ (propios) | ❌ |
| Eliminar | ✅ | ✅ | ✅ (propios) | ❌ |
| **Planes y Sesiones** |
| Ver | ✅ | ✅ (empresa) | ✅ (asignados) | ✅ (propios) |
| Crear | ✅ | ✅ | ✅ (atletas asignados) | ❌ |
| Editar | ✅ | ✅ | ✅ (atletas asignados) | ❌ |
| Eliminar | ✅ | ✅ | ✅ (atletas asignados) | ❌ |
| **Registro de Sesiones** |
| Ver | ✅ | ✅ (empresa) | ✅ (asignados) | ✅ (propias) |
| Crear | ✅ | ✅ | ✅ (en nombre de atleta) | ✅ (propias) |
| Editar | ✅ | ✅ | ✅ (asignados) | ✅ (propias) |
| **Analíticas y Reportes** |
| Ver todas | ✅ | ✅ (empresa) | ✅ (asignados) | ✅ (propias) |
| Exportar | ✅ | ✅ | ✅ | ✅ (propias) |
| **Biblioteca de Documentos** |
| Ver | ✅ | ✅ (empresa) | ✅ (empresa) | ❌ |
| Subir/Editar | ✅ | ✅ | ✅ (con permisos) | ❌ |
| **Equipos/Grupos** |
| Ver | ✅ | ✅ (empresa) | ✅ (asignados) | ✅ (propios) |
| Crear/Editar | ✅ | ✅ | ❌ | ❌ |
| **Deportes y Perfiles de Demanda** |
| Ver | ✅ | ✅ | ✅ | ✅ |
| Crear/Editar | ✅ | ❌ | ❌ | ❌ |
| **Configuración de Empresa** |
| Ver | ✅ | ✅ (propia) | ❌ | ❌ |
| Editar | ✅ | ✅ (propia) | ❌ | ❌ |

\* *Nota*: El flujo de aprobación para ejercicios propuestos por Coach puede ser configurado por el Company Admin.

---

## 4. Implementación Técnica (Row Level Security - RLS)

### 4.1. Estructura de Tablas de Seguridad

#### Tabla: `profiles` (extiende auth.users de Supabase)
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  full_name VARCHAR,
  role VARCHAR NOT NULL CHECK (role IN ('superadmin', 'company_admin', 'coach', 'athlete')),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: `companies` (organizaciones)
```sql
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  domain VARCHAR UNIQUE, -- opcional: para auto-asignación por email
  settings JSONB, -- configuraciones personalizadas
  subscription_tier VARCHAR, -- free/pro/enterprise
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: `coach_athlete_assignments` (asignaciones)
```sql
CREATE TABLE public.coach_athlete_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coach_id, athlete_id)
);
```

#### Tabla: `exercise_visibility` (ejercicios privados)
```sql
CREATE TABLE public.exercise_visibility (
  exercise_id UUID REFERENCES public.exercise(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  is_global BOOLEAN DEFAULT FALSE, -- TRUE = catálogo global
  created_by UUID REFERENCES public.profiles(id),
  PRIMARY KEY (exercise_id, company_id)
);
```

---

### 4.2. Políticas RLS por Tabla Principal

#### Políticas para `exercise` (catálogo)
```sql
-- Superadmin: acceso total
CREATE POLICY "superadmin_all_exercise" ON public.exercise
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
    )
  );

-- Admin/Coach: ver ejercicios globales + privados de su empresa
CREATE POLICY "company_view_exercise" ON public.exercise
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      LEFT JOIN public.exercise_visibility ev ON ev.exercise_id = exercise.id
      WHERE p.id = auth.uid()
        AND p.role IN ('company_admin', 'coach')
        AND (ev.is_global = TRUE OR ev.company_id = p.company_id)
    )
  );

-- Athlete: solo lectura de demos (ejercicios en su plan)
CREATE POLICY "athlete_view_exercise" ON public.exercise
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'athlete'
    )
  );
```

#### Políticas para `training_plan` y `session`
```sql
-- Superadmin: acceso total
CREATE POLICY "superadmin_all_plan" ON public.training_plan
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
    )
  );

-- Company Admin: ver/editar planes de su empresa
CREATE POLICY "company_admin_plan" ON public.training_plan
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.profiles athlete ON athlete.id = training_plan.athlete_id
      WHERE p.id = auth.uid()
        AND p.role = 'company_admin'
        AND p.company_id = athlete.company_id
    )
  );

-- Coach: ver/editar planes de atletas asignados
CREATE POLICY "coach_plan" ON public.training_plan
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.coach_athlete_assignments ca
      WHERE ca.coach_id = auth.uid()
        AND ca.athlete_id = training_plan.athlete_id
    )
  );

-- Athlete: ver solo sus propios planes
CREATE POLICY "athlete_own_plan" ON public.training_plan
  FOR SELECT USING (
    training_plan.athlete_id = auth.uid()
  );
```

#### Políticas para `session_log` (registros)
```sql
-- Athlete: crear/editar solo sus registros
CREATE POLICY "athlete_own_log" ON public.session_log
  FOR ALL USING (
    session_log.athlete_id = auth.uid()
  );

-- Coach: ver/editar registros de atletas asignados
CREATE POLICY "coach_log" ON public.session_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.coach_athlete_assignments ca
      WHERE ca.coach_id = auth.uid()
        AND ca.athlete_id = session_log.athlete_id
    )
  );
```

---

## 5. Flujos de Usuario por Rol

### 5.1. Flujo de Onboarding: Superadmin
1. Usuario registrado manualmente o por script inicial
2. Asignar `role = 'superadmin'` y `company_id = NULL` (acceso global)
3. Primera sesión: configurar deportes iniciales, cargar catálogo base

### 5.2. Flujo de Onboarding: Company Admin
1. Registro estándar (email/password o SSO)
2. Superadmin o auto-registro crea empresa y asigna `role = 'company_admin'`
3. Wizard de setup:
   - Nombre de la empresa/equipo
   - Deportes principales
   - Equipamiento disponible
   - Invitar coaches iniciales
4. Acceso al panel de administración de empresa

### 5.3. Flujo de Onboarding: Coach
1. Invitación por Company Admin (email + link con token)
2. Registro y asignación a empresa (`company_id`)
3. Wizard de setup:
   - Especialidad/deportes que maneja
   - Preferencias de planificación
4. Puede crear atletas o recibir asignaciones de Admin

### 5.4. Flujo de Onboarding: Athlete
1. Invitación por Coach o Company Admin (código/link)
2. Registro y asignación a empresa + coach
3. Wizard de setup (según newfeatures.md §7.2):
   - Perfil fisiológico (edad, peso, altura)
   - Training age (experiencia en fuerza)
   - Ciclo menstrual (opt-in)
   - Deporte(s) y objetivos
   - Disponibilidad semanal
   - Tests iniciales
4. Sistema genera propuesta de plan base

---

## 6. Casos de Uso Avanzados

### 6.1. Coach freelance trabajando con múltiples empresas
**Problema**: Un coach externo trabaja con atletas de diferentes gimnasios.

**Solución**:
- Crear múltiples asignaciones `coach_athlete_assignments` con `company_id` distintos
- El coach ve todos sus atletas en el dashboard, agrupados por empresa
- RLS filtra automáticamente por permisos

### 6.2. Atleta cambia de coach dentro de la misma empresa
**Flujo**:
1. Company Admin o coach anterior des-asigna al atleta
2. Nuevo coach recibe la asignación
3. El historial del atleta persiste (no se borra)
4. Políticas RLS actualizan accesos automáticamente

### 6.3. Ejercicio privado propuesto por Coach
**Flujo con aprobación**:
1. Coach crea ejercicio y marca `visibility = 'pending_approval'`
2. Notificación a Company Admin
3. Admin revisa y aprueba/rechaza
4. Si aprueba: `exercise_visibility` con `company_id` + `is_global = FALSE`

**Flujo sin aprobación** (configuración permisiva):
1. Coach crea ejercicio directamente
2. Auto-asigna a su empresa
3. Visible inmediatamente para otros coaches de la empresa

---

## 7. Privacidad y Datos Sensibles

### 7.1. Datos del Ciclo Menstrual
**Nivel de sensibilidad**: ALTO

**Reglas**:
- Tabla `menstrual_cycle_log` con RLS estricto
- Solo visible para la atleta propietaria (`athlete_id = auth.uid()`)
- Coach puede ver **agregado/estimación** (fase del ciclo, nivel de síntomas) solo si la atleta activa `share_with_coach = TRUE`
- Company Admin NO tiene acceso (privacidad total)
- Superadmin solo para soporte técnico (con consentimiento explícito)

### 7.2. Datos de Bienestar (sueño, estrés)
**Nivel de sensibilidad**: MEDIO

**Reglas**:
- Coach asignado puede ver para ajustar programación
- Agregado visible para Company Admin (sin detalles individuales)
- Atleta puede marcar respuestas como "privadas" (no compartidas con coach)

### 7.3. Métricas de Rendimiento
**Nivel de sensibilidad**: BAJO (en contexto deportivo)

**Reglas**:
- Coach y Company Admin pueden ver todas las métricas de rendimiento (1RM, tests, PRs)
- Útil para reportes y comparativas de equipo

---

## 8. Roadmap de Implementación (alineado con ruta_de_mejora.md)

### Fase 1.1: Fundamentos de Seguridad (CRÍTICO - prioritario)
- [ ] Crear tablas `profiles`, `companies`, `coach_athlete_assignments`
- [ ] Implementar políticas RLS básicas para ejercicios y planes
- [ ] Migrar usuarios existentes a modelo de roles
- [ ] Agregar middleware de autenticación en rutas críticas
- [ ] Testing de aislamiento multi-tenant

### Fase 1.2: Wizard de Onboarding Multi-Rol
- [ ] Flujo de registro con selección de rol (Coach/Athlete)
- [ ] Wizard específico por rol (según newfeatures.md §7.2)
- [ ] Sistema de invitaciones (códigos/links)
- [ ] Auto-asignación de empresa por dominio de email (opcional)

### Fase 1.3: Dashboard por Rol
- [ ] Navegación adaptativa según rol (Guards)
- [ ] Panel de Company Admin (gestión de usuarios)
- [ ] Panel de Coach (lista de atletas, calendario)
- [ ] Panel de Athlete (plan personal)

### Fase 2+: Permisos Avanzados
- [ ] Catálogo privado por empresa (`exercise_visibility`)
- [ ] Flujo de aprobación de ejercicios propuestos
- [ ] Gestión de equipos/grupos con permisos granulares
- [ ] Privacidad de datos sensibles (ciclo menstrual)
- [ ] Logs de auditoría

---

## 9. Checklist de Validación (Testing)

### Pruebas de Seguridad
- [ ] Superadmin puede acceder a todas las entidades sin restricción
- [ ] Company Admin NO puede ver datos de otras empresas
- [ ] Coach NO puede acceder a atletas no asignados
- [ ] Athlete NO puede ver planes de otros atletas
- [ ] Atleta NO puede editar su propia programación (solo comentar)

### Pruebas de Flujos
- [ ] Invitación de Coach por Admin funciona correctamente
- [ ] Invitación de Athlete por Coach funciona correctamente
- [ ] Cambio de coach mantiene historial del atleta
- [ ] Des-asignación de atleta revoca accesos inmediatamente

### Pruebas de Privacidad
- [ ] Datos de ciclo menstrual NO visibles sin consentimiento
- [ ] Bienestar privado NO compartido con coach si opt-out
- [ ] Company Admin NO puede acceder a ciclo menstrual

---

## 10. Conclusión

Este modelo de roles y permisos establece una base sólida y escalable para Kronthor v2.0, permitiendo:

1. **Seguridad multi-tenant**: aislamiento total entre empresas
2. **Flexibilidad de asignaciones**: coaches trabajando con múltiples organizaciones
3. **Privacidad por diseño**: datos sensibles protegidos con consentimiento explícito
4. **Escalabilidad**: agregar nuevos roles/permisos sin refactorizar RLS completo

**Prioridad de implementación**: Fase 1.1 (fundamentos) debe completarse ANTES de habilitar funcionalidades de planificación avanzada (Fase 2+), garantizando que la estructura de seguridad soporte el crecimiento futuro del sistema.
