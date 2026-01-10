# Guía de Ejecución de Migraciones

## Orden de Ejecución

Las migraciones deben ejecutarse en el siguiente orden estricto:

### 1. `01_shared_catalogs.sql`
**Descripción**: Crea catálogos compartidos entre Ejercicio y Deporte
- `dominant_vector` (3 registros)
- `laterality_support` (3 registros)
- `laterality_load` (2 registros)
- `ssc_demand` (3 registros)
- `impact_demand` (3 registros)
- `antirotation_stability` (3 registros)

**Tiempo estimado**: < 1 segundo

### 2. `02_exercise_modifications.sql`
**Descripción**: Modifica tabla `exercise` y crea tablas de mix ponderado
- Agrega 6 nuevos campos a `exercise`
- Crea `exercise_vector_mix`
- Crea `exercise_plane_mix`
- Implementa triggers de validación

**Tiempo estimado**: < 5 segundos

**⚠️ IMPORTANTE**: Después de ejecutar esta migración, los nuevos campos en `exercise` estarán en NULL. Deberán ser poblados manualmente o mediante la UI.

### 3. `03_sport_catalogs.sql`
**Descripción**: Crea catálogos específicos de Deporte
- `cod_demand` (3 registros)
- `practice_volume` (3 registros)
- `energy_profile` (3 registros)
- `key_action` (13 registros)
- `physical_priority` (12 registros)
- `risk_zone` (9 registros)
- `common_limiter` (9 registros)

**Tiempo estimado**: < 1 segundo

### 4. `04_sport_main.sql`
**Descripción**: Crea tabla `sport` y todas sus relaciones
- `sport` (tabla principal)
- `sport_key_action`
- `sport_physical_priority`
- `sport_risk_zone`
- `sport_common_limiter`
- `sport_vector_mix`
- `sport_plane_mix`
- Implementa triggers de validación

**Tiempo estimado**: < 5 segundos

### 5. `05_cleanup_deprecated.sql` ⚠️ **OPCIONAL**
**Descripción**: Limpia campos y tablas obsoletas

**⚠️ NO EJECUTAR INMEDIATAMENTE**. Este script debe ejecutarse solo después de:
1. Validar que todos los ejercicios tienen los nuevos campos poblados
2. Validar que `exercise_plane_mix` está correctamente poblado
3. Hacer backup completo de la base de datos
4. Esperar al menos 1 mes en producción

---

## Cómo Ejecutar en Supabase

### Opción 1: SQL Editor (Recomendado)

1. Ir a tu proyecto en Supabase Dashboard
2. Navegar a **SQL Editor**
3. Crear una nueva query
4. Copiar y pegar el contenido de `01_shared_catalogs.sql`
5. Ejecutar (botón "Run" o `Ctrl+Enter`)
6. Verificar que no hay errores
7. Repetir para cada migración en orden

### Opción 2: CLI de Supabase

```bash
# Asegurarse de estar en el directorio del proyecto
cd c:\Users\jcruz\kronthor\kronthor-plus

# Ejecutar cada migración en orden
supabase db execute --file migrations/01_shared_catalogs.sql
supabase db execute --file migrations/02_exercise_modifications.sql
supabase db execute --file migrations/03_sport_catalogs.sql
supabase db execute --file migrations/04_sport_main.sql

# NO ejecutar 05_cleanup_deprecated.sql todavía
```

---

## Verificación Post-Migración

### 1. Verificar Creación de Tablas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'dominant_vector', 'laterality_support', 'laterality_load',
    'ssc_demand', 'impact_demand', 'antirotation_stability',
    'cod_demand', 'practice_volume', 'energy_profile',
    'key_action', 'physical_priority', 'risk_zone', 'common_limiter',
    'sport', 'sport_key_action', 'sport_physical_priority',
    'sport_risk_zone', 'sport_common_limiter',
    'sport_vector_mix', 'sport_plane_mix',
    'exercise_vector_mix', 'exercise_plane_mix'
  )
ORDER BY table_name;
```

**Resultado esperado**: 21 tablas listadas

### 2. Verificar Población de Catálogos

```sql
SELECT 'dominant_vector' as tabla, COUNT(*) as registros FROM dominant_vector
UNION ALL SELECT 'laterality_support', COUNT(*) FROM laterality_support
UNION ALL SELECT 'laterality_load', COUNT(*) FROM laterality_load
UNION ALL SELECT 'ssc_demand', COUNT(*) FROM ssc_demand
UNION ALL SELECT 'impact_demand', COUNT(*) FROM impact_demand
UNION ALL SELECT 'antirotation_stability', COUNT(*) FROM antirotation_stability
UNION ALL SELECT 'cod_demand', COUNT(*) FROM cod_demand
UNION ALL SELECT 'practice_volume', COUNT(*) FROM practice_volume
UNION ALL SELECT 'energy_profile', COUNT(*) FROM energy_profile
UNION ALL SELECT 'key_action', COUNT(*) FROM key_action
UNION ALL SELECT 'physical_priority', COUNT(*) FROM physical_priority
UNION ALL SELECT 'risk_zone', COUNT(*) FROM risk_zone
UNION ALL SELECT 'common_limiter', COUNT(*) FROM common_limiter;
```

**Resultado esperado**:
- dominant_vector: 3
- laterality_support: 3
- laterality_load: 2
- ssc_demand: 3
- impact_demand: 3
- antirotation_stability: 3
- cod_demand: 3
- practice_volume: 3
- energy_profile: 3
- key_action: 13
- physical_priority: 12
- risk_zone: 9
- common_limiter: 9

### 3. Verificar Nuevos Campos en Exercise

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'exercise'
  AND column_name IN (
    'laterality_support_id',
    'laterality_load_id',
    'ssc_demand_id',
    'impact_demand_id',
    'antirotation_stability_id',
    'movement_pattern_id'
  )
ORDER BY column_name;
```

**Resultado esperado**: 6 columnas listadas, todas con `is_nullable = 'YES'`

### 4. Probar Validación de Mix Ponderado

```sql
-- Crear ejercicio de prueba
INSERT INTO exercise (name_es, type_id, difficulty_id, training_method_id)
VALUES (
  'Test Exercise',
  (SELECT id FROM exercise_type LIMIT 1),
  (SELECT id FROM difficulty_level LIMIT 1),
  (SELECT id FROM training_method LIMIT 1)
)
RETURNING id;

-- Copiar el ID del ejercicio y usarlo en las siguientes queries

-- Intentar insertar mix inválido (debe fallar con suma != 100)
INSERT INTO exercise_vector_mix (exercise_id, vector_id, weight)
VALUES 
  ('<exercise_id>', (SELECT id FROM dominant_vector WHERE code = 'HOR'), 60),
  ('<exercise_id>', (SELECT id FROM dominant_vector WHERE code = 'VER'), 30);
-- Debe fallar: suma = 90, no 100

-- Insertar mix válido (debe funcionar)
DELETE FROM exercise_vector_mix WHERE exercise_id = '<exercise_id>';
INSERT INTO exercise_vector_mix (exercise_id, vector_id, weight)
VALUES 
  ('<exercise_id>', (SELECT id FROM dominant_vector WHERE code = 'HOR'), 70),
  ('<exercise_id>', (SELECT id FROM dominant_vector WHERE code = 'VER'), 30);
-- Debe funcionar: suma = 100

-- Limpiar
DELETE FROM exercise WHERE id = '<exercise_id>';
```

### 5. Crear Deporte de Prueba

```sql
-- Insertar deporte
INSERT INTO sport (sport_id, name, position_role, laterality_support_id, laterality_load_id)
VALUES (
  'SPORT_TEST_001',
  'Fútbol',
  'Mediocampista',
  (SELECT id FROM laterality_support WHERE code = 'ALT'),
  (SELECT id FROM laterality_load WHERE code = 'SIM')
)
RETURNING id;

-- Copiar el ID y agregar acciones clave (mínimo 6)
INSERT INTO sport_key_action (sport_id, action_id)
SELECT 
  '<sport_id>',
  id
FROM key_action
WHERE code IN ('ACC', 'COD', 'RSA', 'AER', 'SKL', 'JMP');

-- Agregar prioridades físicas (mínimo 3, con ranking)
INSERT INTO sport_physical_priority (sport_id, priority_id, rank)
VALUES
  ('<sport_id>', (SELECT id FROM physical_priority WHERE code = 'AER'), 1),
  ('<sport_id>', (SELECT id FROM physical_priority WHERE code = 'FR'), 2),
  ('<sport_id>', (SELECT id FROM physical_priority WHERE code = 'PWR'), 3);

-- Verificar
SELECT 
  s.name,
  COUNT(DISTINCT ska.id) as acciones_clave,
  COUNT(DISTINCT spp.id) as prioridades
FROM sport s
LEFT JOIN sport_key_action ska ON s.id = ska.sport_id
LEFT JOIN sport_physical_priority spp ON s.id = spp.sport_id
WHERE s.sport_id = 'SPORT_TEST_001'
GROUP BY s.name;

-- Limpiar
DELETE FROM sport WHERE sport_id = 'SPORT_TEST_001';
```

---

## Rollback (En caso de problemas)

Si necesitas revertir las migraciones:

```sql
-- Ejecutar en orden INVERSO
DROP TABLE IF EXISTS sport_plane_mix CASCADE;
DROP TABLE IF EXISTS sport_vector_mix CASCADE;
DROP TABLE IF EXISTS sport_common_limiter CASCADE;
DROP TABLE IF EXISTS sport_risk_zone CASCADE;
DROP TABLE IF EXISTS sport_physical_priority CASCADE;
DROP TABLE IF EXISTS sport_key_action CASCADE;
DROP TABLE IF EXISTS sport CASCADE;

DROP TABLE IF EXISTS common_limiter CASCADE;
DROP TABLE IF EXISTS risk_zone CASCADE;
DROP TABLE IF EXISTS physical_priority CASCADE;
DROP TABLE IF EXISTS key_action CASCADE;
DROP TABLE IF EXISTS energy_profile CASCADE;
DROP TABLE IF EXISTS practice_volume CASCADE;
DROP TABLE IF EXISTS cod_demand CASCADE;

DROP TABLE IF EXISTS exercise_plane_mix CASCADE;
DROP TABLE IF EXISTS exercise_vector_mix CASCADE;

ALTER TABLE exercise 
  DROP COLUMN IF EXISTS laterality_support_id,
  DROP COLUMN IF EXISTS laterality_load_id,
  DROP COLUMN IF EXISTS ssc_demand_id,
  DROP COLUMN IF EXISTS impact_demand_id,
  DROP COLUMN IF EXISTS antirotation_stability_id,
  DROP COLUMN IF EXISTS movement_pattern_id;

DROP TABLE IF EXISTS antirotation_stability CASCADE;
DROP TABLE IF EXISTS impact_demand CASCADE;
DROP TABLE IF EXISTS ssc_demand CASCADE;
DROP TABLE IF EXISTS laterality_load CASCADE;
DROP TABLE IF EXISTS laterality_support CASCADE;
DROP TABLE IF EXISTS dominant_vector CASCADE;
```

---

## Próximos Pasos Después de la Migración

1. **Actualizar tipos TypeScript** para reflejar las nuevas tablas
2. **Actualizar capa de repositorio** para CRUD de deportes y ejercicios
3. **Crear UI** para gestión de catálogos
4. **Poblar ejercicios existentes** con los nuevos campos obligatorios
5. **Crear deportes de prueba** para validar funcionalidad completa

---

## Soporte

Si encuentras algún error durante la migración:

1. **No continuar** con las siguientes migraciones
2. **Capturar el mensaje de error completo**
3. **Ejecutar el rollback** si es necesario
4. **Reportar el problema** con el mensaje de error y el script que falló
