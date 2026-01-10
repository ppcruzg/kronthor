-- =====================================================
-- Migration 05: Limpieza y Deprecación
-- =====================================================
-- Descripción: Limpia campos y tablas obsoletas después
-- de la migración. EJECUTAR SOLO DESPUÉS de validar que
-- los nuevos campos están correctamente poblados.
-- =====================================================

-- =====================================================
-- ADVERTENCIA
-- =====================================================
-- Este script es OPCIONAL y debe ejecutarse solo después de:
-- 1. Validar que todos los ejercicios tienen los nuevos campos
-- 2. Validar que exercise_plane_mix está correctamente poblado
-- 3. Validar que movement_pattern_id está correctamente asignado
-- 4. Hacer backup de la base de datos
-- =====================================================

-- =====================================================
-- 1. ELIMINAR TABLA exercise_movement_pattern
-- =====================================================
-- Esta tabla permitía múltiples patrones por ejercicio.
-- Ahora usamos exercise.movement_pattern_id (único).

-- Comentar para mantener temporalmente:
-- DROP TABLE IF EXISTS exercise_movement_pattern CASCADE;

-- =====================================================
-- 2. DEPRECAR CAMPO exercise.laterality_id
-- =====================================================
-- Este campo fue reemplazado por laterality_support_id y laterality_load_id.

-- Comentar para mantener temporalmente:
-- ALTER TABLE exercise DROP COLUMN IF EXISTS laterality_id;

-- =====================================================
-- 3. DEPRECAR CAMPO exercise.plane_id
-- =====================================================
-- Este campo fue reemplazado por exercise_plane_mix (mix ponderado).

-- Comentar para mantener temporalmente:
-- ALTER TABLE exercise DROP COLUMN IF EXISTS plane_id;

-- =====================================================
-- 4. ELIMINAR TABLA laterality (si ya no se usa)
-- =====================================================
-- Solo si laterality_id fue eliminado de exercise.

-- Comentar para mantener temporalmente:
-- DROP TABLE IF EXISTS laterality CASCADE;

-- =====================================================
-- NOTAS FINALES
-- =====================================================
-- Para ejecutar la limpieza completa, descomentar los comandos DROP/ALTER.
-- Se recomienda mantener los campos/tablas obsoletas por al menos 1 mes
-- en producción antes de eliminarlos definitivamente.
