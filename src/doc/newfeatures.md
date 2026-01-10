NUEVAS FUNCIONALIDADES
## 7. Usuarios, Roles y Setup Inicial (Onboarding)

El sistema debe soportar un modelo multi-rol (coach/atleta/equipo) con onboarding guiado para traducir objetivos y contexto real (deporte, disponibilidad, equipamiento y nivel) en una planificación inicial coherente.

### 7.1. Roles y permisos
- **Admin Plataforma**: Gestiona catálogos globales (ejercicios, equipamiento, capacidades, métodos) y políticas generales.
- **Entrenador (Coach)**: Crea y gestiona equipos, atletas, planes, sesiones y revisiones; puede proponer/editar ejercicios dentro del catálogo (según permisos).
- **Atleta**: Consulta y ejecuta el plan, registra sesiones (RPE, cargas, tiempos), completa cuestionarios de bienestar y tests.

### 7.2. Wizard de alta (nuevo usuario)
**Objetivo**: Reducir fricción y capturar la mínima información necesaria para generar un plan base y configurar métricas/zonas.

1. **Registro y verificación**: Email/SSO, aceptación de términos, selección de idioma y unidades (métrico/imperial).
2. **Selección de rol**: Coach (crear equipo) o Atleta (unirse a equipo por invitación/código).
3. **Perfil del atleta (si aplica)**: Edad, sexo, peso/altura, historial de lesiones y restricciones. Si el usuario es **atleta** (o el coach está registrando a un atleta), capturar también **experiencia en entrenamiento de fuerza (training age)** para clasificar automáticamente el nivel. Datos mínimos: (a) tiempo entrenando fuerza de forma **continua** (meses/años), y (b) si hubo **pausas > 3 meses sin entrenar**; en ese caso, registrar la fecha del último reinicio. **Regla de clasificación (continua)**: Principiante < 13 meses; Intermedio >= 13 meses y < 5 años; Avanzado >= 5 años. El coach puede ajustar/forzar el nivel si el contexto lo justifica (lesión, regreso tras inactividad, etc.).
4. **Ciclo menstrual y ajuste hormonal (opcional, opt-in)**: Para usuarias que menstrúan: registrar (si desea) fecha de inicio del último periodo, duración típica del sangrado y longitud promedio del ciclo (si la conoce), además de configuración de privacidad. Esta información alimenta la capa de auto-regulación y las sugerencias de ajuste semanal/sesión (ver 8.2), con posibilidad de desactivar y borrar datos en cualquier momento.
5. **Deporte(s) y objetivo(s)**: Selección de deporte principal y secundarios (p. ej., HYROX, CrossFit, running, natación), meta (rendimiento, salud, recomposición), y eventos objetivo (fecha/prioridad).
6. **Disponibilidad semanal**: Días por semana, ventanas de tiempo, preferencia AM/PM, y días fijos de descanso.
7. **Equipamiento disponible**: Selección desde el módulo `equipment` (gimnasio completo, barras, mancuernas, máquinas, ergómetros, etc.).
8. **Datos basales y tests iniciales** (según deporte): HRmáx/FC reposo, umbrales (LT/VT), vVO2max/ritmos, FTP (ciclismo), estimación de 1RM (fuerza), jump metrics, o test específico (6-min/12-min, 2k row, etc.).
9. **Preferencias de planificación**: Distribución (polarizada/piramidal), énfasis (técnica, fuerza, motor), tolerancia al volumen, y nivel de auto-regulación.

**Salida del onboarding**:
- Cálculo de zonas/objetivos de intensidad (FC, ritmo, potencia o %1RM) cuando haya datos suficientes.
- Clasificación automática del nivel por experiencia en fuerza (si aplica) para ajustar templates, cargas iniciales y reglas de progresión.
- Propuesta de macroestructura (macro/meso/microciclos) y primer microciclo (semana 1).
- Checklist de “pendientes” si faltan datos (p. ej., programar test de umbral).

### 7.3. Gestión de equipos (coach)
- Invitación de atletas (link/código), asignación de deporte principal y objetivo.
- Plantillas de equipo (estándares de tests, calendario de competiciones, equipamiento típico).
- Permisos por atleta (quién puede editar, quién solo comenta/aprueba).

## 8. Motor de Planificación y Progresión Semanal

El plan debe actualizarse semanalmente mediante un bucle de feedback (registro de sesiones + bienestar + métricas) con reglas explícitas de progresión, descarga y ajuste por disponibilidad.

### 8.1. Variables que gobiernan la progresión
- **Adherencia**: % de sesiones completadas, calidad de ejecución y cumplimiento de objetivos (tiempo en zona, tonelaje, etc.).
- **Carga externa**: Volumen (min/km/metros/tonelaje), intensidad prescrita vs real (ritmo/potencia/%1RM), densidad y número de estímulos clave.
- **Carga interna**: sRPE (RPE x duración), FC media/pico, TRIMP, percepción de fatiga/DOMS.
- **Readiness (bienestar)**: Sueño, estrés, dolor, motivación; HRV y FC reposo si hay wearable.
- **Marcadores de rendimiento**: Tests periódicos y PRs (p. ej., 5k, 2k row, 1RM estimado, intervalos estándar).
- **Training age (fuerza, si aplica)**: meses/años de entrenamiento continuo (sin pausas > 3 meses). Se usa para estimar tolerancia a volumen/intensidad y seleccionar plantillas por nivel.
- **Restricciones**: Lesiones, molestias, viajes, disponibilidad real de equipamiento.

### 8.2. Regla general de avance (microciclo a microciclo)
- **Progresión por bloques**: 3:1 (3 semanas de carga + 1 semana de descarga) o 4:1 según deporte y nivel.
- **Progresión primaria**: Aumentar 1 variable por semana (volumen o intensidad o densidad), no todas a la vez.
- **Descarga automática**: Si el índice de fatiga supera umbrales (p. ej., baja adherencia + peor bienestar + caída de rendimiento), reducir volumen 20-40% y mantener intensidad técnica.
- **Auto-regulación intra-sesión**: Ajuste por RIR/RPE (fuerza) o por FC/potencia/ritmo (resistencia) para mantener el estímulo sin exceder fatiga.
- **Ajuste por ciclo menstrual (opcional y auto-regulado)**: Para usuarias que menstrúan, el sistema puede aplicar una “capa” de ajuste semanal y/o por sesión basada en fase estimada del ciclo y el reporte subjetivo de síntomas/readiness. La regla es: **si se sienten bien, se sigue la progresión estándar**; si reportan malestar, se aplica una reducción protectora y se prioriza seguridad técnica.
- **Reducción protectora (cuando hay síntomas moderados/altos o baja energía)**: reducir volumen total ~10-30% (o 1-2 series por patrón), evitar picos de intensidad y **evitar/limitar movimientos altamente explosivos o de alto impacto** (p. ej., pliometría intensa, sprints máximos, levantamientos olímpicos pesados/rápidos). Sustituir por trabajo técnico, fuerza submáxima controlada (tempo/isometrías), aeróbico Z1-Z2 y movilidad.
- **Escalamiento por sensaciones**: si durante la sesión el RPE sube de lo esperado o aparece dolor/molestia relevante, el atleta puede cambiar a la variante “Low impact/Technique”, recortar bloques accesorios o convertir la sesión a recuperación activa; el coach puede definir reglas por deporte (p. ej., endurance: bajar intensidad; fuerza: bajar volumen y velocidad).
- **Nota de producto**: la adaptación por ciclo no debe asumirse por sexo; debe activarse explícitamente por la usuaria (opt-in) y poder desactivarse en cualquier momento.

### 8.2.1. Periodización por fases (mesociclo de 12 semanas - ejemplo Fuerza Máxima)
Además de las reglas de avance semana a semana (microciclo), el sistema debe soportar plantillas de mesociclo (fases) para estructurar una progresión de 12 semanas. Estas fases se pueden asignar automáticamente según objetivo, nivel, frecuencia y feedback, o bien seleccionarse desde un catálogo de templates (importables desde Excel).
**Plantilla clásica de 12 semanas (fuerza máxima, intermedio):**
- **Semanas 1-4**: Acumulación (hipertrofia/técnica).
- **Semana 5**: Transición a fuerza.
- **Semana 6**: Deload activo (descarga).
- **Semanas 7-10**: Intensificación neural.
- **Semana 11**: Taper (bajar volumen, mantener intensidad y velocidad).
- **Semana 12**: Test/Peak (sesiones clave + descarga posterior).
**Reglas de ajuste del template:**
- Si el usuario reporta que “le falta masa” o tiene baja frecuencia semanal, permitir extender Acumulación a 5-6 semanas y acortar Intensificación (manteniendo 1 semana de deload y 1-2 semanas de taper/test).
- Si el usuario ya tiene buena base de masa y el cuello de botella es neural/técnico, permitir Acumulación más corta (2-3 semanas) y priorizar Intensificación.
- **Elegir Acumulación 2 semanas** (más compacta) si: ya hay buena masa para el peso, el límite es técnico/neural (trayectoria de barra, velocidad), hay pocas sesiones totales/semana (p. ej., 3x/sem) o las cargas suben rápido al tocar 80-85%.
- **Elegir Acumulación 3-4 semanas** si: falta base muscular (tríceps/erectores/cuádriceps), se progresa con 60-75% sin 'reventarse', la frecuencia es baja y se necesitan más exposiciones al patrón, o se busca robustecer tejidos (tendón/ligamento) antes de intensificar.

**Parámetros de referencia por fase (semilla inicial, editable):**
Fase	Duración	% 1RM (referencia)	Series	Reps	Descanso	Accesorios (n)	Notas / criterio de transición
Acumulación (hipertrofia/técnica)	3-6 sem (típico 4)	60-75%	3-5	6-12	90-150 s	2-4	Accesorios 8-12 (máquinas) o 10-15 (unilateral); tempo 2-0-2 o 3-1-1; pasar si sube RPE/DOMS o hay estancamiento.
Transición a fuerza	1-2 sem (típico 1)	75-85%	4-5	4-5	2-3 min	1-2	Accesorios 6-8; tempo 2-0-1; pasar cuando 4-6 reps sólidas y un single ~85% se ve rápido.
Deload activo	1 sem	60-75%	2-3	3-4	2-3 min	0-2	Accesorios 10-12 ligero; tempo 2-0-2; objetivo: recuperar (sensación de frescura en 3-5 días).
Intensificación neural	2-4 sem (típico 4)	87-93% (incluye clusters)	4-6	1-3 (o 2+2+2)	3-5 min	1-2	Accesorios 4-6 moderados (o 6-8 ligeros); tempo 1-0-1 (rápidos); pasar si cae velocidad/calidad o se completa el bloque.
Taper/Test	1-2 sem	60-73% (taper) + rampa a singles (test)	2-3	2-4 (taper)	2-3 min (taper)	0-2	Accesorios 8-12 ligeros, controlados; objetivo: bajar fatiga y consolidar rendimiento; cierre con test y transición al siguiente ciclo.

### 8.2.2. Reglas de compatibilidad (fuerza + metcon + interválico) para evitar interferencia
Cuando el usuario combine fuerza con acondicionamiento (p. ej., CrossFit/HYROX), el motor debe aplicar reglas base para reducir interferencia y riesgo de fatiga excesiva (siempre con override del coach/atleta):
- **Orden recomendado en la sesión**: Calentamiento -> levantamiento principal -> accesorios -> metcon (si aplica) -> descarga/movilidad. Evitar metcon antes de la fuerza.
- **Si hay halterofilia/técnica de potencia**: colocarla al inicio (barra rápida va 'fresca') y después la fuerza principal; no mezclarla al final de la sesión con fatiga alta.
- **No duplicar el patrón dominante** del día en el metcon (p. ej., no hacer bisagra pesada en metcon el mismo día de peso muerto).
- **Separación mínima**: 24-48 h entre una sesión dura de pierna (sentadilla/peso muerto pesado) y un metcon exigente de piernas.
- **Ejemplos de compatibilidad por día (referencial)**:
  - Día sentadilla: sí a monoestructural suave (BikeErg/remo) o tren superior; evitar thrusters, wall-balls, box jumps duros y alto impacto si hay fatiga.
  - Día banca/press: sí a metcon con pierna ligera + tirón superior; evitar alto volumen al fallo de empuje (HSPU/dips/push-ups) si compromete el levantamiento.
  - Día peso muerto: sí a metcon sin cadena posterior pesada; evitar swings pesados, GHD sit-ups a volumen y bisagra explosiva si hay fatiga.
- **Dosis de interválico**: como default, 2 'toques' por semana (ajustable por nivel):
  - Aláctico (potencia): sprints 10-15 s con 45-60 s suave (1:3-1:4), ideal tras halterofilia/técnica.
  - Glicolítico corto: 30-60 s con 1:1, preferible en día de tren superior.
  - Aeróbico Z2: 20-30 min continuo como recuperación posterior a sentadilla/peso muerto.

### 8.2.3. Accesorios y progresión (semilla para templates de fuerza)
Para que el generador de sesiones produzca planes consistentes (y editables), se propone estandarizar reglas de accesorios y progresión dentro del template:
- **Selección de accesorios**: (a) apoyar el patrón del día (sentadilla, banca, bisagra, press), (b) atacar el eslabón débil (cuádriceps, tríceps, erectores, dorsales, core) y (c) priorizar ejercicios de alto estímulo y baja fatiga (mancuernas, máquinas, unilaterales, tempos controlados).
- **Dosis recomendada**: 2-3 accesorios por sesión (máximo 3), 3-4 series cada uno; rango 6-12 reps (a veces 10-15), RIR 1-3 (RPE 7-9), descanso 60-90 s.
- **Progresión del accesorio (doble progresión)**: subir repeticiones dentro del rango objetivo; al llegar al tope del rango en todas las series, aumentar 2.5-5% la carga (o el siguiente salto disponible) y reiniciar en el rango bajo.
- **Matriz rápida (referencial)**:
  - Día sentadilla (quad/glúteo): split squat búlgaro, prensa 45°, hack squat, leg extension, sentadilla pausada (2 s). Core: anti-extensión/anti-rotación (dead bug, Pallof).
  - Día banca (empuje + estabilidad escapular): DB bench/incline, dips asistidos/lastre (si aplica), remo cable, face pulls/bandas.
  - Día peso muerto (cadena posterior): RDL, hip thrust, curl femoral, rows (lats), carries (farmer), bird-dogs.
**En el producto**: estas reglas deben vivir en el template como parámetros editables (rangos, RIR/RPE, número de accesorios) y como recomendaciones automáticas en el constructor.
**Implementación en producto**: estas reglas deben vivir como 'constraints' del generador de sesiones (constructor) y como validaciones del calendario (alertas cuando se programen estímulos incompatibles).
### 8.3. Qué “decide” la IA/algoritmo vs qué decide el coach
- **Sistema**: propone y re-calcula zonas, sugiere progresiones, detecta banderas rojas (fatiga, lesión), genera alternativas por falta de equipamiento y estima carga semanal.
- **Coach**: aprueba cambios, modifica prioridades (p. ej., fuerza vs motor), ajusta por contexto no capturado (competencias, estrés laboral) y valida técnica.

### 8.4. Check-in semanal (UX)
Flujo recomendado (domingo o día previo a la semana):
1. Cuestionario breve (2-3 min): sueño, fatiga, dolor, estrés, motivación, tiempo disponible (y, si aplica, estado del ciclo menstrual/síntomas para ajustar carga/impacto).
2. Resumen automático: carga real vs planificada, tendencias (4 semanas), y “señales” (mejora/estancamiento).
3. Propuesta de semana siguiente: sesiones clave, objetivo de volumen, y cambios puntuales.
4. Aprobación del coach y publicación al atleta.

## 9. Clasificación de Ejercicios por Deporte y Asociación

Objetivo: permitir que el sistema recomiende y construya sesiones por deporte de forma consistente, evitando la lógica rígida de “un ejercicio = un deporte”. La solución se basa en (a) una taxonomía del ejercicio por capas, y (b) un perfil de demanda por deporte que habilite una matriz ejercicio↔deporte con nivel de transferencia.

### 9.0. Marco científico-operativo (especificidad y transferencia)
- Principio rector: la selección de ejercicios se prioriza por el grado de transferencia al gesto competitivo y sus demandas mecánicas/energéticas.
- Se adopta un esquema dual para operativizar la transferencia:
  - **Banda de especificidad (4 niveles)**: General Preparatory (GPE), Specific Preparatory (SPE), Special Development (SDE) y Competitive Exercise (CE).
  - **Score de correspondencia dinámica (0-100)**: puntaje calculado por similitud con el gesto del deporte, a partir de criterios biomecánicos y de velocidad de ejecución (ver 9.3).

### 9.1. Taxonomía del ejercicio (capas obligatorias)
Para cada ejercicio (`exercise`) se deben capturar dimensiones que permitan (1) filtrado preciso, (2) sustituciones equivalentes, y (3) asociación multi-deporte con evidencia/justificación.

**Capa A - Estructura biomecánica (OBLIGATORIA):**
- Patrón de movimiento principal (`movement_pattern`): sentadilla, bisagra/hinge, zancada/lunge, empuje horizontal, empuje vertical, tracción horizontal, tracción vertical, locomoción, rotación, anti-rotación, anti-flexión, carry, salto-aterrizaje, cambio de dirección (COD), lanzamiento/throw, brace/isométricos.
- Articulación/segmento dominante (`dominance`): rodilla, cadera, tobillo, columna, hombro, codo; + región acentuada (p. ej., cadera-extensión, rodilla-extensión).
- Plano(s) y vector(es) (`plane`, `force_vector`): sagital/frontal/transversal; vector vertical/horizontal/rotacional (1 o varios).
- Lateralidad (`laterality`): bilateral, unilateral, alternado, asimétrico, mixto.
- Cadena cinética (`kinetic_chain`): abierta/cerrada/mixta.
- Rango de movimiento (`ROM_profile`): corto/medio/largo + presencia de pausa/isometría.
- Velocidad e intención (`velocity_intent`): lenta-controlada, moderada, explosiva/ballística; + restricción técnica (p. ej., tempo 3-1-1).
- Ciclo estiramiento-acortamiento (`SSC_level`): ninguno, bajo, medio, alto.
- Impacto (`impact_level`): bajo, medio, alto (por contacto/aterrizajes).
- Complejidad técnica (`skill_complexity`): baja, media, alta; prerequisitos (p. ej., movilidad de tobillo/hombro).
- Equipamiento (`exercise_equipment`): lista N:M + condición mínima (p. ej., barra + discos + rack).

**Capa B - Cualidad objetivo (OBLIGATORIA):**
- Capacidad principal (`primary_capability`): fuerza máxima, hipertrofia, potencia, RFD, fuerza-resistencia, velocidad, agilidad/COD, estabilidad, movilidad, acondicionamiento aeróbico, umbral, VO2max, capacidad anaeróbica, habilidad técnica/skill.
- Estímulo predominante (`stress_profile`): mecánico / metabólico / neurológico (bajo-medio-alto).
- Zona de esfuerzo estimada (cuando aplique): %1RM / RIR-RPE; o zona por FC/ritmo/potencia (Z1-Z6) para bloques de motor/monoestructural.

**Capa C - Uso en sesión y periodización (RECOMENDADA):**
- Rol típico (`role_default`): principal, accesorio, técnica/skill, preparación (warm-up), prehab/rehab, acondicionamiento, finisher.
- Fases compatibles (`phase_fit`): base, desarrollo, intensificación, pico/peak, taper, retorno (rehab/return-to-play).
- Población y nivel mínimo (`athlete_level_min`): principiante/intermedio/avanzado; contraindicaciones y banderas rojas (dolor, historial lesión).

### 9.2. Perfil de demanda por deporte (Sport Demand Profile)
Cada deporte y/o modalidad debe contar con un `sport_demand_profile` que describa de manera estandarizada qué “pide” la disciplina. Esto habilita recomendaciones congruentes y comparables entre deportes.

**Campos propuestos en `sport_demand_profile` (por deporte o modalidad):**
- Identificador: `sport_id`, `modality_id` (si aplica jerarquía).
- Entorno: indoor/outdoor, superficie (pista/carretera/césped/arena/hielo/agua), implementación (ergómetro, barra, balón, etc.).
- Tipo de competencia: individual/equipo; contacto (0 = none, 1 = limited, 2 = full).
- Duración típica de esfuerzos y evento: rango (segundos-minutos-horas) y patrón work:rest (si aplica).
- Acciones determinantes (`action_profile` con pesos 0-1): aceleración, velocidad máxima, RSA (repeat sprint), COD, salto-aterrizaje, lanzamiento, empuje/choque, tracción, agarre, isometrías, carries, ciclaje/locomoción, técnica específica (p. ej., brace respiratorio, transiciones).
- Vectores dominantes y unilateralidad: porcentaje relativo vertical/horizontal/rotacional + proporción uni/bilateral.
- Demandas energéticas: predominio aeróbico/umbral/anaeróbico; estímulos clave por semana (p. ej., 2 sesiones de alta intensidad, 1 de umbral).
- Capacidades limitantes (top 3-5): p. ej., fuerza relativa, potencia, economía, tolerancia al lactato, robustez de tejido.
- Tests recomendados y KPIs: lista de tests (p. ej., 2k row, 5k, 1RM estimado, CMJ) y métricas operativas (TSS/TRIMP/sRPE, tonelaje, velocidad de barra si existe).

### 9.3. Modelo de asociación ejercicio↔deporte (matriz y scoring)
El vínculo `exercise_sport` debe ser N:M y permitir que un mismo ejercicio sea relevante en múltiples deportes con roles distintos.

**Campos propuestos en `exercise_sport`:**
- `sport_id` / `modality_id` / `phase_id` (opcional) / `exercise_id`
- **Banda de especificidad** (`specificity_band`): GPE / SPE / SDE / CE
- **Score de transferencia** (`transfer_score` 0-100): calculado o curado (admin/coach), con trazabilidad
- `role_in_sport`: principal, accesorio, técnica/skill, prehab/rehab, acondicionamiento
- `priority_weight` (0-1): peso para el recomendador
- `athlete_level_min` y prerequisitos
- `contraindications_in_sport`: reglas (p. ej., evitar impacto alto en semanas de taper o en dolor patelofemoral)
- `replacement_map`: lista de sustitutos preferidos (misma cualidad/patrón)
- `justification_note` + `reference_links` (si existe evidencia o criterio técnico interno)

**Cálculo recomendado del `transfer_score` (operativo y explicable):**
El sistema asigna un score por similitud con el gesto/acción del deporte (o modalidad). Se recomienda un modelo ponderado (100 puntos):
- Similitud de vector y plano (0-25)
- Región acentuada y articulación dominante (0-20)
- Dinámica del esfuerzo (aceleración/desaceleración, puntos de máxima tensión) (0-15)
- Tiempo de producción de fuerza / intención de velocidad (0-20)
- Régimen muscular y SSC/impacto (0-10)
- Restricciones técnicas del deporte (agarre, rango, implemento) (0-10)

**Uso del score en el producto (reglas de negocio):**
- En el constructor, para un deporte+fase, priorizar ejercicios con mayor `transfer_score` y banda SPE/SDE; en fases tempranas, permitir mayor presencia de GPE.
- Aplicar constraints: (a) no duplicar patrón dominante, (b) cumplir balance empuje-tracción, (c) limitar impacto/SSC según fatiga y fase, (d) respetar nivel mínimo y equipamiento.

### 9.4. Reglas de recomendación y sustitución (funcionalidad clave)
- **Selección primaria**: (1) deporte/modalidad, (2) fase, (3) objetivo (capacidad), (4) nivel, (5) equipamiento, (6) restricciones (lesión/fatiga).
- **Sustitución equivalente (fallback)** cuando falta equipamiento o hay restricción:
  1) mismo patrón + mismo vector + misma cualidad;
  2) mismo patrón + misma cualidad (vector cercano);
  3) patrón cercano (p. ej., sentadilla → zancada) + misma cualidad;
  4) si no hay equivalente, sustituir por trabajo de apoyo (GPE) con menor fatiga y registrar la desviación.
- **Reglas de seguridad**: si `impact_level` alto y el usuario reporta dolor/fatiga alta, sugerir automáticamente variante de bajo impacto o técnica controlada.

### 9.5. Plantillas por deporte (cómo se consumen estas entidades)
- Cada `plan_template` debe declararse contra un `sport_id`/`modality_id` y referenciar su `sport_demand_profile`.
- Los bloques de sesión (warm-up, skill, fuerza/potencia, motor/condicionamiento, accesorios, movilidad) se parametrizan por deporte (p. ej., running prioriza fuerza de soporte + técnica de carrera; halterofilia prioriza skill de barra + fuerza específica).

### 9.6. Catálogo de deportes y modalidades (modelo y alcance)
- El catálogo debe ser **jerárquico** (p. ej., Running → Track/Road/Trail; Combat → Boxing/MMA, etc.) mediante `sport_parent_id`.
- Campos mínimos en `sport`: nombre, familia (`sport_family`), tipo (individual/equipo), entorno, contacto, implemento principal, y aliases (sinónimos).
- Se incluye un catálogo inicial amplio en el **Anexo A** para cargar el sistema desde el día 1, y el Admin podrá añadir/editar deportes y modalidades.


### 9.7. Perfiles de demanda preconfigurados (MVP - ejemplos completos)
Nota: estos perfiles sirven como “semillas” editables. El coach/admin puede ajustar pesos, tests y restricciones por población, nivel y calendario competitivo.

**HYROX (Fitness Racing - carrera + estaciones):**
- Acciones determinantes (pesos sugeridos): carrera/economía aeróbica (0.25), umbral/tolerancia a lactato (0.20), fuerza-resistencia de tren inferior (0.15), carries (0.10), empuje horizontal pesado (sled push) (0.10), tracción horizontal pesada (sled pull) (0.05), zancadas/lunges bajo fatiga (0.05), ciclaje de repeticiones (wall balls, burpee broad jumps) (0.10).
- Vectores: mixto horizontal + vertical; alta locomoción cíclica + tareas con implemento; unilateralidad media (lunges).
- Demandas energéticas: alta dependencia aeróbica (base), con repetidos picos de intensidad (umbral/anaeróbico corto) por estaciones y transiciones.
- Bloques de sesión típicos: (1) carrera Z2 + técnica, (2) tempo/umbral, (3) intervalos (VO2/anaeróbico) + transiciones, (4) fuerza-resistencia específica (trineo/carries/wall balls), (5) fuerza base (sentadilla-bisagra-empuje-tracción) con fatiga controlada.
- Tests/KPIs sugeridos: 5 km o 10 km (ritmo), intervalos estándar (p. ej., 1 km repeats), tiempo/ritmo en SkiErg y RowErg (500 m / 1 km / 2 km), performance en trineo (distancia/tiempo/carga), capacidad de wall balls (reps a estándar), “race simulation” parcial (2-4 estaciones).
- Restricciones: limitar impacto/pliometría cuando ya hay alto volumen de carrera; gestionar interferencia fuerza/intervalos con reglas de 8.2.2.

**CrossFit (mixed-modal, skill + fuerza + metcon):**
- Acciones determinantes (pesos sugeridos): fuerza máxima (0.15), potencia/barbell cycling (0.15), gimnasia (kipping/strict) (0.15), capacidad anaeróbica (0.15), umbral (0.10), base aeróbica (0.10), habilidad técnica bajo fatiga y transiciones (0.10), resistencia muscular local (0.10).
- Vectores: multi-planar; SSC e impacto variable; alta variabilidad de implementos.
- Demandas energéticas: distribución mixta; necesidad de base aeróbica para tolerar volumen + capacidad anaeróbica para esfuerzos repetidos.
- Bloques de sesión típicos: skill (barra/gimnasia) al inicio → fuerza/potencia → metcon → accesorios/prehab.
- Tests/KPIs sugeridos: 1RM/3RM en básicos (según temporada), benchmarks (Fran, Cindy, Murph, etc. si se usan), 2k row / 5k run, CMJ, habilidad específica (p. ej., T2B unbroken).
- Restricciones: controlar exposición a impacto/SSC (double unders, box jumps) y a volumen de gimnásticos de empuje (HSPU/dips) según fatiga de hombro; evitar metcon que duplique el patrón principal del día.

**Halterofilia (Weightlifting - Snatch y Clean & Jerk):**
- Acciones determinantes (pesos sugeridos): habilidad técnica de barra (0.25), potencia/aláctico (0.20), fuerza específica (front/back squat, pulls) (0.20), velocidad de movimiento (0.10), estabilidad overhead (0.10), movilidad específica (tobillo/cadera/hombro) (0.10), robustez de tejido (0.05).
- Vectores: predominio vertical; SSC bajo-medio; alta demanda de coordinación y timing.
- Demandas energéticas: esfuerzos cortos (alácticos) con descanso amplio; volumen técnico alto.
- Bloques de sesión típicos: técnica (posiciones, complejos, singles) → fuerza específica (sentadilla/pulls) → accesorios (posterior chain, core, estabilidad) → movilidad.
- Tests/KPIs sugeridos: 1RM Snatch, 1RM C&J; front/back squat; pulls (snatch/clean pull); jump metrics (CMJ/SJ) si existe; consistencia técnica (porcentaje de levantamientos válidos).
- Restricciones: la técnica y la velocidad mandan; si hay fatiga alta, priorizar singles técnicos submáximos y limitar intentos pesados fallidos.

**Powerlifting (Squat, Bench Press, Deadlift):**
- Acciones determinantes (pesos sugeridos): fuerza máxima (0.30), técnica específica por levantamiento (0.20), hipertrofia de soporte (0.15), control de fatiga y tolerancia al volumen (0.15), fuerza del tronco/bracing (0.10), estabilidad escapular y dorsales (0.10).
- Vectores: sagital predominante; SSC bajo; alta tensión mecánica; baja variabilidad de implementos.
- Demandas energéticas: baja prioridad de acondicionamiento; énfasis neural y mecánico.
- Bloques de sesión típicos: levantamiento competitivo → variante específica (pausas, tempo, variantes de agarre/stance) → accesorios (eslabones débiles) → prehab.
- Tests/KPIs sugeridos: e1RM por levantamiento, velocidad de barra (si existe), rendimiento en top single (RPE), volumen semanal por patrón, calidad técnica (depth, pausa, lockout).
- Restricciones: evitar acumulación excesiva de fatiga lumbar/isquios cuando se concentran bisagras; gestionar densidad y frecuencia de singles pesados por nivel.

**Running (carrera - road/track/trail, configurable por modalidad):**
- Acciones determinantes (pesos sugeridos): base aeróbica/economía (0.30), umbral (0.20), VO2max (0.15), técnica de carrera y rigidez elástica (0.10), fuerza de soporte (0.10), tolerancia a impacto y robustez de tejido (0.10), velocidad (0.05; más alta en pista/sprints).
- Vectores: locomoción cíclica; SSC medio-alto; impacto alto acumulativo; unilateralidad alta.
- Demandas energéticas: depende de distancia; siempre requiere base aeróbica; en distancias cortas sube el componente anaeróbico/velocidad.
- Bloques de sesión típicos: Z2/long run → tempo/umbral → intervalos (VO2) → strides/sprints cortos (según modalidad) + fuerza (2x/sem) y prehab (tobillo, pie, cadera).
- Tests/KPIs sugeridos: 3k/5k/10k o test de 6-12 min; umbral (LT/VT) si se mide; tiempos en intervalos estándar; cadencia/variabilidad de ritmo; dolor/impacto semanal (bandera).
- Restricciones: el sistema debe gestionar exposición a impacto (no apilar pliometría alta + intervalos duros + long run en 72 h); priorizar fuerza de soporte en patrones unilaterales y control excéntrico.


- **Versionado**: cambios en pesos/afinidades deben versionarse para reproducibilidad de planes históricos.
- **Aprendizaje incremental**: cada vez que el coach sustituye ejercicios, el sistema sugiere actualizar `replacement_map` y afinidades (workflow de aprobación).
- **Curación inicial**: admin define `sport_action` y completa afinidades para los ejercicios más usados (Top N).
### 9.10. Gobernanza de catálogo y calidad (necesario para escalar)

El sistema debe mostrar al coach (y opcionalmente al atleta) las 3-5 razones principales: acciones cubiertas, capacidades objetivo, y por qué el ejercicio es apropiado en fase/semana.
**Salida del recomendador (explicación)**

3) Penalizaciones por restricciones: complejidad/impacto/lesión vs nivel del atleta y fase (taper, dolor, ciclo menstrual, etc.).
2) Modificador por banda de especificidad (GPE/SPE/SDE/CE): factor multiplicador sugerido (p. ej., 0.85 / 1.00 / 1.10 / 1.20) según el objetivo del bloque (base vs peak).
1) Puntaje por acciones: `action_score = Σ (sport_action_weight * exercise_action_affinity)` normalizado a 0-100.
**Cálculo recomendado del `transfer_score` (por deporte, explicable)**

Cuando no exista curación manual, el sistema puede inferir afinidades a partir de tags biomecánicos y de cualidad (patrón, vector, SSC, régimen, implemento).
**Inferencia por reglas (MVP)**

- `exercise_id`, `sport_action_id`, `affinity` (0-3) y `evidence_type` (curado por admin / inferido por reglas).
**Entidad propuesta: `exercise_action_affinity`**
### 9.9. Afinidad ejercicio↔acción (`exercise_action_affinity`) y scoring automático de transferencia

Ejemplo: HYROX pondera alto: carrera umbral, empuje/arrastre de trineo, carries, remada/ski, zancadas con carga, wall balls; CrossFit pondera alto: gimnasia + halterofilia + capacidad metabólica mixta.
- `sport_id`, `sport_action_id`, `weight` (0-100), `notes`
Cada deporte/modalidad (y opcionalmente posición) debe contener una lista de pesos `sport_action_weight`:
**Extensión del Sport Demand Profile**

- `notes`: consideraciones (p. ej., “requiere SSC alto”, “depende de técnica”).
- `sport_action_id`, `capacity_id`, `weight` (0-3)
**Entidad propuesta: `sport_action_capacity` (mapeo acción→capacidad)**

- `risk_flags`: impacto alto, complejidad alta, demanda articular, contacto, etc.
- `kpi_examples`: métricas típicas (tiempo, distancia, potencia, repeticiones, altura, etc.).
- `description_operational`: definición clara (qué cuenta como esa acción).
- `family`: locomoción, COD/agilidad, salto/SSC, fuerza, potencia, resistencia cíclica, resistencia acíclica, implemento/skill, combate/contacto, acuático, etc.
- `id`, `code`, `name`
**Entidad propuesta: `sport_action` (catálogo universal)**

**Motivación**: para escalar a múltiples deportes sin “hardcodear” reglas por disciplina, se define un catálogo universal de **acciones deportivas** (p. ej., aceleración, cambio de dirección, levantamiento olímpico, empuje de trineo, etc.). Cada deporte se describe como un conjunto ponderado de acciones; cada ejercicio/sesión se describe por su afinidad a dichas acciones. Esto permite recomendación explicable y mantenimiento sostenible.
### 9.8. Catálogo de acciones deportivas (`sport_action`) y mapeo a capacidades

## 10. Biblioteca de Referencia (Docs/Excels) y Gestión del Conocimiento

El sistema debe incorporar una biblioteca de conocimiento para centralizar fuentes técnicas (manuales, PDFs, plantillas Excel, protocolos de test) y vincularlas a ejercicios, métodos y planes.

### 10.1. Repositorio de archivos
- Upload de **PDF/DOCX/XLSX** con metadatos: autor, año, deporte, tags, versión, y visibilidad (privado/equipo/global).
- Vista previa rápida (PDF) y descarga controlada por permisos.
- Historial de versiones y notas de cambio (especialmente para plantillas).

### 10.2. Plantillas Excel (import/export)
- **Importar**: mapear columnas (p. ej., sesión, ejercicio, sets, reps, %1RM, zona FC/ritmo/potencia), validar unidades y crear un “template reutilizable”.
- **Exportar**: plan semanal/mensual a XLSX con formato estándar (calendar + sesiones + prescripción detallada).
- **Compatibilidad**: permitir múltiples deportes (p. ej., hojas separadas por running/erg/strength) y cálculos automáticos (zonas, ritmos, %1RM, tonelaje).
- **Semillas iniciales**: incluir templates base listos para duplicar y ajustar (p. ej., “Fuerza Máxima 12 semanas: Acumulación -> Transición -> Deload -> Intensificación -> Taper/Test”), basados en archivos tipo “Progresión del entrenamiento.xlsx”, además de ejemplos híbridos (fuerza + metcon) con reglas de compatibilidad.

### 10.3. Referencias vinculadas
- Asociación de **referencias** a: `exercise`, `training_method`, `physical_capability`, `plan_template`.
- Campo de “nota técnica” (qué evidencia respalda y en qué contexto aplica).

## 11. Funcionalidades del Usuario Final (Coach/Atleta)

### 11.1. Calendario y constructor de sesiones
- Vista semanal/mensual con drag-and-drop (sesiones, descansos, tests).
- Constructor de sesión basado en bloques con recomendaciones por deporte, fase y objetivo.
- Variantes automáticas por falta de equipamiento (sustituciones y regresiones/progresiones).

### 11.2. Registro (logging) y feedback
- Registro por ejercicio: carga, reps, RIR/RPE, tiempos/ritmos, notas y video (opcional).
- Registro por sesión: duración, sRPE, dolor, satisfacción y cumplimiento del objetivo.
- Bienestar diario (rápido, 30-60 s): sueño, energía, estrés, DOMS y, si activó el módulo de ciclo menstrual, registro de inicio/fin de periodo y severidad de síntomas (para aplicar ajustes de carga/impacto). La visibilidad hacia el coach debe ser configurable por la usuaria.
- Check-in semanal y alertas de fatiga/lesión para coach.

### 11.3. Analítica y reportes
- Carga y distribución de intensidades (tiempo en zona, TSS/TRIMP/sRPE).
- Fuerza: tonelaje, estimación de 1RM, tendencias por patrón/músculo.
- Reportes exportables (PDF/XLSX) para atleta/equipo.

### 11.4. Comunicación
- Comentarios en sesión/ejercicio, notas del coach y confirmación de cambios.
- Notificaciones (push/email) para sesiones clave, tests y revisiones.

## 12. Integraciones (opcional, por etapas)

- **Wearables y plataformas**: Garmin/Polar/Strava/Apple Health (import de FC, potencia, ritmo, distancia).
- **Supabase Auth + Row Level Security**: aislamiento por equipo y por atleta.
- **API pública**: endpoints para importar/exportar sesiones y métricas a herramientas externas.

## 13. Definición de MVP (recomendación)

Para acelerar valor y validar el producto, el MVP debería incluir:
1. Catálogo de ejercicios + parámetros técnicos (lo ya definido).
2. Onboarding (coach/atleta) + gestión de equipos.
3. Calendario semanal + constructor de sesiones (bloques) + logging básico.
4. Progresión semanal basada en adherencia + sRPE (reglas simples).
5. Biblioteca de plantillas (XLSX) con import/export básico.


## 14. Anexo A - Catálogo inicial de deportes y modalidades (extensible)

Propósito: cargar el catálogo `sport`/`sport_modality` con cobertura multi-deporte desde el día 1. La estructura recomendada es jerárquica (deporte → modalidades → pruebas/disciplinas). Este anexo sirve como lista inicial; el Admin podrá añadir nuevas modalidades, ligas y variantes.

### 14.1. Fuerza, potencia y fitness competitivo
- HYROX (Fitness Racing)
- CrossFit (Functional Fitness)
- Halterofilia / Weightlifting (Snatch; Clean & Jerk; variantes y complejos)
- Powerlifting (Squat, Bench Press, Deadlift; single/eq; variantes)
- Strongman / Strongwoman (implements: stones, yoke, log, farmer, etc.)
- Bodybuilding / Fisicoculturismo (culturismo, classic physique, wellness, bikini, men's physique)
- Kettlebell Sport (girevoy: long cycle, jerk, snatch)
- Calistenia competitiva / Street Workout (skill + fuerza relativa)
- Gimnasio militar/obstáculos (OCR: Spartan, Tough Mudder, etc.)
- Track & Field Strength (lanzamientos: shot/discus/hammer/javelin como especialidad de fuerza/potencia)

### 14.2. Resistencia y deportes cíclicos (endurance)
- Running / Carrera:
  - Pista (sprints, medio fondo, fondo, vallas, relevos, steeplechase)
  - Ruta (5K, 10K, media maratón, maratón, ultramaratón)
  - Trail / montaña / skyrunning; ultratrail
  - Marcha atlética
- Triatlón (sprint, olímpico, 70.3, full; duatlón; aquatlón)
- Ciclismo:
  - Ruta, contrarreloj
  - Pista (velocidad, persecución, keirin, omnium, madison)
  - MTB (XC, enduro, downhill)
  - BMX (race, freestyle)
  - Ciclocross, gravel
- Natación:
  - Piscina (todas las pruebas y estilos), relevos
  - Aguas abiertas (maratón acuático)
- Remo (rowing: olímpico y indoor rowing / ergómetro)
- Canoe/Kayak (sprint; slalom; marathon)
- Patinaje de velocidad (hielo y roller); ciclismo indoor (indoor cycling competitivo)
- Esquí nórdico (cross-country), rollerski
- Biatlón (ski + tiro)

### 14.3. Deportes de equipo - invasión/territorio (campo/cancha)
- Fútbol (soccer) 11v11; fútbol juvenil
- Futsal
- Fútbol 7 / fútbol rápido
- Fútbol americano (tackle), flag football
- Rugby union, rugby league, rugby sevens
- Baloncesto (basketball) 5v5; 3x3
- Balonmano (handball)
- Hockey sobre césped (field hockey)
- Hockey sobre hielo (ice hockey)
- Lacrosse (field/box)
- Waterpolo (también listado en acuáticos)
- Ultimate (ultimate frisbee)
- Gaelic football; hurling
- Australian rules football

### 14.4. Deportes de equipo - red/muro
- Voleibol (indoor)
- Voleibol de playa
- Tenis (dobles/individual) (también en raqueta)
- Bádminton (también en raqueta)
- Sepak takraw
- Pickleball (también en raqueta)

### 14.5. Deportes de bate y pelota / strike-and-field
- Béisbol
- Softbol
- Cricket
- Rounders

### 14.6. Deportes de raqueta y pala (racquet/paddle)
- Tenis
- Pádel
- Pickleball
- Tenis de mesa (ping-pong)
- Bádminton
- Squash
- Racquetball
- Frontón / Pelota vasca

### 14.7. Deportes de combate y artes marciales
- Boxeo (amateur/pro)
- Kickboxing
- Muay Thai
- MMA
- Lucha olímpica (freestyle, greco)
- Judo
- Brazilian Jiu-Jitsu (BJJ)
- Sambo
- Taekwondo
- Karate (kumite/kata)
- Kendo
- Sumo
- Esgrima (florete, espada, sable)
- Wushu / Kung fu (formas y combate)
- Aikido (demostrativo), Krav Maga (combativo/defensa)

### 14.8. Gimnasia, acrobacia y deportes estéticos/skill
- Gimnasia artística (MAG/WAG)
- Gimnasia rítmica
- Trampolín
- Gimnasia acrobática
- Parkour
- Cheerleading
- Danza deportiva (dance sport)
- Patinaje artístico (hielo y roller)
- Clavados / saltos ornamentales (también en acuáticos)
- Natación artística (artistic swimming)

### 14.9. Deportes de precisión, puntería y control fino
- Tiro con arco (archery)
- Tiro deportivo (pistola, rifle, shotgun; skeet/trap)
- Dardos
- Billar (pool, snooker, carambola)
- Boliche (bowling)
- Golf (stroke/match); golf indoor/simulador
- Disc golf
- Petanca / bocce
- Curling (también en invierno)
- Bowling de 10 pines / 9 pines

### 14.10. Deportes acuáticos y de tabla/vela
- Surf
- Bodyboard
- Windsurf
- Kitesurf
- Paddle surf (SUP) racing/surf
- Kayak surf
- Sailing / vela (clases y modalidades)
- Canotaje recreativo/expedición (si se gestiona como deporte)
- Buceo (apnea/freediving; scuba competitivo si aplica)
- Natación en aguas abiertas (listado en endurance)
- Waterpolo (listado en equipo)

### 14.11. Deportes de invierno, nieve y hielo
- Esquí alpino
- Snowboard
- Freestyle skiing / moguls
- Esquí de fondo (listado en endurance)
- Biatlón (listado en endurance)
- Saltos de esquí; combinada nórdica
- Patinaje sobre hielo (figure/short track/speed skating)
- Hockey sobre hielo (listado en equipo)
- Curling
- Bobsleigh
- Luge
- Skeleton
- Alpinismo invernal / esquí de travesía (ski mountaineering)

### 14.12. Deportes de aventura y outdoor
- Escalada deportiva (lead, boulder, speed)
- Escalada tradicional (si se gestiona como modalidad)
- Montañismo/alpinismo
- Orientación (orienteering)
- Trail de aventura / adventure racing
- Canyoning
- Rafting
- Slackline (trickline/highline)
- Skateboarding (street/park)
- Patinaje (inline/aggressive)
- BMX freestyle (listado en ciclismo)

### 14.13. Deportes ecuestres y de animal
- Equitación / Ecuestre (dressage, show jumping, eventing)
- Endurance ecuestre
- Rodeo (bull riding, barrel racing, etc.)
- Polo
- Carreras de caballos (horse racing)

### 14.14. Motor y velocidad (si se desea soportar como “deporte” en el catálogo)
- Automovilismo (circuito: fórmula; touring; endurance; karting)
- Rally
- Motociclismo (circuito; motocross; enduro; trial)
- Ciclismo motorizado recreativo/competitivo (según ligas)

### 14.15. Deportes mentales y electrónicos (opcional, según estrategia de producto)
- Ajedrez
- Go
- Bridge
- Poker deportivo (si se considera en el catálogo)
- eSports (FPS, MOBA, RTS, sports games) con submodalidades por título

### 14.16. Campo de deportes “otros”
- Gimkana/skills (según ligas)
- Deportes adaptados / paralímpicos: la recomendación es modelarlos como `modality` sobre el deporte base (p. ej., atletismo T/F, natación S), para reutilizar taxonomía y perfiles con ajustes.


### 14.17. Deportes adicionales y variantes (cobertura ampliada)
- Netball
- Korfball
- Floorball
- Bandy
- Hockey sobre patines (rink hockey)
- Roller hockey (inline) y roller derby
- Handball de playa
- Rugby tag / touch rugby
- Dodgeball
- Tchoukball
- Kabaddi
- Kho-kho
- Teqball
- Footvolley
- Fistball
- Net sports adicionales: peteca, speed badminton (crossminton)
- Deportes de nieve adicionales: snowshoe racing (carrera con raquetas), ice climbing (escalada en hielo) si aplica
- Deportes de fuerza adicionales: Highland games, tug of war (tira y afloja), armwrestling (pulseadas), powerbuilding
- Deportes de precisión adicionales: bowls, croquet, curling mixto, shuffleboard
- Deportes de agua adicionales: dragon boat, surf lifesaving, fin swimming (natación con aletas)
- Deportes urbanos: park skating, longboard, scooter freestyle
- Deportes de lanzamiento adicionales: axe throwing (si se incluye), throwing games tradicionales

Nota de implementación: no es necesario crear una tabla por “prueba”. La jerarquía `sport_parent_id` permite representar (deporte → modalidad → prueba) cuando el nivel de detalle sea relevante para prescripción y métricas. Para el MVP, basta con deporte + modalidad principal; las pruebas se agregan conforme se necesiten.

## 15. Anexo B - Catálogo inicial de acciones deportivas (`sport_action`) y capacidades (v1)
Nota: este catálogo es intencionalmente universal y extensible. Permite describir la mayoría de deportes como combinación ponderada de acciones. Los códigos son estables; los nombres pueden localizarse (ES/EN).

### 15.1. Capacidades (`capacity`) - diccionario mínimo recomendado
Código	Descripción
CAP-ACC	Aceleración (0-30 m)
CAP-MAXSPD	Velocidad máxima (sprint)
CAP-RSA	Repeated Sprint Ability
CAP-COD	Cambio de dirección
CAP-DECEL	Desaceleración/landing control
CAP-PLY	SSC/Pliometría e impacto
CAP-PWR-LB	Potencia tren inferior
CAP-PWR-UB	Potencia tren superior
CAP-STR-LB	Fuerza máxima tren inferior
CAP-STR-UB	Fuerza máxima tren superior
CAP-ISO	Fuerza isométrica (core/agarre/posicional)
CAP-MUSEND	Resistencia muscular local
CAP-AER-BASE	Base aeróbica (Z1-Z2)
CAP-AER-THR	Umbral/tempo (LT/MLSS)
CAP-AER-VO2	Potencia aeróbica (VO2max)
CAP-ANA	Capacidad anaeróbica/lactato
CAP-GRIP	Agarre (grip)
CAP-CORE	Estabilidad de tronco/transferencia
CAP-MOB	Movilidad específica (tobillo/cadera/hombro)
CAP-SKILL	Técnica/skill (implemento/coord.)

### 15.2. Tabla de acciones deportivas (v1) con mapeo primario a capacidades
Convención de pesos en capacidades por acción: 3 = primaria, 2 = secundaria, 1 = terciaria.
Código	Familia	Acción (nombre)	KPIs ejemplo	Capacidades (peso)
ACT-ACC-01	Locomoción	Aceleración (0-30 m)	30 m tiempo; 10 m split	CAP-ACC(3), CAP-PWR-LB(2), CAP-STR-LB(1)
ACT-SPD-01	Locomoción	Sprint velocidad máxima (30-80 m)	flying 10; vmax	CAP-MAXSPD(3), CAP-PWR-LB(2), CAP-PLY(1)
ACT-RSA-01	Locomoción	Repeated sprint (esfuerzos repetidos)	RSA test; caída de rendimiento	CAP-RSA(3), CAP-ANA(2), CAP-AER-VO2(1)
ACT-DEC-01	COD/Agilidad	Desaceleración y frenado	tiempo a parada; técnica	CAP-DECEL(3), CAP-STR-LB(2), CAP-CORE(1)
ACT-COD-01	COD/Agilidad	Cambio de dirección 45-90°	505; pro-agility	CAP-COD(3), CAP-DECEL(2), CAP-ACC(1)
ACT-COD-02	COD/Agilidad	Cambio de dirección 180°	505; Illinois	CAP-COD(3), CAP-DECEL(2), CAP-STR-LB(1)
ACT-AGI-01	COD/Agilidad	Agilidad reactiva (percepción-decisión)	tiempo reacción; error rate	CAP-COD(2), CAP-SKILL(2), CAP-ACC(1)
ACT-JMP-01	Salto/SSC	Salto vertical (CMJ)	altura; RSI mod	CAP-PLY(3), CAP-PWR-LB(2), CAP-STR-LB(1)
ACT-JMP-02	Salto/SSC	Salto horizontal (broad)	distancia	CAP-PLY(3), CAP-ACC(2), CAP-PWR-LB(1)
ACT-JMP-03	Salto/SSC	Drop jump / RSI	RSI	CAP-PLY(3), CAP-DECEL(2), CAP-PWR-LB(1)
ACT-PYO-01	Salto/SSC	Pliometría unilateral (hops)	contact time; dolor	CAP-PLY(3), CAP-COD(2), CAP-DECEL(1)
ACT-THR-01	Implemento/Skill	Lanzamiento rotacional (medball)	velocidad/distancia	CAP-PWR-UB(3), CAP-CORE(2), CAP-SKILL(1)
ACT-THR-02	Implemento/Skill	Lanzamiento overhead (medball)	velocidad/distancia	CAP-PWR-UB(3), CAP-STR-UB(2), CAP-CORE(1)
ACT-LFT-OLY-01	Potencia/Fuerza	Snatch (levantamiento)	1RM; reps quality	CAP-PWR-LB(2), CAP-PWR-UB(2), CAP-SKILL(2)
ACT-LFT-OLY-02	Potencia/Fuerza	Clean & Jerk (levantamiento)	1RM; reps quality	CAP-PWR-LB(2), CAP-STR-UB(2), CAP-SKILL(2)
ACT-LFT-OLY-03	Potencia/Fuerza	Pull olímpico (snatch/clean pull)	%1RM; velocidad barra	CAP-PWR-LB(3), CAP-STR-LB(2), CAP-SKILL(1)
ACT-STR-01	Fuerza	Sentadilla (fuerza máxima)	1RM; 3-5RM	CAP-STR-LB(3), CAP-CORE(1), CAP-MUSEND(1)
ACT-STR-02	Fuerza	Bisagra/Deadlift (fuerza máxima)	1RM; 3-5RM	CAP-STR-LB(3), CAP-GRIP(2), CAP-CORE(1)
ACT-STR-03	Fuerza	Press banca (fuerza máxima)	1RM; 3-5RM	CAP-STR-UB(3), CAP-ISO(1), CAP-MUSEND(1)
ACT-STR-04	Fuerza	Press vertical (fuerza)	1RM; 3-5RM	CAP-STR-UB(3), CAP-CORE(2), CAP-MUSEND(1)
ACT-GYM-01	Skill	Gimnasia kipping (pull-up/toes-to-bar)	reps; eficiencia	CAP-MUSEND(2), CAP-SKILL(2), CAP-GRIP(2)
ACT-GYM-02	Skill	Gimnasia strict (pull-up/dip)	reps; 1RM weighted	CAP-STR-UB(2), CAP-MUSEND(2), CAP-GRIP(1)
ACT-CARRY-01	Carry	Farmers carry (carga)	distancia/tiempo	CAP-GRIP(3), CAP-CORE(2), CAP-MUSEND(1)
ACT-CARRY-02	Carry	Sandbag carry/shoulder	distancia/tiempo	CAP-CORE(2), CAP-MUSEND(2), CAP-GRIP(1)
ACT-SLED-01	HYROX/Strongman	Sled push	tiempo/10-20 m	CAP-STR-LB(2), CAP-MUSEND(2), CAP-ANA(1)
ACT-SLED-02	HYROX/Strongman	Sled pull	tiempo/10-20 m	CAP-STR-LB(2), CAP-GRIP(2), CAP-ANA(1)
ACT-LUNGE-01	HYROX/Locomoción	Walking lunges con carga	distancia/tiempo	CAP-MUSEND(2), CAP-STR-LB(2), CAP-CORE(1)
ACT-WB-01	HYROX/Metcon	Wall balls	reps/min; HR	CAP-MUSEND(2), CAP-ANA(2), CAP-STR-LB(1)
ACT-BUR-01	Metcon	Burpee broad jump	tiempo; reps	CAP-ANA(2), CAP-PLY(2), CAP-MUSEND(1)
ACT-THR-03	Metcon	Thruster (moderado-alto volumen)	reps; %1RM	CAP-MUSEND(2), CAP-ANA(2), CAP-STR-UB(1)
ACT-SWING-01	Metcon	Kettlebell swing	reps/min; potencia	CAP-PWR-LB(2), CAP-ANA(2), CAP-CORE(1)
ACT-JR-01	Metcon	Double-unders	reps; error rate	CAP-PLY(2), CAP-AER-VO2(1), CAP-SKILL(2)
ACT-ROW-01	Cíclico	RowErg steady (Z2)	HR; pace	CAP-AER-BASE(3), CAP-MUSEND(1), CAP-SKILL(1)
ACT-ROW-02	Cíclico	RowErg intervalos VO2	pace; watts	CAP-AER-VO2(3), CAP-ANA(2), CAP-MUSEND(1)
ACT-SKI-01	Cíclico	SkiErg steady (Z2)	HR; pace	CAP-AER-BASE(3), CAP-MUSEND(1), CAP-STR-UB(1)
ACT-SKI-02	Cíclico	SkiErg intervalos intensos	pace; watts	CAP-AER-VO2(2), CAP-ANA(2), CAP-STR-UB(1)
ACT-RUN-BASE	Running	Carrera base (Z1-Z2)	HR; pace; tiempo	CAP-AER-BASE(3), CAP-MUSEND(1), CAP-SKILL(1)
ACT-RUN-THR	Running	Tempo/Umbral	pace LT; HR	CAP-AER-THR(3), CAP-AER-VO2(1), CAP-MUSEND(1)
ACT-RUN-VO2	Running	Intervalos VO2	pace; rep quality	CAP-AER-VO2(3), CAP-ANA(2), CAP-RSA(1)
ACT-RUN-HILL	Running	Hill sprints	split; técnica	CAP-ACC(2), CAP-PWR-LB(2), CAP-PLY(1)
ACT-CYC-BASE	Ciclismo	Rodaje base (endurance)	HR; watts	CAP-AER-BASE(3), CAP-MUSEND(1), CAP-SKILL(1)
ACT-CYC-THR	Ciclismo	Threshold/FTP intervals	FTP; watts	CAP-AER-THR(3), CAP-AER-VO2(1), CAP-MUSEND(1)
ACT-CYC-VO2	Ciclismo	VO2max intervals	watts; HR	CAP-AER-VO2(3), CAP-ANA(2), CAP-MUSEND(1)
ACT-SWIM-BASE	Natación	Nado aeróbico continuo	pace/100; HR	CAP-AER-BASE(3), CAP-SKILL(2), CAP-STR-UB(1)
ACT-SWIM-SPR	Natación	Sprints acuáticos	tiempo; lactato	CAP-ANA(2), CAP-PWR-UB(2), CAP-SKILL(2)
ACT-SWIM-TURN	Natación	Vuelta/underwater	tiempo 5-15 m	CAP-SKILL(3), CAP-PWR-LB(1), CAP-ANA(1)
ACT-ROW-2K	Remo	Test 2k / race pace	tiempo; watts	CAP-AER-VO2(2), CAP-ANA(2), CAP-MUSEND(2)
ACT-CLIMB-01	Aventura	Ascenso/trekking con carga	desnivel; tiempo	CAP-AER-BASE(3), CAP-MUSEND(2), CAP-CORE(1)
ACT-STRIKE-01	Combate	Combinaciones de golpeo	conteo; potencia	CAP-ANA(2), CAP-PWR-UB(2), CAP-SKILL(2)
ACT-GRAP-01	Combate	Grappling/derribo	tasa éxito; tiempo	CAP-STR-UB(2), CAP-ISO(2), CAP-SKILL(2)
ACT-CLINCH-01	Combate	Clinch isométrico	tiempo bajo tensión	CAP-ISO(3), CAP-GRIP(2), CAP-CORE(1)
ACT-THRW-OVH	Equipo/Raqueta	Lanzamiento overhead (deporte)	velocidad; precisión	CAP-PWR-UB(2), CAP-SKILL(2), CAP-CORE(1)
ACT-KICK-01	Equipo	Golpeo/patada	velocidad; precisión	CAP-PWR-LB(2), CAP-SKILL(2), CAP-CORE(1)
ACT-SKT-01	Invierno	Patinaje/stride (hielo)	tiempo; técnica	CAP-AER-BASE(2), CAP-COD(1), CAP-SKILL(2)
ACT-SKI-UP	Invierno	Esquí ascenso (uphill)	desnivel; HR	CAP-AER-BASE(2), CAP-AER-THR(2), CAP-MUSEND(1)
ACT-ESPORT-01	eSports/Mental	Precisión y reacción (gaming)	APM; tiempo reacción	CAP-SKILL(2), CAP-CORE(1), CAP-MOB(1)
ACT-MOB-01	Preparación	Movilidad tobillo/cadera/hombro	ROM; dolor	CAP-MOB(3), CAP-CORE(1), CAP-SKILL(1)
ACT-PREHAB-01	Preparación	Prehab/estabilidad (rodilla/hombro)	dolor; control	CAP-CORE(2), CAP-ISO(2), CAP-MOB(1)

### 15.3. Reglas de uso (producto)
- Cada deporte debe mapearse a 8-20 acciones principales con pesos (0-100) para cubrir el 80-90% de su demanda.
- Cada ejercicio debe tener afinidad a 1-6 acciones. Si excede 6, probablemente el tag es demasiado genérico.
- Para el MVP: priorizar curación manual de afinidades en los ejercicios más usados y deportes objetivo; el resto puede inferirse por reglas y corregirse con el feedback del coach.
