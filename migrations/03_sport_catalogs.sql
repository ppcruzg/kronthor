-- =====================================================
-- Migration 03: Catálogos Específicos de Deporte
-- =====================================================
-- Descripción: Crea tablas de catálogo exclusivas para
-- la pestaña Deporte.
-- =====================================================

-- =====================================================
-- 1. COD EXIGENCIA
-- =====================================================
CREATE TABLE cod_demand (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

INSERT INTO cod_demand (code, name, description) VALUES
  ('BAJO', 'bajo', 'Pocos COD; ángulos pequeños; baja frecuencia'),
  ('MEDIO', 'medio', 'COD moderados; ángulos variados; frecuencia media'),
  ('ALTO', 'alto', 'COD frecuentes; ángulos altos (90–180); frenado exigente');

-- RLS
ALTER TABLE cod_demand ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cod_demand"
  ON cod_demand FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify cod_demand"
  ON cod_demand FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- =====================================================
-- 2. VOLUMEN DE PRÁCTICA
-- =====================================================
CREATE TABLE practice_volume (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

INSERT INTO practice_volume (code, name, description) VALUES
  ('BAJA', 'baja', 'Baja exposición semanal o estacional; menor volumen técnico'),
  ('MEDIA', 'media', 'Exposición moderada; volumen consistente'),
  ('ALTA', 'alta', 'Alta exposición; volumen elevado de práctica y/o competición');

-- RLS
ALTER TABLE practice_volume ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view practice_volume"
  ON practice_volume FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify practice_volume"
  ON practice_volume FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- =====================================================
-- 3. PERFIL ENERGÉTICO
-- =====================================================
CREATE TABLE energy_profile (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

INSERT INTO energy_profile (code, name, description) VALUES
  ('CONT', 'continuo', 'Esfuerzo sostenido; pocas pausas'),
  ('INT', 'intermitente', 'Trabajo-pausa; esfuerzos repetidos'),
  ('MIX', 'mixto', 'Componentes continuos e intermitentes relevantes');

-- RLS
ALTER TABLE energy_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view energy_profile"
  ON energy_profile FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify energy_profile"
  ON energy_profile FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- =====================================================
-- 4. ACCIONES CLAVE
-- =====================================================
CREATE TABLE key_action (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

INSERT INTO key_action (code, name, description) VALUES
  ('ACC', 'aceleración 0–10 m', 'Inicio y salida; fuerza horizontal'),
  ('SPD', 'velocidad máxima', 'Sprint; mecánica y SSC'),
  ('RSA', 'esfuerzos repetidos', 'Repeated sprints/intervalos cortos'),
  ('COD', 'cambio de dirección', 'Frenado, re-aceleración y redirección'),
  ('JMP', 'salto/aterrizaje', 'Altura, rigidez, absorción'),
  ('THR', 'lanzamiento/golpe', 'Medball/impacto; coordinación'),
  ('LIFT', 'levantamiento', 'Patrones de fuerza con carga externa'),
  ('CARRY', 'cargas/portes', 'Farmer/front rack/overhead'),
  ('ROT', 'rotación específica', 'Torque de tronco/cadera/hombro'),
  ('ANTI', 'antirotación', 'Resistencia a rotación/inclinación'),
  ('AER', 'resistencia continua', 'Trabajo sostenido; base aeróbica'),
  ('INT', 'intermitente', 'Cambios de ritmo; pausa-trabajo'),
  ('SKL', 'técnica/precisión', 'Habilidad y control fino');

-- RLS
ALTER TABLE key_action ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view key_action"
  ON key_action FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify key_action"
  ON key_action FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- =====================================================
-- 5. PRIORIDADES FÍSICAS
-- =====================================================
CREATE TABLE physical_priority (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

INSERT INTO physical_priority (code, name, description) VALUES
  ('STR', 'fuerza máxima', NULL),
  ('HYP', 'hipertrofia', NULL),
  ('PWR', 'potencia/RFD', NULL),
  ('SPD', 'velocidad', NULL),
  ('AGI', 'agilidad/COD', NULL),
  ('AER', 'resistencia aeróbica', NULL),
  ('ANA', 'resistencia anaeróbica', NULL),
  ('FR', 'fuerza-resistencia', NULL),
  ('MOB', 'movilidad', NULL),
  ('STAB', 'estabilidad del tronco', NULL),
  ('SKL', 'técnica/skill', NULL),
  ('TOL', 'tolerancia de tejidos', 'tendón/hueso/fascia según demandas');

-- RLS
ALTER TABLE physical_priority ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view physical_priority"
  ON physical_priority FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify physical_priority"
  ON physical_priority FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- =====================================================
-- 6. ZONAS DE RIESGO
-- =====================================================
CREATE TABLE risk_zone (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

INSERT INTO risk_zone (code, name, description) VALUES
  ('KNEE', 'rodilla', NULL),
  ('HIP', 'cadera', NULL),
  ('ANK', 'tobillo/pie', NULL),
  ('LSP', 'lumbar', NULL),
  ('TSP', 'torácica', NULL),
  ('SHO', 'hombro', NULL),
  ('ELB', 'codo', NULL),
  ('WRI', 'muñeca/mano', NULL),
  ('NEC', 'cuello', NULL);

-- RLS
ALTER TABLE risk_zone ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view risk_zone"
  ON risk_zone FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify risk_zone"
  ON risk_zone FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');

-- =====================================================
-- 7. LIMITANTES COMUNES
-- =====================================================
CREATE TABLE common_limiter (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

INSERT INTO common_limiter (code, name, description) VALUES
  ('STR', 'fuerza insuficiente', NULL),
  ('PWR', 'potencia/RFD insuficiente', NULL),
  ('AER', 'base aeróbica insuficiente', NULL),
  ('ANA', 'tolerancia anaeróbica insuficiente', NULL),
  ('MOB', 'movilidad/ROM limitado', NULL),
  ('STAB', 'estabilidad del tronco insuficiente', NULL),
  ('TECH', 'técnica/skill deficiente', NULL),
  ('TOL', 'tolerancia de tejidos baja', 'tendón/hueso/fascia; historial lesional'),
  ('END', 'resistencia local insuficiente', NULL);

-- RLS
ALTER TABLE common_limiter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view common_limiter"
  ON common_limiter FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can modify common_limiter"
  ON common_limiter FOR ALL
  USING (auth.jwt() ->> 'role' = 'superadmin');
