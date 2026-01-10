# Ruta de Mejora: Kronthor v2.0
**Versión**: 3.0 (actualizada 2-ene-2026)  
**Enfoque**: Seguridad Multi-tenant + Planificación Inteligente Multi-deporte

Este documento establece la hoja de ruta para habilitar las nuevas funcionalidades descritas en `newfeatures.md`, integrándolas con la base de datos actual, el PRD v2.0, el sistema de roles y permisos definido en `RolesPermisos29dic25.md`, y la guía metodológica operativa de `estudio_previo.md`.

**Cambios v3.0** (2-ene-2026):
- ✅ Integración de `estudio_previo.md` como guía metodológica base del motor de planificación
- ✅ Añadidos templates específicos: 12-Week Universal, Fuerza, Resistencia, Pádel
- ✅ Añadidos algoritmos operativos: Selector de accesorios, Gates específicos, Cálculo vVO2+HRR
- ✅ Nueva tabla `intensity_zone` para dosificación de resistencia

---

> [!IMPORTANT]
> **Cambio crítico en prioridades**: La **Fase 1** (Roles y Seguridad) es ahora el cimiento obligatorio del sistema. Sin un modelo de roles y Row Level Security (RLS) coherente, no es posible construir las interfaces de planificación multi-usuario de forma segura.

---

## Fase 1: Seguridad, Roles y Onboarding Multi-Usuario (CRÍTICO)
**Objetivo**: Establecer la arquitectura multi-tenant (superadmin/empresa/coach/atleta) con aislamiento de datos, onboarding guiado por rol, y políticas RLS robustas.

### 1.1. Fundamentos de Seguridad y Roles (PRIORITARIO)
**Justificación**: El sistema actual (`db.md`) no incluye gestión de empresas ni roles diferenciados. Implementar esto PRIMERO evita refactorizar toda la lógica de negocio después.

**Cambios en Base de Datos**:
- **[NEW]** Crear tabla `companies` (organizaciones/equipos)
  - Campos: `id`, `name`, `domain`, `settings` (JSONB), `subscription_tier`, `is_active`
- **[NEW]** Crear tabla `profiles` (extiende `auth.users` de Supabase)
  - Campos: `id` (FK a `auth.users`), `email`, `full_name`, `role` (enum: `'superadmin' | 'company_admin' | 'coach' | 'athlete'`), `company_id` (FK a `companies`)
- **[NEW]** Crear tabla `coach_athlete_assignments` (asignaciones N:M)
  - Campos: `coach_id`, `athlete_id`, `company_id`, `assigned_at`
  - Permite que un coach freelance trabaje con múltiples empresas
- **[NEW]** Crear tabla `exercise_visibility` (catálogo global vs privado)
  - Campos: `exercise_id`, `company_id`, `is_global` (BOOL), `created_by`
  - Habilita ejercicios privados por empresa sin contaminar catálogo global

**Políticas RLS a Implementar** (según `RolesPermisos29dic25.md §4.2`):
- `exercise`: Superadmin total; Admin/Coach ven global + privados de su empresa; Athlete solo demos
- `training_plan`, `session`: aislados por empresa/coach/atleta según rol
- `session_log`: Atleta solo edita propios; Coach lee los de asignados; Admin lee los de su empresa
- `menstrual_cycle_log` (datos sensibles): Solo atleta + Coach si `share_with_coach = TRUE`; Admin NO accede

**Lógica de Autenticación**:
- Middleware de Guards en rutas críticas (`/admin/*`, `/coach/*`, `/athlete/*`)
- Verificación de `role` y `company_id` antes de renderizar componentes
- Hooks: `useRole()`, `usePermissions(entity)`, `useCompany()`

**Estimación**: 5-7 días (DB + RLS + Guards + testing de aislamiento)

**Criterio de éxito**:
- [ ] Coach de empresa A NO puede ver atletas de empresa B
- [ ] Atleta NO puede editar programación (solo comentar)
- [ ] Superadmin accede a todas las entidades sin filtros RLS
- [ ] Ejercicios privados solo visibles para la empresa creadora

---

### 1.2. Wizard de Onboarding Multi-Rol
**Objetivo**: Capturar contexto inicial del usuario (rol, deporte, nivel, equipamiento, tests) para personalizar experiencia y generar plan base.

**Flujo por Rol** (según `newfeatures.md §7.2`):

#### A. Onboarding: Company Admin
1. Registro → selección de plan (free/pro/enterprise)
2. **Configuración de Empresa**:
   - Nombre del equipo/gimnasio
   - Deportes principales (multi-select desde catálogo `sport`)
   - Equipamiento disponible (vinculado a `equipment`)
3. **Invitar Coaches iniciales** (email + link con token de invitación)
4. Dashboard de administración (gestión de usuarios, equipos, suscripción)

#### B. Onboarding: Coach
1. Registro por invitación (token de Admin)
2. **Perfil de Coach**:
   - Especialidades/deportes que maneja
   - Preferencias de planificación (polarizada/piramidal, énfasis técnica/fuerza)
3. Opción: crear primeros atletas o esperar asignaciones de Admin
4. Dashboard de Coach (lista de atletas, calendario semanal, analíticas agregadas)

#### C. Onboarding: Athlete (el más completo)
1. Registro por invitación (código/link de Coach o Admin)
2. **Paso 1 - Básicos**: Edad, sexo, peso, altura, idioma, unidades (métrico/imperial)
3. **Paso 2 - Training Age** (experiencia en fuerza):
   - Tiempo entrenando fuerza continua (meses/años)
   - Pausas > 3 meses (fecha de reinicio)
   - **Clasificación automática**: Principiante (<13 meses) / Intermedio (13m-5a) / Avanzado (≥5a)
   - Override manual por coach si aplica (p. ej., lesión, regreso tras pausa)
4. **Paso 3 - Ciclo Menstrual** (opt-in, solo para quienes menstrúan):
   - Fecha inicio último periodo
   - Duración típica del sangrado
   - Longitud promedio del ciclo
   - Configuración de privacidad (`share_with_coach`)
   - **Nota**: Puede desactivarse/borrarse en cualquier momento
5. **Paso 4 - Deporte(s) y Objetivos**:
   - Deporte principal + secundarios (p. ej., HYROX, running, CrossFit)
   - Meta (rendimiento / salud / recomposición)
   - Eventos objetivo (fecha, prioridad)
6. **Paso 5 - Disponibilidad**:
   - Días/semana, ventanas horarias, preferencia AM/PM
   - Días fijos de descanso
7. **Paso 6 - Equipamiento**: Selección desde `equipment` (gimnasio completo / barras / mancuernas / ergómetros / etc.)
8. **Paso 7 - Tests Iniciales** (según deporte):
   - Fuerza: estimación 1RM (sentadilla, banca, peso muerto) o skip
   - Resistencia: HRmáx/FC reposo, umbrales (LT/VT), vVO2max/ritmos, tests (5k, 2k row, etc.)
   - Potencia: jump metrics (CMJ/SJ) si disponible
9. **Salida del Wizard**:
   - Cálculo de zonas de intensidad (FC, ritmo, potencia, %1RM)
   - Propuesta de macroestructura (macro/meso/micro) y primer microciclo
   - Checklist de pendientes (p. ej., programar test de umbral)

**UI/UX**:
- Stepper con progreso visual (pasos 1-9 para Athlete)
- Validación inline (Zod) y tooltips explicativos
- Opción "skip" en pasos opcionales (ciclo menstrual, tests)
- Confirmación final con resumen de datos capturados

**Estimación**: 6-8 días (formularios + lógica de clasificación + generación de plan base)

**Criterio de éxito**:
- [ ] Athlete completa onboarding en <10 min y obtiene semana 1 generada
- [ ] Clasificación de training age es automática y editable por coach
- [ ] Datos de ciclo menstrual solo visibles con consentimiento

---

### 1.3. Gestión de Equipos y Asignaciones
**Objetivo**: Admin puede crear equipos/grupos, invitar coaches/atletas, y gestionar permisos.

**Funcionalidades**:
- **Invitación de usuarios**: links/códigos de un solo uso (tabla `invitations` con `token`, `role`, `company_id`, `expires_at`)
- **Asignación Coach↔Athlete**: Admin o Coach crea asignaciones; UI de arrastrar/soltar (drag-and-drop) para re-asignar
- **Grupos/Teams**: tabla `teams` con `company_id` + tabla `team_members` (N:M); útil para deportes de equipo
- **Permisos por atleta** (opcional avanzado): quién puede editar / quién solo comenta
- **Dashboard de Admin**:
  - Vista de usuarios con filtros por rol
  - Vista de equipos con roster
  - Métricas agregadas (adherencia, carga semanal, tests)
  - Gestión de suscripción/facturación (stub para MVP)

**Estimación**: 4-5 días

**Criterio de éxito**:
- [ ] Admin invita Coach por email; Coach recibe link válido 72h
- [ ] Coach crea Athlete y lo asigna a sí mismo
- [ ] Admin re-asigna atleta a otro coach; permisos RLS actualizan automáticamente

---

### 1.4. Dashboard Adaptativo por Rol
**Objetivo**: Cada rol ve una interfaz específica a sus permisos y necesidades.

**Navegación y Guards**:
- Rutas protegidas con Guards basados en `role`:
  - `/superadmin/*` → solo `superadmin`
  - `/admin/*` → `company_admin` + `superadmin`
  - `/coach/*` → `coach` + roles superiores
  - `/athlete/*` → `athlete` + coach asignado (lectura)
- Sidebar dinámica según permisos
- Botones de acción (crear, editar, eliminar) condicionados por `usePermissions(entity)`

**Dashboards específicos**:
- **Superadmin**: gestión global de empresas, catálogo, logs de auditoría
- **Company Admin**: usuarios, equipos, equipamiento, reportes de empresa
- **Coach**: lista de atletas (cards con foto, último check-in, próxima sesión), calendario semanal, biblioteca de templates
- **Athlete**: calendario personal, check-in de bienestar, progreso (gráficas), plan de la semana

**Estimación**: 4-5 días (componentes + guards + tests de navegación)

**Criterio de éxito**:
- [ ] Athlete NO ve botón "Crear Ejercicio"
- [ ] Coach NO accede a `/admin/users`
- [ ] Company Admin ve métricas agregadas de su empresa, no de otras

---

## Fase 2: Motor de Planificación y Progresión Semanal (Inteligencia)
**Objetivo**: Pasar de un catálogo estático a un sistema dinámico de construcción de sesiones con reglas de progresión, auto-regulación y feedback.

### 2.1. Calendario y Constructor de Sesiones
**Interfaz**:
- **Vista de Calendario** (semanal/mensual):
  - Drag-and-drop de sesiones entre días
  - Color-coding por tipo (fuerza / motor / técnica / descanso / test)
  - Indicadores de carga (tonelaje / TSS / sRPE acumulado)
- **Constructor de Sesión** (modal o panel lateral):
  - Bloques (`session_block`): Warm-up → Skill/Técnica → Principal → Accesorios → Movilidad/Descarga
  - Cada bloque contiene ejercicios con prescripción (sets, reps, %1RM/RIR, zona FC/ritmo/potencia, tiempo, notas)
  - **Recomendaciones automáticas** por deporte/fase (desde `sport_demand_profile` y `exercise_sport`)
  - **Sustituciones inteligentes**: si falta equipamiento, proponer variantes (mismo patrón + vector + cualidad)

**Lógica de Recomendación** (según `newfeatures.md §9`):
- Filtrar ejercicios por:
  1. Deporte/modalidad (`sport_id`)
  2. Fase actual (base / desarrollo / intensificación / peak)
  3. Objetivo (capacidad: fuerza máxima / potencia / VO2 / etc.)
  4. Nivel del atleta (training age: principiante / intermedio / avanzado)
  5. Equipamiento disponible
  6. Restricciones (lesiones, fatiga, ciclo menstrual si aplica)
- Priorizar ejercicios con mayor `transfer_score` (0-100) y banda de especificidad SPE/SDE
- Aplicar constraints (no duplicar patrón dominante, balance empuje-tracción, limitar impacto/SSC según fatiga)

**Implementación en DB**:
- **[NEW]** Tabla `training_plan`: `athlete_id`, `coach_id`, `sport_id`, `start_date`, `end_date`, `macro_template_id`
- **[NEW]** Tabla `session`: `plan_id`, `date`, `session_type` (fuerza/motor/técnica/descanso), `estimated_duration`, `notes`
- **[NEW]** Tabla `session_block`: `session_id`, `block_type` (warmup/skill/principal/accessory/cooldown), `order`
- **[NEW]** Tabla `block_exercise`: `block_id`, `exercise_id`, `sets`, `reps`, `intensity` (JSONB: %1RM/RIR/zona/ritmo/etc.), `rest_seconds`, `notes`

**Estimación**: 8-10 días (UI de calendario + constructor + lógica de recomendación)

**Criterio de éxito**:
- [ ] Coach construye sesión de HYROX con bloques: carrera Z2 + trineo + accesorios; sistema recomienda ejercicios apropiados
- [ ] Sistema sustituye "Sentadilla barra" por "Sentadilla goblet" si solo hay mancuernas
- [ ] Balance empuje-tracción validado automáticamente

---

### 2.2. Algoritmo de Progresión Semanal y Auto-regulación
**Objetivo**: Ajuste automático de carga (volumen/intensidad/densidad) basado en adherencia, sRPE, bienestar, y rendimiento.

**Variables de Entrada** (según `newfeatures.md §8.1`):
- **Adherencia**: % sesiones completadas, cumplimiento de objetivos (tiempo en zona, tonelaje)
- **Carga externa**: volumen (min/km/tonelaje), intensidad real vs prescrita
- **Carga interna**: sRPE (RPE × duración), FC media/pico, TRIMP
- **Readiness**: cuestionario de bienestar (sueño, estrés, dolor, motivación, DOMS)
- **Rendimiento**: tests periódicos (1RM estimado, 5k, 2k row, CMJ, etc.)
- **Training age**: meses/años de entrenamiento continuo (para estimar tolerancia)
- **Restricciones**: lesiones, molestias, viajes, fatiga
- **Ciclo menstrual** (si activado): fase estimada + severidad de síntomas

**Reglas de Progresión** (según `newfeatures.md §8.2`):
- **Progresión por bloques**: 3:1 (3 semanas carga + 1 descarga) o 4:1 según deporte/nivel
- **Progresión primaria**: aumentar 1 variable/semana (volumen O intensidad O densidad), no todas juntas
- **Descarga automática**: si fatiga supera umbrales (baja adherencia + peor bienestar + caída de rendimiento), reducir volumen 20-40% y mantener intensidad técnica
- **Auto-regulación intra-sesión**: ajuste por RIR/RPE (fuerza) o FC/potencia/ritmo (resistencia) para mantener estímulo sin exceder fatiga
- **Ajuste por ciclo menstrual** (opcional, auto-regulado):
  - Si se siente bien → progresión estándar
  - Si reporta malestar → reducción protectora (volumen -10-30%, evitar picos de intensidad y movimientos altamente explosivos/alto impacto)
  - Escalamiento por sensaciones: cambiar a variante "Low impact", recortar bloques accesorios, o convertir sesión a recuperación activa

**Algoritmo (pseudocódigo)**:
```
cada semana:
  adherencia = (sesiones_completadas / sesiones_planificadas)
  fatiga_index = (sRPE_acumulado + inverso(bienestar) + caida_rendimiento) / 3
  
  si fatiga_index > umbral_alto:
    aplicar deload (volumen -30%, mantener intensidad)
  sino si adherencia >= 0.9 Y bienestar >= 7/10 Y en_semana_progresion:
    incrementar variable_primaria según fase (vol/int/densidad)
  sino:
    mantener carga
  
  si ciclo_menstrual_activo AND sintomas >= moderados:
    reducir volumen 10-20%
    evitar ejercicios con impact_level = alto O SSC_level = alto
    sugerir variantes controladas (tempo, isometrías, Z1-Z2)
```

**Check-in Semanal (UX)**:
- Flujo recomendado (domingo o día previo):
  1. Cuestionario breve (2-3 min): sueño, fatiga, dolor, estrés, motivación, tiempo disponible
  2. Si ciclo menstrual activado: estado de fase + severidad de síntomas
  3. Resumen automático: carga real vs planificada, tendencias (4 semanas), señales (mejora/estancamiento)
  4. Propuesta de semana siguiente: sesiones clave, objetivo de volumen, cambios puntuales
  5. Coach revisa y aprueba; publicación al atleta

**Implementación en DB**:
- **[NEW]** Tabla `weekly_checkin`: `athlete_id`, `week_start_date`, `sleep_score`, `stress_score`, `pain_score`, `motivation_score`, `fatigue_score`, `available_time`, `notes`
- **[NEW]** Tabla `menstrual_cycle_log`: `athlete_id`, `period_start_date`, `flow_days`, `cycle_length`, `symptom_severity`, `share_with_coach` (BOOL)
  - RLS estricto: solo atleta + coach si `share_with_coach = TRUE`
- **[NEW]** Tabla `progression_snapshot`: `athlete_id`, `week_date`, `load_index`, `fatigue_index`, `adherence`, `action_taken` (maintain/increase/deload)

**Estimación**: 10-12 días (formularios + algoritmo + reglas de ajuste + UI de propuesta semanal)

**Criterio de éxito**:
- [ ] Atleta con adherencia 95% + bienestar alto recibe incremento de volumen
- [ ] Atleta con fatiga alta recibe automáticamente semana de deload
- [ ] Atleta con ciclo menstrual + síntomas altos recibe reducción de impacto y volumen
- [ ] Coach puede override la propuesta automática

---

### 2.2.4. Algoritmos Operativos Adicionales (basados en `estudio_previo.md`)

#### A. Selector de Accesorios (§12.1)
**Objetivo**: Elegir accesorios que aumenten estímulo útil sin romper presupuesto de fatiga/impacto, apoyando transferencia del patrón principal.

**Entradas**:
- Patrón principal del día (sentadilla/bisagra/empuje/jalón) + variante (dominancia rodilla/cadera)
- Limitantes del atleta (puntos débiles identificados)
- Riesgo lesionológico típico del deporte
- Presupuesto de estrés semanal acumulado (mecánico/neural/metabólico/impacto)
- Equipamiento disponible
- Fase actual (acumulación vs intensificación/taper)

**Reglas de priorización**:
1. **Prioridad 1**: Accesorio de soporte al patrón (mismo patrón o sinergista directo)
   - Ej: Si patrón = sentadilla → Bulgarian split squat, prensa 45°, hack squat
2. **Prioridad 2**: Accesorio para limitante identificado
   - Ej: Posterior de cadena débil → RDL, hip thrust, curl femoral
   - Ej: Estabilidad lumbopélvica → Dead bug, Pallof press, bird-dogs
3. **Prioridad 3**: Robustez/prehab (monoarticulares, unilateral, control ROM)
   - Alta relación estímulo-fatiga (máquinas, mancuernas, tempo controlado)

**Constraints**:
- Balance semanal: mantener empujes ≈ jalones y rodilla ≈ cadera (ajustado al deporte)
- Cap por sesión:
  - Acumulación: 2-4 accesorios
  - Desarrollo: 2-3 accesorios
  - Intensificación/Taper: 1-2 accesorios
- Tempo recomendado:
  - Acumulación: controlado (2-0-2, 3-1-1)
  - Potencia: rápido (1-0-1) sin comprometer técnica

**Implementación**:
```typescript
function selectAccessoryExercises(
  mainPattern: MovementPattern,
  athleteLimitations: string[],
  weeklyStressBudget: StressBudget,
  phase: Phase,
  equipmentAvailable: Equipment[]
): Exercise[] {
  // 1. Filtrar por equipamiento
  // 2. Ordenar por prioridad (soporte → limitante → prehab)
  // 3. Aplicar cap por fase
  // 4. Validar balance semanal
  // 5. Retornar lista ordenada con justificación
}
```

**Estimación**: 3-4 días (algoritmo + UI de justificación)

---

#### B. Cálculo de vVO2 y Zonas de Resistencia (§12.3)
**Objetivo**: Estandarizar prescripción de resistencia usando vVO2 (velocidad a VO2max) y FCR/HRR (reserva cardíaca).

**Inputs mínimos**:
- Test de campo: 6-min all-out o Cooper (distancia en metros, tiempo en segundos)
- FC reposo (medida o estimada: 220 - edad para FCmáx)
- FC máxima (medida o estimada)
- Modalidad de locomoción (running, cycling, rowing, etc.)

**Cálculos**:
1. **vVO2** = distancia (m) / tiempo (s) → velocidad en m/s o ritmo en min/km
2. **HRR** (Heart Rate Reserve) = FCmáx - FCreposo
3. **FC objetivo por zona** = FCreposo + (%HRR × HRR)
4. **Ritmo objetivo por zona** = vVO2 × % zona

**Zonas operativas** (según `estudio_previo §12.3`):

| Zona | Objetivo | % vVO2 | % HRR | Uso típico |
|------|----------|--------|-------|------------|
| Z1 | Recuperación | 55-70% | 40-60% | Entre sesiones, volumen fácil |
| Z2 | Base aeróbica | 70-80% | 60-75% | Rodajes continuos, capacidad |
| Z3 | Tempo/Umbral | 80-90% | 75-85% | Bloques sostenidos, tolerancia |
| Z4 | VO2 (intervalos) | 95-105% | 85-95% | Reps 1-4 min, calidad |
| Z5 | Supra-VO2 | 105-120% | 90-100%* | Reps cortas 15-60s, potencia aeróbica |

*En Z5 (reps cortas ≤30-40s), vVO2 manda y FC funciona como guardrail (la FC "rezaga")

**Implementación**:
```typescript
function calculateEnduranceZones(
  test6MinDistance: number, // metros
  test6MinTime: number,      // segundos (360s)
  fcRest: number,
  fcMax: number
): IntensityZone[] {
  const vVO2 = test6MinDistance / test6MinTime; // m/s
  const hrr = fcMax - fcRest;
  
  return zones.map(zone => ({
    zone: zone.name,
    pace_min_per_km: calculatePace(vVO2 * zone.vvo2_min),
    pace_max_per_km: calculatePace(vVO2 * zone.vvo2_max),
    hr_target_min: fcRest + (zone.hrr_min * hrr),
    hr_target_max: fcRest + (zone.hrr_max * hrr),
    typical_use: zone.typical_use
  }));
}
```

**Tabla a crear**: `intensity_zone` (ya especificada en §2.3)

**Gates de resistencia** (control adaptativo):
- **Calidad de ritmo**: Si ritmo cae >3-5% en Z4-Z5 → terminar bloque o ampliar recuperación
- **Deriva de FC**: En Z2-Z3, si FC se sostiene por encima del rango con mismo ritmo → bajar a Z2 o recortar volumen
- **Fatiga acumulada**: Si RPE sube ≥2 puntos a igualdad de sesión durante ≥2 exposiciones → micro-descarga (-15-25% volumen)

**UI**:
- Wizard de test: capturar distancia de 6-min + FC reposo/máx
- Calculadora de zonas: mostrar tabla Z1-Z5 con ritmos (min/km) y FC objetivo (bpm)
- Prescripción de sesión: "3×10' Z3" → sistema muestra ritmo objetivo (ej: 4:30-4:50 min/km) y FC objetivo (160-170 bpm)

**Estimación**: 4-5 días (cálculos + UI de calculadora + integración en sesiones de resistencia)

---

**Criterio de éxito (algoritmos operativos)**:
- [ ] Selector de accesorios sugiere 2-4 ejercicios coherentes con patrón principal y limitantes del atleta
- [ ] Balance empuje/jalón se mantiene automáticamente dentro del microciclo
- [ ] Cálculo de vVO2 desde test de 6-min genera tabla Z1-Z5 con ritmos y FC objetivo
- [ ] Sesiones de resistencia muestran prescripción clara (ej: "2×15' Z3 @ 4:40-5:00 min/km, 165-175 bpm")


### 2.3. Plantillas de Mesociclo (Templates de 12 semanas)
**Objetivo**: Proveer estructuras de periodización pre-configuradas para acelerar planificación y garantizar progresiones coherentes.

**Referencia metodológica**: Los templates se basan en la estructura universal de 12 semanas definida en [`estudio_previo.md §7`](file:///c:/Users/jcruz/kronthor/kronthor-plus/src/doc/estudio_previo.md), que establece mezclas GPE/SPE/SDE/CE por semana y lineamientos de carga/estrés.

#### Templates a Crear (Seeds Iniciales)

**1. "12-Week Universal Standard"** (basado en `estudio_previo.md §7`):
- **Aplicación**: Default para cualquier deporte sin template específico
- **Mezcla GPE/SPE/SDE/CE**: Progresión de 60/30/10/0 (semana 1) → 20/20/20/40 (semana 12)
- **Estructura**: 3 mesociclos × 4 semanas (patrón 3:1)
- **Nivel**: Intermedio (adaptable)

**2. "Fuerza Máxima 12 Semanas"** (basado en `estudio_previo.md §12.2` + `newfeatures.md §8.2.1`):
- **Aplicación**: Powerlifting, Halterofilia, Strongman, preparación general de fuerza
- **Fases detalladas**:
  - Semanas 1-3: Acumulación (60-75% 1RM, 3-5×6-12, 90-150s, 2-4 accesorios)
  - Semana 4: Acumulación descarga (↓25-40% volumen)
  - Semana 5: Transición a fuerza (75-85% 1RM, 4-5×4-6, 1-2 accesorios)
  - Semana 6: Deload activo (60-75% 1RM, 2-3×3-4, 0-2 accesorios)
  - Semanas 7-10: Intensificación neural (85-93% 1RM, 4-6×1-3, descansos 3-5min)
  - Semana 11: Taper (↓40-60% volumen, mantener intensidad)
  - Semana 12: Test/Peak (1RM o marcador + descarga)
- **Nivel**: Intermedio (crear variantes principiante/avanzado según demanda)

**3. "Resistencia 12 Semanas (vVO2 + HRR)"** (basado en `estudio_previo.md §12.3`):
- **Aplicación**: Running, Ciclismo, Remo, Natación, acondicionamiento general
- **Estructura semanal**: 3 sesiones/semana (A: Z2 base, B: Z3 umbral, C: Z4-Z5 intervalos)
- **Distribución intensidad**: 80/20 (semanas 1-3) → 65/35 (semanas 9-10) → 85/15 (semana 12)
- **Zonas operativas**: Z1-Z5 con % vVO2 y % HRR (ver tabla `intensity_zone`)
- **Nivel**: Intermedio

**4. "Pádel - Principiante/Intermedio/Avanzado"** (basado en `estudio_previo.md §13`):
- **3 templates separados** por nivel
- **Estructura semanal**:
  - Principiante: 4-5 sesiones totales (2 S&C + 1 condicionamiento + 1-2 pista)
  - Intermedio: 6-7 sesiones totales (3 S&C + 2-3 pista + 1 condicionamiento)
  - Avanzado: 7-9 sesiones totales (3-4 S&C + 3-4 pista + 0-1 condicionamiento)
- **Demandas específicas**: COD lateral/diagonal, rotación de tronco, estabilidad hombro, capacidad intermitente
- **Gates específicos**: Técnica de desplazamiento, RPE, tolerancia a impacto

**Reglas de ajuste del template** (aplicables a todos):
- Si usuario necesita masa: extender Acumulación a 5-6 semanas, acortar Intensificación
- Si límite es neural/técnico: Acumulación más corta (2-3 sem), priorizar Intensificación
- Elegir Acumulación 2 sem si: ya hay masa, límite técnico/neural, pocas sesiones/semana (3×), cargas suben rápido a 80-85%
- Elegir Acumulación 3-4 sem si: falta base muscular, progresa con 60-75% sin fatiga excesiva, frecuencia baja, necesita robustecer tejidos

**Implementación en DB**:
- **[NEW]** Tabla `macro_template`: `name`, `sport_id`, `duration_weeks`, `level` (principiante/intermedio/avanzado), `description`, `created_by`, `based_on_doc` (referencia a estudio_previo.md)
- **[NEW]** Tabla `meso_phase`: `template_id`, `phase_name`, `start_week`, `end_week`, `intensity_range`, `volume_range`, `gpe_mix`, `spe_mix`, `sde_mix`, `ce_mix`, `notes`
- **[NEW]** Tabla `phase_parameters` (JSONB): Estructura completa según `estudio_previo.md §10.3`:
  ```json
  {
    "intensity_range": {"min": 60, "max": 75, "unit": "%1RM"},
    "sets": {"min": 3, "max": 5},
    "reps": {"min": 6, "max": 12},
    "rest_seconds": {"min": 90, "max": 150},
    "tempo": "2-0-2",
    "accessory_count": {"min": 2, "max": 4},
    "volume_adjustment": 0,
    "stress_limits": {
      "mechanical": "medium",
      "neural": "low",
      "metabolic": "medium",
      "impact": "low"
    }
  }
  ```
- **[NEW]** Tabla `intensity_zone`: Zonas Z1-Z5 con % vVO2 y % HRR (para resistencia)
  - Campos: `zone`, `sport_modality`, `vvo2_min`, `vvo2_max`, `hrr_min`, `hrr_max`, `description`, `typical_use`
  - Seeds: Z1 (55-70% vVO2 / 40-60% HRR) hasta Z5 (105-120% vVO2 / 90-100% HRR)

**UI**:
- Library de templates (cards con preview y badge de nivel)
- Filtros: deporte, nivel, duración
- Wizard al crear plan: seleccionar template → ajustar fases → aplicar
- Coach puede editar fases (mover semanas, cambiar intensidad, override de mezcla GPE/SPE/SDE/CE)
- Preview de estructura de 12 semanas con indicadores de carga/descarga

**Estimación**: 7-9 días (templates + seeds DB + editor + aplicación a plan + tabla intensity_zone)

**Criterio de éxito**:
- [ ] Coach selecciona "12-Week Universal Standard" y obtiene plan base para cualquier deporte
- [ ] Coach selecciona "Fuerza Máxima 12 sem" y obtiene mesociclo con rangos de %1RM, series, reps, accesorios por fase
- [ ] Coach selecciona "Resistencia 12 sem" y obtiene sesiones con zonas Z1-Z5 calculadas desde vVO2 y HRR
- [ ] Coach selecciona "Pádel - Intermedio" y obtiene 6-7 sesiones/semana (S&C + pista + condicionamiento)
- [ ] Sistema permite extender fase de Acumulación de 4 a 6 semanas
- [ ] Plan generado respeta mezcla GPE/SPE/SDE/CE por semana

---

### 2.4. Reglas de Compatibilidad Fuerza + Metcon (Anti-interferencia)
**Objetivo**: Evitar fatiga excesiva y reducir interferencia cuando se combina fuerza con acondicionamiento (CrossFit/HYROX).

**Reglas base** (según `newfeatures.md §8.2.2`):
- **Orden en sesión**: Calentamiento → Levantamiento principal → Accesorios → Metcon → Descarga/movilidad (nunca metcon antes de fuerza)
- **Halterofilia/Potencia**: al inicio (barra rápida va fresca); no mezclar al final con fatiga alta
- **No duplicar patrón dominante**: no hacer bisagra pesada en metcon el mismo día de peso muerto
- **Separación mínima**: 24-48h entre sesión dura de pierna y metcon exigente de piernas
- **Ejemplos de compatibilidad**:
  - Día sentadilla: sí a monoestructural suave (bike/remo) o tren superior; evitar thrusters, wall-balls, box jumps
  - Día banca/press: sí a metcon con pierna ligera + tirón superior; evitar alto volumen de HSPU/dips/push-ups
  - Día peso muerto: sí a metcon sin cadena posterior pesada; evitar swings, GHD, bisagra explosiva
- **Dosis de interválico**: default 2 toques/semana:
  - Aláctico (potencia): sprints 10-15s con 45-60s suave (1:3-1:4), ideal tras halterofilia
  - Glicolítico corto: 30-60s con 1:1, preferible en día de tren superior
  - Aeróbico Z2: 20-30 min continuo como recuperación tras sentadilla/peso muerto

**Implementación**:
- Validador en constructor de sesión (alertas cuando se programan estímulos incompatibles)
- Sugerencias automáticas: "Ya programaste peso muerto hoy; evita metcon con bisagra pesada"
- Dashboard de compatibilidad: indicador verde/amarillo/rojo por día

**Estimación**: 3-4 días (validaciones + alertas)

**Criterio de éxito**:
- [ ] Sistema alerta si se programa sentadilla pesada + wall-balls + box jumps en mismo día
- [ ] Sistema sugiere bike Z2 en lugar de HYROX simulator tras peso muerto

---

## Fase 3: Taxonomía Avanzada y Asociación Deporte↔Ejercicio (Recomendaciones Inteligentes)
**Objetivo**: Categorizar ejercicios por acciones deportivas y demandas biomecánicas para recomendaciones precisas multi-deporte.

### 3.1. Re-estructuración de la Entidad Ejercicio (Taxonomía Completa)
**Capas de atributos** (según `newfeatures.md §9.1`):

#### Capa A - Estructura Biomecánica (OBLIGATORIA)
- **Patrón de movimiento principal** (`movement_pattern`): sentadilla, bisagra, zancada, empuje H/V, tracción H/V, locomoción, rotación, anti-rotación, carry, salto-aterrizaje, COD, lanzamiento, isométricos
- **Articulación/segmento dominante** (`dominance`): rodilla, cadera, tobillo, columna, hombro, codo + región acentuada
- **Plano(s) y vector(es)** (`plane`, `force_vector`): sagital/frontal/transversal; vector vertical/horizontal/rotacional
- **Lateralidad** (`laterality`): bilateral, unilateral, alternado, asimétrico
- **Cadena cinética** (`kinetic_chain`): abierta/cerrada/mixta
- **Rango de movimiento** (`ROM_profile`): corto/medio/largo + presencia de pausa/isometría
- **Velocidad e intención** (`velocity_intent`): lenta-controlada, moderada, explosiva/ballística
- **Ciclo estiramiento-acortamiento** (`SSC_level`): ninguno, bajo, medio, alto
- **Impacto** (`impact_level`): bajo, medio, alto (por contacto/aterrizajes)
- **Complejidad técnica** (`skill_complexity`): baja, media, alta + prerequisitos (movilidad tobillo/hombro)

#### Capa B - Cualidad Objetivo (OBLIGATORIA)
- **Capacidad principal** (`primary_capability`): fuerza máxima, hipertrofia, potencia, RFD, fuerza-resistencia, velocidad, agilidad/COD, estabilidad, movilidad, acondicionamiento aeróbico, umbral, VO2max, capacidad anaeróbica, habilidad técnica
- **Estímulo predominante** (`stress_profile`): mecánico / metabólico / neurológico (bajo-medio-alto)
- **Zona de esfuerzo** (cuando aplique): %1RM / RIR-RPE; o zona por FC/ritmo/potencia (Z1-Z6)

#### Capa C - Uso en Sesión (RECOMENDADA)
- **Rol típico** (`role_default`): principal, accesorio, técnica/skill, preparación, prehab/rehab, acondicionamiento, finisher
- **Fases compatibles** (`phase_fit`): base, desarrollo, intensificación, pico, taper, retorno (rehab)
- **Nivel mínimo** (`athlete_level_min`): principiante/intermedio/avanzado; contraindicaciones

**Cambios en DB**:
- **[MODIFY]** Tabla `exercise`: agregar columnas:
  - `dominance`, `force_vector`, `kinetic_chain`, `ROM_profile`, `velocity_intent`, `SSC_level`, `impact_level`, `skill_complexity`, `stress_profile`, `role_default`, `phase_fit`, `athlete_level_min`
- Poblar valores para ejercicios existentes (migración masiva + ajustes manuales)

**Estimación**: 4-5 días (migración DB + UI de edición + validaciones)

**Criterio de éxito**:
- [ ] Ejercicio "Sentadilla barra" tiene: `movement_pattern=sentadilla`, `dominance=rodilla+cadera`, `vector=vertical`, `SSC_level=bajo`, `impact_level=bajo`
- [ ] Búsqueda por filtros complejos ("patrón bisagra + SSC alto + impacto medio") funciona

---

### 3.2. Catálogo de Deportes y Acciones Deportivas
**Objetivo**: Crear catálogo universal de deportes y acciones para mapeo N:M con ejercicios.

**Entidades a crear**:

#### A. Tabla `sport` (catálogo jerárquico)
```sql
CREATE TABLE public.sport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR UNIQUE NOT NULL, -- p.ej. 'HYROX', 'CROSSFIT'
  name VARCHAR NOT NULL,
  parent_id UUID REFERENCES public.sport(id), -- jerarquía (Running → Road/Track/Trail)
  family VARCHAR, -- 'strength', 'endurance', 'team', 'combat', etc.
  environment VARCHAR, -- 'indoor', 'outdoor', etc.
  contact_level INT, -- 0=none, 1=limited, 2=full
  implements VARCHAR[], -- ['barra', 'balón', 'ergómetro']
  aliases VARCHAR[] -- sinónimos
);
```

#### B. Tabla `sport_action` (acciones universales)
Ejemplos (según `newfeatures.md §15.2`):
- `ACT-ACC-01`: Aceleración (0-30 m)
- `ACT-SPD-01`: Sprint velocidad máxima
- `ACT-COD-01`: Cambio de dirección 45-90°
- `ACT-JMP-01`: Salto vertical (CMJ)
- `ACT-LFT-OLY-01`: Snatch
- `ACT-CARRY-01`: Farmers carry
- `ACT-SLED-01`: Sled push
- `ACT-RUN-THR`: Running tempo/umbral
- etc. (ver anexo B de newfeatures.md para lista completa)

```sql
CREATE TABLE public.sport_action (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR UNIQUE NOT NULL, -- 'ACT-ACC-01'
  name VARCHAR NOT NULL,
  family VARCHAR, -- 'locomoción', 'COD/agilidad', 'salto/SSC', 'fuerza', 'metcon', etc.
  description_operational TEXT,
  kpi_examples VARCHAR[], -- ['30m tiempo', '10m split']
  risk_flags VARCHAR[] -- ['impacto alto', 'complejidad alta']
);
```

#### C. Tabla `sport_action_weight` (qué acciones pide cada deporte)
```sql
CREATE TABLE public.sport_action_weight (
  sport_id UUID REFERENCES public.sport(id),
  action_id UUID REFERENCES public.sport_action(id),
  weight DECIMAL(3,2) CHECK (weight >= 0 AND weight <= 1), -- 0.25 = 25%
  notes TEXT,
  PRIMARY KEY (sport_id, action_id)
);
```
Ejemplo: HYROX pondera:
- `ACT-RUN-BASE`: 0.25 (carrera aeróbica)
- `ACT-RUN-THR`: 0.20 (umbral)
- `ACT-CARRY-01`: 0.10 (carries)
- `ACT-SLED-01`: 0.10 (sled push)
- etc.

#### D. Tabla `exercise_action_affinity` (qué tan útil es un ejercicio para una acción)
```sql
CREATE TABLE public.exercise_action_affinity (
  exercise_id UUID REFERENCES public.exercise(id),
  action_id UUID REFERENCES public.sport_action(id),
  affinity INT CHECK (affinity >= 0 AND affinity <= 3), -- 0=no relevante, 3=altamente relevante
  evidence_type VARCHAR, -- 'curado' / 'inferido'
  PRIMARY KEY (exercise_id, action_id)
);
```

#### E. Tabla `exercise_sport` (mapeo N:M con scoring)
```sql
CREATE TABLE public.exercise_sport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES public.exercise(id),
  sport_id UUID REFERENCES public.sport(id),
  specificity_band VARCHAR CHECK (specificity_band IN ('GPE', 'SPE', 'SDE', 'CE')), -- General/Specific/Special/Competitive
  transfer_score INT CHECK (transfer_score >= 0 AND transfer_score <= 100),
  role_in_sport VARCHAR, -- 'principal', 'accesorio', 'técnica', 'prehab'
  priority_weight DECIMAL(3,2),
  athlete_level_min VARCHAR,
  contraindications_in_sport TEXT[],
  replacement_map UUID[], -- IDs de ejercicios sustitutos
  justification_note TEXT,
  reference_links TEXT[]
);
```

**Cálculo de `transfer_score`** (según `newfeatures.md §9.3`):
```
transfer_score = (
  similitud_vector_plano * 0.25 +
  region_acentuada * 0.20 +
  dinamica_esfuerzo * 0.15 +
  tiempo_produccion_fuerza * 0.20 +
  regimen_SSC_impacto * 0.10 +
  restricciones_tecnicas * 0.10
) * 100

+ modificador_banda_especificidad (GPE=0.85, SPE=1.0, SDE=1.1, CE=1.2)
- penalizaciones (complejidad vs nivel, impacto vs fatiga)
```

**Catálogo inicial** (carga masiva):
- **Deportes**: cargar desde `newfeatures.md §14` (HYROX, CrossFit, Halterofilia, Powerlifting, Running, Ciclismo, Natación, etc.)
- **Acciones**: cargar desde `newfeatures.md §15.2` (~60 acciones universales)
- **Pesos por deporte**: perfiles pre-configurados (HYROX, CrossFit, Halterofilia, Powerlifting, Running según §9.7)

**Estimación**: 7-9 días (entidades DB + carga inicial + UI de curación)

**Criterio de éxito**:
- [ ] Deporte "HYROX" tiene 12 acciones con pesos sumando ~1.0
- [ ] Ejercicio "Sled push" tiene alta afinidad a `ACT-SLED-01` (affinity=3)
- [ ] Búsqueda "ejercicios para HYROX, fase intensificación" devuelve top 10 por `transfer_score`

---

### 3.3. Motor de Recomendación con Scoring Automático
**Objetivo**: Al construir sesión, sugerir ejercicios ordenados por relevancia al deporte/fase/objetivo.

**Algoritmo** (según `newfeatures.md §9.9`):
```
para cada ejercicio en catálogo:
  action_score = Σ (sport_action_weight[acción] * exercise_action_affinity[acción])
  normalizar a 0-100
  
  modificador_banda = (GPE: 0.85, SPE: 1.0, SDE: 1.1, CE: 1.2)[ejercicio.specificity_band]
  
  penalizaciones = 0
  si ejercicio.skill_complexity > nivel_atleta: penalizaciones -= 20
  si ejercicio.impact_level = alto AND (fatiga_alta OR dolor): penalizaciones -= 30
  si ciclo_menstrual_activo AND sintomas AND ejercicio.SSC_level = alto: penalizaciones -= 25
  
  transfer_score_final = (action_score * modificador_banda) + penalizaciones
  
ordenar ejercicios por transfer_score_final DESC
aplicar constraints (balance empuje-tracción, no duplicar patrón, equipamiento disponible)
devolver top N con explicación (acciones cubiertas, capacidades objetivo, razón)
```

**UI de Recomendación**:
- Card de ejercicio con badge de `transfer_score` (color-coded: verde >80, amarillo 60-80, gris <60)
- Tooltip con explicación: "Este ejercicio cubre: aceleración (0.25), cambio de dirección (0.15). Apropiado para fase de desarrollo, nivel intermedio."
- Opción de "forzar" ejercicio no recomendado (con warning)

**Estimación**: 5-6 días (algoritmo + UI + tests)

**Criterio de éxito**:
- [ ] Para HYROX, fase intensificación, nivel intermedio: "Sled push" aparece en top 3
- [ ] Si atleta tiene dolor rodilla, "Box jumps" recibe penalización y baja en ranking
- [ ] Si falta equipamiento (barra), "Sentadilla barra" no aparece; sugiere "Sentadilla goblet"

---

### 3.4. Reglas de Sustitución Equivalente
**Objetivo**: Cuando falta equipamiento o hay restricción, sugerir variantes sin perder estímulo.

**Jerarquía de sustitución** (según `newfeatures.md §9.4`):
1. Mismo patrón + mismo vector + misma cualidad
2. Mismo patrón + misma cualidad (vector cercano)
3. Patrón cercano (p. ej., sentadilla → zancada) + misma cualidad
4. Si no hay equivalente, sustituir por trabajo de apoyo (GPE) con menor fatiga y registrar desviación

**Ejemplo**:
- **Ejercicio original**: Sentadilla barra (patrón: sentadilla, vector: vertical, cualidad: fuerza máxima, equipamiento: barra+rack)
- **Falta**: barra
- **Sustitutos** (por prioridad):
  1. Front Squat kettlebell (mismo patrón, mismo vector, misma cualidad, equipamiento: KB)
  2. Goblet squat (mismo patrón, mismo vector, cualidad: fuerza-resistencia, equipamiento: DB/KB)
  3. Zancada búlgara (patrón cercano, vector mixto, cualidad: fuerza)

**Implementación**:
- Poblar `replacement_map` en `exercise_sport` (curado manual top N ejercicios)
- Algoritmo automático: filtrar por `movement_pattern`, `force_vector`, `primary_capability`, `equipamiento disponible`
- UI: botón "Sustituir" en ejercicio → modal con opciones ordenadas por similitud
- Logging de sustituciones para aprendizaje incremental

**Estimación**: 3-4 días

**Criterio de éxito**:
- [ ] Falta barra → sistema sugiere "Goblet squat" para "Sentadilla barra"
- [ ] Atleta con dolor hombro → sistema sugiere variante de bajo impacto para "Press vertical"

---

## Fase 4: Biblioteca de Conocimiento y Gestión de Templates (Ecosistema)
**Objetivo**: Centralizar documentos técnicos (PDFs, Excels) y habilitar import/export masivo de planes.

### 4.1. Repositorio de Documentos
**Funcionalidades**:
- **Upload de archivos**: PDF, DOCX, XLSX (límite: 50MB)
- **Metadatos**: autor, año, deporte, tags, versión, visibilidad (privado/equipo/global)
- **Vista previa**: PDF inline (React PDF Viewer)
- **Versionado**: historial de versiones y notas de cambio
- **Vinculación**: asociar a ejercicios, métodos, planes (`document_link` tabla N:M)
- **Permisos**: Superadmin/Admin ven global+empresa; Coach ven empresa; Athlete NO acceden

**Implementación en DB**:
- **[NEW]** Tabla `document`: `id`, `title`, `file_url` (Supabase Storage), `file_type`, `author`, `year`, `sport_id`, `tags`, `version`, `visibility`, `company_id`, `uploaded_by`
- **[NEW]** Tabla `document_link`: `document_id`, `linked_entity_type` (exercise/method/plan), `linked_entity_id`

**Estimación**: 4-5 días (upload + storage + viewer + links)

**Criterio de éxito**:
- [ ] Coach sube PDF "Protocolo test 1RM" y lo vincula a ejercicios de fuerza
- [ ] Athlete NO ve biblioteca de documentos
- [ ] Admin ve documentos de su empresa, no de otras

---

### 4.2. Importador/Exportador Excel
**Objetivo**: Permitir carga masiva de planes desde Excel y exportación para uso offline.

**Importador**:
- Upload de XLSX con estructura:
  - Columnas: `semana`, `dia`, `sesion`, `ejercicio`, `sets`, `reps`, `intensidad` (%1RM/RIR/zona), `descanso`, `notas`
- Wizard de mapeo dinámico (usuario selecciona qué columna es qué)
- Validación: ejercicios existen en catálogo (o crear temporales), intensidad en rango válido
- Preview de plan antes de importar
- Opción: guardar como template reutilizable

**Exportador**:
- Seleccionar plan → generar XLSX con formato estándar (hojas por semana o por deporte)
- Incluir cálculos automáticos: zonas FC/ritmo/potencia, %1RM, tonelaje semanal
- Compatibilidad: múltiples deportes (hojas separadas por running/erg/strength)

**Plantillas iniciales** (semillas):
- "Fuerza Máxima 12 semanas" (Acumulación → Transición → Deload → Intensificación → Taper/Test)
- "HYROX 8 semanas" (Base aeróbica → Específico → Peak)
- "CrossFit 6 semanas" (Skill + Fuerza + Metcon balanceado)

**Implementación**:
- Librería: `xlsx` (Node) para parsing/generación
- Tabla `import_log` para auditoría (qué se importó, cuándo, por quién)

**Estimación**: 6-7 días (import + export + templates + validaciones)

**Criterio de éxito**:
- [ ] Coach importa Excel de 12 semanas y obtiene plan completo en Kronthor
- [ ] Coach exporta plan de atleta y lo comparte vía email (XLSX adjunto)
- [ ] Template "Fuerza Máxima 12 sem" disponible en library

---

## Fase 5: Registro, Feedback y Analítica (Cierre del Bucle)
**Objetivo**: Capturar ejecución real, bienestar diario, y generar visualizaciones de progreso.

### 5.1. Logging de Sesiones (Athlete)
**UI**:
- Vista de sesión del día con lista de ejercicios
- Por ejercicio: checkboxes para cada serie + inputs para carga, reps, RIR/RPE
- Opciones: video upload (opcional), notas por ejercicio
- Al finalizar sesión: registro de duración, sRPE (RPE × minutos), satisfacción (1-10), cumplimiento del objetivo (sí/parcial/no)

**Implementación en DB**:
- **[NEW]** Tabla `session_log`: `session_id`, `athlete_id`, `completed_at`, `duration_min`, `sRPE`, `satisfaction`, `objective_met`, `notes`
- **[NEW]** Tabla `exercise_log`: `session_log_id`, `exercise_id`, `set_number`, `reps`, `load_kg`, `RIR`, `RPE`, `notes`, `video_url`

**Estimación**: 5-6 días

**Criterio de éxito**:
- [ ] Atleta marca 3 series de sentadilla (100kg × 5 @ RIR 2) en <2 min
- [ ] sRPE se calcula automáticamente (RPE 8 × 60 min = 480)

---

### 5.2. Bienestar Diario y Check-in Semanal
**Bienestar Diario** (30-60 s):
- **Preguntas**: sueño (1-10), energía (1-10), estrés (1-10), DOMS (0-10), dolor (sí/no + ubicación)
- **Ciclo menstrual** (si activado): inicio/fin de periodo + severidad de síntomas (bajo/moderado/alto)
- **Privacidad**: opción de marcar respuestas como "privadas" (no compartidas con coach)

**Check-in Semanal** (domingo o lunes):
- Resumen automático: sesiones completadas, carga acumulada, bienestar promedio
- Si coach está asignado: propuesta de semana siguiente (generada por algoritmo de progresión)
- Coach revisa, ajusta, aprueba → publicación a atleta

**Implementación en DB**:
- **[NEW]** Tabla `daily_wellness`: `athlete_id`, `date`, `sleep_score`, `energy_score`, `stress_score`, `doms_score`, `pain_areas`, `is_private`
- Reutilizar `weekly_checkin` (ya definida en Fase 2.2)

**Estimación**: 4-5 días

**Criterio de éxito**:
- [ ] Atleta completa bienestar diario en <60 s
- [ ] Coach ve bienestar agregado (no detalles privados)
- [ ] Atleta con ciclo menstrual activo puede registrar inicio de periodo; sistema ajusta próxima semana

---

### 5.3. Analítica y Visualizaciones
**Dashboards**:
- **Atleta**:
  - Gráfica de 1RM estimado por patrón (sentadilla, banca, peso muerto)
  - Tonelaje semanal (barras)
  - Tiempo en zonas (pie chart para resistencia)
  - PRs timeline
  - Bienestar vs carga (scatter plot)
- **Coach**:
  - Agregados de equipo (adherencia promedio, carga semanal, tests)
  - Comparativas de atletas (tabla con métricas clave)
  - Alertas de fatiga (lista de atletas en rojo)
- **Company Admin**:
  - Métricas de negocio (usuarios activos, sesiones completadas/mes)
  - Tests promedio por deporte

**Reportes Exportables**:
- **PDF de rendimiento** (atleta): portada + resumen de 4 semanas + gráficas + tabla de PRs
- **XLSX de analítica** (coach/admin): datos crudos para análisis externo

**Implementación**:
- Librerías: `recharts` (gráficas), `jsPDF` + `html2canvas` (PDF export)
- Queries optimizadas (índices en `athlete_id`, `date`)

**Estimación**: 6-7 días

**Criterio de éxito**:
- [ ] Atleta ve gráfica de 1RM estimado subiendo de 100kg a 120kg en 12 semanas
- [ ] Coach ve alerta: "Atleta X tiene fatiga alta (sRPE +30% vs baseline)"
- [ ] PDF exportado incluye gráficas legibles

---

## Fase 6: Integraciones y Wearables (Opcional, Futuro)
**Objetivo**: Enriquecer datos con fuentes externas (Garmin, Strava, Apple Health).

**Integraciones iniciales**:
- **Garmin Connect**: import de sesiones de running/ciclismo (FC, ritmo, potencia, elevación)
- **Strava**: sincronización de actividades (distancia, tiempo, elevación)
- **Apple Health / Google Fit**: FC reposo, HRV, sueño (si disponible)

**Implementación**:
- OAuth 2.0 para autenticación con servicios externos
- Webhooks para sincronización automática
- Tabla `external_activity`: `athlete_id`, `source` (garmin/strava), `activity_id`, `type`, `data` (JSONB), `synced_at`

**Estimación**: 8-10 días (por integración)

**Criterio de éxito**:
- [ ] Atleta conecta Garmin → sesiones de running aparecen automáticamente en calendario
- [ ] FC de sesión se importa y se compara con zona prescrita

---

## Resumen de Fases y Estimaciones

| Fase | Nombre | Duración Estimada | Bloqueantes |
|------|--------|-------------------|-------------|
| **1.1** | Fundamentos de Seguridad y Roles | 5-7 días | Ninguno (CRÍTICO, inicio inmediato) |
| **1.2** | Wizard de Onboarding Multi-Rol | 6-8 días | Fase 1.1 (requiere roles) |
| **1.3** | Gestión de Equipos y Asignaciones | 4-5 días | Fase 1.1 |
| **1.4** | Dashboard Adaptativo por Rol | 4-5 días | Fase 1.1, 1.2 |
| **2.1** | Calendario y Constructor de Sesiones | 8-10 días | Fase 1.1 (requiere permisos) |
| **2.2** | Algoritmo de Progresión y Auto-regulación | 10-12 días | Fase 2.1 |
| **2.2.4** | Algoritmos Operativos Adicionales (Accesorios + vVO2) | 7-9 días | Fase 2.2 |
| **2.3** | Plantillas de Mesociclo + Seeds (estudio_previo) | 7-9 días | Fase 2.1 |
| **2.4** | Reglas de Compatibilidad Fuerza + Metcon | 3-4 días | Fase 2.1 |
| **3.1** | Re-estructuración de Ejercicio (Taxonomía) | 4-5 días | Fase 1.1 |
| **3.2** | Catálogo de Deportes y Acciones | 7-9 días | Fase 3.1 |
| **3.3** | Motor de Recomendación con Scoring | 5-6 días | Fase 3.2 |
| **3.4** | Reglas de Sustitución Equivalente | 3-4 días | Fase 3.2 |
| **4.1** | Repositorio de Documentos | 4-5 días | Fase 1.1 |
| **4.2** | Importador/Exportador Excel | 6-7 días | Fase 2.1 |
| **5.1** | Logging de Sesiones | 5-6 días | Fase 2.1 |
| **5.2** | Bienestar Diario y Check-in Semanal | 4-5 días | Fase 2.2 |
| **5.3** | Analítica y Visualizaciones | 6-7 días | Fase 5.1 |
| **6.x** | Integraciones Wearables (opcional) | 8-10 días/integración | Fase 5.2 |

**Total estimado para MVP (Fases 1-5)**: ~97-120 días (~4.5-5.5 meses con 1 dev full-time)

**Cambios v3.0**: +7-11 días por integración de `estudio_previo.md` (templates seeds, algoritmos operativos, tabla intensity_zone)

---

## Criterios de Aceptación del MVP

### MVP Mínimo (Fases 1-2)
- [x] Sistema multi-tenant seguro (RLS funcionando)
- [x] 3 roles operativos (Superadmin, Coach, Athlete)
- [x] Onboarding completo por rol
- [x] Calendario semanal con constructor de sesiones
- [x] Recomendaciones básicas por deporte
- [x] Logging de sesiones y bienestar
- [x] Progresión semanal con reglas 3:1

### MVP Completo (Fases 1-5)
- [x] Todo lo anterior
- [x] Taxonomía avanzada de ejercicios
- [x] Motor de recomendación con scoring automático
- [x] Templates de mesociclo (12 semanas)
- [x] Reglas de compatibilidad fuerza+metcon
- [x] Import/Export Excel
- [x] Analítica con gráficas (1RM, tonelaje, zonas)
- [x] Reportes PDF exportables

---

> [!CAUTION]
> **Regla crítica de desarrollo**: NO comenzar Fase 2 (Planificación) sin completar Fase 1.1 (Seguridad). Cualquier plan creado sin RLS adecuado generará vulnerabilidades de seguridad que requerirán refactorización masiva.

---

## Próximos Pasos Inmediatos

1. **Revisión de esta roadmap** por stakeholders (aprobación de prioridades y scope)
2. **Inicio de Fase 1.1**: crear tablas `profiles`, `companies`, `coach_athlete_assignments`
3. **Configurar políticas RLS básicas** en Supabase (exercise, training_plan, session_log)
4. **Migrar usuarios existentes** al modelo de roles (script de migración)
5. **Testing de aislamiento multi-tenant** (garantizar que Coach A no ve datos de Coach B)

**Fecha de inicio recomendada**: Inmediata (Fase 1.1 es bloqueante para todo lo demás)
