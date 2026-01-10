# Kronthor Database Schema

> **Última actualización:** 2026-01-10  
> **Total de tablas:** 38

---

## Tablas de Catálogos Compartidos (Ejercicio + Deporte)

### `dominant_vector`
Vector dominante de fuerza (horizontal, vertical, rotacional)
```sql
CREATE TABLE dominant_vector (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);
```
**Valores:** HOR, VER, ROT

### `laterality_support`
Tipo de apoyo (bilateral, unilateral, alternante)
```sql
CREATE TABLE laterality_support (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);
```
**Valores:** BIL, UNI, ALT

### `laterality_load`
Distribución de carga (simétrica, asimétrica)
```sql
CREATE TABLE laterality_load (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);
```
**Valores:** SIM, ASIM

### `ssc_demand`
Exigencia de ciclo estiramiento-acortamiento
```sql
CREATE TABLE ssc_demand (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);
```
**Valores:** BAJO, MEDIO, ALTO

### `impact_demand`
Exigencia de impacto
```sql
CREATE TABLE impact_demand (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);
```
**Valores:** BAJO, MEDIO, ALTO

### `antirotation_stability`
Estabilidad antirotación
```sql
CREATE TABLE antirotation_stability (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);
```
**Valores:** BAJA, MEDIA, ALTA

---

## Tablas de Ejercicios

### `exercise` (Tabla Principal)
```sql
CREATE TABLE exercise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  
  -- Referencias a catálogos
  type_id INTEGER NOT NULL REFERENCES exercise_type(id),
  difficulty_id INTEGER REFERENCES difficulty_level(id),
  training_method_id INTEGER REFERENCES training_method(id),
  
  -- Lateralidad (nuevos campos)
  laterality_support_id INTEGER REFERENCES laterality_support(id),
  laterality_load_id INTEGER REFERENCES laterality_load(id),
  
  -- Exigencias (nuevos campos)
  ssc_demand_id INTEGER REFERENCES ssc_demand(id),
  impact_demand_id INTEGER REFERENCES impact_demand(id),
  antirotation_stability_id INTEGER REFERENCES antirotation_stability(id),
  
  -- Patrón de movimiento (nuevo campo)
  movement_pattern_id INTEGER REFERENCES movement_pattern(id),
  
  -- Campos legacy (deprecados)
  plane_id INTEGER,
  laterality_id INTEGER,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
```

### `exercise_vector_mix`
Mix ponderado de vectores dominantes (suma debe ser 100%)
```sql
CREATE TABLE exercise_vector_mix (
  id INTEGER PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES exercise(id) ON DELETE CASCADE,
  vector_id INTEGER NOT NULL REFERENCES dominant_vector(id),
  weight INTEGER NOT NULL CHECK (weight >= 0 AND weight <= 100 AND weight % 10 = 0),
  UNIQUE(exercise_id, vector_id)
);
```

### `exercise_plane_mix`
Mix ponderado de planos (suma debe ser 100%)
```sql
CREATE TABLE exercise_plane_mix (
  id INTEGER PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES exercise(id) ON DELETE CASCADE,
  plane_id INTEGER NOT NULL REFERENCES plane(id),
  weight INTEGER NOT NULL CHECK (weight >= 0 AND weight <= 100 AND weight % 10 = 0),
  UNIQUE(exercise_id, plane_id)
);
```

### `exercise_equipment`
Relación muchos-a-muchos: ejercicio ↔ equipo
```sql
CREATE TABLE exercise_equipment (
  id INTEGER PRIMARY KEY,
  exercise_id UUID REFERENCES exercise(id),
  equipment_id INTEGER REFERENCES equipment(id)
);
```

### `exercise_muscle`
Relación muchos-a-muchos: ejercicio ↔ músculos (primarios/secundarios)
```sql
CREATE TABLE exercise_muscle (
  id INTEGER PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES exercise(id),
  muscle_id INTEGER NOT NULL REFERENCES muscle(id),
  role VARCHAR CHECK (role IN ('primary', 'secondary'))
);
```

### `exercise_movement_pattern` (DEPRECADA)
> ⚠️ Esta tabla será eliminada. Ahora se usa `exercise.movement_pattern_id`

---

## Catálogos de Ejercicios

### `exercise_type`
Tipo de ejercicio (compuesto, aislado)
```sql
CREATE TABLE exercise_type (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE
);
```

### `difficulty_level`
Nivel de dificultad (básico, intermedio, avanzado)
```sql
CREATE TABLE difficulty_level (
  id INTEGER PRIMARY KEY,
  name VARCHAR(30) NOT NULL
);
```

### `equipment`
Equipamiento necesario
```sql
CREATE TABLE equipment (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);
```

### `movement_pattern`
Patrones de movimiento
```sql
CREATE TABLE movement_pattern (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);
```
**Valores:** SQ, HN, LN, PUSH_H, PUSH_V, PULL_H, PULL_V, CARRY, ROT, ANTI, LOCO, JMP, SSC, etc.

### `plane`
Planos de movimiento
```sql
CREATE TABLE plane (
  id INTEGER PRIMARY KEY,
  name VARCHAR(30) NOT NULL
);
```
**Valores:** sagital, frontal, transversal

### `muscle` y `muscle_group`
Músculos y grupos musculares
```sql
CREATE TABLE muscle_group (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE muscle (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL,
  group_id INTEGER NOT NULL REFERENCES muscle_group(id)
);
```

### `training_method`
Métodos de entrenamiento
```sql
CREATE TABLE training_method (
  id INTEGER PRIMARY KEY,
  subcapability_id INTEGER NOT NULL REFERENCES physical_subcapability(id),
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255)
);
```

### `physical_capability` y `physical_subcapability`
Capacidades físicas y subcapacidades
```sql
CREATE TABLE physical_capability (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE physical_subcapability (
  id INTEGER PRIMARY KEY,
  capability_id INTEGER NOT NULL REFERENCES physical_capability(id),
  name VARCHAR(120) NOT NULL
);
```

---

## Tablas de Deportes

### `sport` (Tabla Principal)
```sql
CREATE TABLE sport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  position_role VARCHAR(100),
  
  -- Lateralidad
  laterality_support_id INTEGER REFERENCES laterality_support(id),
  laterality_load_id INTEGER REFERENCES laterality_load(id),
  
  -- Exigencias
  antirotation_stability_id INTEGER REFERENCES antirotation_stability(id),
  cod_demand_id INTEGER REFERENCES cod_demand(id),
  ssc_demand_id INTEGER REFERENCES ssc_demand(id),
  impact_demand_id INTEGER REFERENCES impact_demand(id),
  
  -- Volumen y perfil
  practice_volume_id INTEGER REFERENCES practice_volume(id),
  energy_profile_id INTEGER REFERENCES energy_profile(id),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
```

### `sport_key_action`
Acciones clave del deporte (6-10 selecciones)
```sql
CREATE TABLE sport_key_action (
  id INTEGER PRIMARY KEY,
  sport_id UUID NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
  action_id INTEGER NOT NULL REFERENCES key_action(id),
  UNIQUE(sport_id, action_id)
);
```

### `sport_physical_priority`
Prioridades físicas ordenadas (3-5 selecciones)
```sql
CREATE TABLE sport_physical_priority (
  id INTEGER PRIMARY KEY,
  sport_id UUID NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
  priority_id INTEGER NOT NULL REFERENCES physical_priority(id),
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 5),
  UNIQUE(sport_id, priority_id),
  UNIQUE(sport_id, rank)
);
```

### `sport_risk_zone`
Zonas de riesgo típicas (1-3 selecciones)
```sql
CREATE TABLE sport_risk_zone (
  id INTEGER PRIMARY KEY,
  sport_id UUID NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
  zone_id INTEGER NOT NULL REFERENCES risk_zone(id),
  UNIQUE(sport_id, zone_id)
);
```

### `sport_common_limiter`
Limitantes comunes (1-3 selecciones)
```sql
CREATE TABLE sport_common_limiter (
  id INTEGER PRIMARY KEY,
  sport_id UUID NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
  limiter_id INTEGER NOT NULL REFERENCES common_limiter(id),
  UNIQUE(sport_id, limiter_id)
);
```

### `sport_vector_mix`
Mix ponderado de vectores dominantes (suma debe ser 100%)
```sql
CREATE TABLE sport_vector_mix (
  id INTEGER PRIMARY KEY,
  sport_id UUID NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
  vector_id INTEGER NOT NULL REFERENCES dominant_vector(id),
  weight INTEGER NOT NULL CHECK (weight >= 0 AND weight <= 100 AND weight % 10 = 0),
  UNIQUE(sport_id, vector_id)
);
```

### `sport_plane_mix`
Mix ponderado de planos (suma debe ser 100%)
```sql
CREATE TABLE sport_plane_mix (
  id INTEGER PRIMARY KEY,
  sport_id UUID NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
  plane_id INTEGER NOT NULL REFERENCES plane(id),
  weight INTEGER NOT NULL CHECK (weight >= 0 AND weight <= 100 AND weight % 10 = 0),
  UNIQUE(sport_id, plane_id)
);
```

---

## Catálogos de Deportes

### `cod_demand`
Exigencia de cambios de dirección
```sql
CREATE TABLE cod_demand (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);
```
**Valores:** BAJO, MEDIO, ALTO

### `practice_volume`
Volumen de práctica típico
```sql
CREATE TABLE practice_volume (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);
```
**Valores:** BAJA, MEDIA, ALTA

### `energy_profile`
Perfil energético del deporte
```sql
CREATE TABLE energy_profile (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);
```
**Valores:** CONT (continuo), INT (intermitente), MIX (mixto)

### `key_action`
Acciones clave genéricas
```sql
CREATE TABLE key_action (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT
);
```
**Valores:** ACC, SPD, RSA, COD, JMP, THR, LIFT, CARRY, ROT, ANTI, AER, INT, SKL

### `physical_priority`
Prioridades físicas
```sql
CREATE TABLE physical_priority (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT
);
```
**Valores:** STR, HYP, PWR, SPD, AGI, AER, ANA, FR, MOB, STAB, SKL, TOL

### `risk_zone`
Zonas de riesgo de lesión
```sql
CREATE TABLE risk_zone (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT
);
```
**Valores:** KNEE, HIP, ANK, LSP, TSP, SHO, ELB, WRI, NEC

### `common_limiter`
Limitantes comunes
```sql
CREATE TABLE common_limiter (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT
);
```
**Valores:** STR, PWR, AER, ANA, MOB, STAB, TECH, TOL, END

---

## Tablas Legacy (Deprecadas)

### `laterality` (DEPRECADA)
> ⚠️ Reemplazada por `laterality_support` y `laterality_load`

### `exercise_movement_pattern` (DEPRECADA)
> ⚠️ Reemplazada por `exercise.movement_pattern_id`

---

## Resumen de Cambios (Migración 2026-01-10)

### Tablas Nuevas (21)
- **Catálogos compartidos (6):** `dominant_vector`, `laterality_support`, `laterality_load`, `ssc_demand`, `impact_demand`, `antirotation_stability`
- **Ejercicio (2):** `exercise_vector_mix`, `exercise_plane_mix`
- **Catálogos deporte (7):** `cod_demand`, `practice_volume`, `energy_profile`, `key_action`, `physical_priority`, `risk_zone`, `common_limiter`
- **Deporte (7):** `sport`, `sport_key_action`, `sport_physical_priority`, `sport_risk_zone`, `sport_common_limiter`, `sport_vector_mix`, `sport_plane_mix`

### Campos Nuevos en `exercise` (6)
- `laterality_support_id`
- `laterality_load_id`
- `ssc_demand_id`
- `impact_demand_id`
- `antirotation_stability_id`
- `movement_pattern_id`

### Validaciones Implementadas
- Mix ponderado: suma = 100%, máximo 3 componentes, al menos 1 ≥ 50%
- Sport key actions: 6-10 selecciones
- Sport priorities: 3-5 selecciones ordenadas
- Sport risk zones: 1-3 selecciones
- Sport limiters: 1-3 selecciones