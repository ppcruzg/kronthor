# PRD - Kronthor: Plataforma Inteligente para Planificación Deportiva (v2.0)

## 1. Introducción
**Kronthor** es una plataforma avanzada diseñada para la gestión integral del rendimiento deportivo. El sistema permite a entrenadores y equipos de alto rendimiento catalogar ejercicios, definir capacidades físicas y estructurar planes de entrenamiento basados en datos biomecánicos y metodológicos.

## 2. Visión General del Proyecto
Centralizar la inteligencia deportiva en una herramienta única que facilite la construcción de ejercicios complejos y la monitorización de atletas mediante un catálogo estructurado de capacidades y patrones de movimiento.

## 3. Arquitectura de Datos y Mapeo de Información
El sistema se apoya en un modelo relacional (detallado en `db.md`) que segmenta la información en capas lógicas:

### 3.1. Capa de Atributos Técnicos (Entidades Base)
Datos que sirven como clasificadores globales:
- `difficulty_level`: Niveles de esfuerzo percibido.
- `equipment`: Inventario de herramientas.
- `exercise_type`: Clasificación por naturaleza del ejercicio.
- `laterality`: Especificación de uso de extremidades.
- `plane`: Orientación en el espacio tridimensional.
- `muscle_group` & `muscle`: Mapa anatómico de referencia.

### 3.2. Capa de Ejecución y Metodología
- `physical_capability` & `subcapability`: Estructura jerárquica de objetivos físicos.
- `training_method`: Aplicación práctica de las capacidades al ejercicio.

### 3.3. Capa de Relaciones (Tablas Pivot/Junction)
- `exercise_muscle`: Vincula el ejercicio con roles musculares (Primario/Secundario).
- `exercise_equipment`: Equipamiento necesario por ejercicio.
- `exercise_movement_pattern`: Patrones de movimiento asociados.

---

## 4. Distribución de Captura de Información (Interacciones)

La captura de datos en Kronthor se organiza en tres modelos de interacción UX diseñados para mantener la integridad referencial:

### 4.1. Captura de Parámetros Globales (CRUD 1:1)
- **Pantallas**: `/admin/equipment`, `/admin/muscle`, `/admin/plane`, etc.
- **Interacción**: Diálogos (`Dialog`) simples de entrada de texto.
- **Mapeo DB**: Los datos fluyen directamente a las tablas de referencia. Es la base necesaria antes de crear ejercicios.

### 4.2. Captura de Entidad Núcleo (Formulario Maestro)
- **Pantalla**: `/admin/exercise`
- **Interacción**: `CreateExerciseDialog`. Es un formulario "Self-Contained" que permite:
  - Ingreso de metadatos (Nombres ES/EN, Video URL).
  - Selección de atributos mediante `Select` (Comboboxes) que consumen las tablas de la Capa 3.1.
- **Mapeo DB**: Puebla la tabla `exercise`. Garantiza que cada ejercicio tenga una clasificación técnica básica obligatoria.

### 4.3. Captura de Relaciones N:M (Asignación Masiva)
Para relaciones complejas, el sistema utiliza interfaces especializadas de asignación:
- **Pantallas**: `/admin/exercise-muscle`, `/admin/exercise-equipment`.
- **Interacción**:
  - **Single-Record**: Asignación uno a uno mediante selectores de ejercicio y atributo.
  - **Multi-Assignment (Pattern Muscle)**: Interfaz de doble lista con checkboxes para asignar múltiples músculos y roles (Primario/Secundario) a un mismo ejercicio en un solo paso.
- **Mapeo DB**: Puebla las tablas de la Capa 3.3. Incluye validaciones de duplicidad (Zod + Supabase RPC) para evitar inconsistencias de datos.

---

## 5. Funcionalidades del Panel Admin

### 5.1. Catálogo de Ejercicios
- **Búsqueda**: Filtros reactivos por nombre, músculo o patrón de movimiento.
- **Visualización**: Tabla con sistema de "Badges" para identificar rápidamente dificultad y equipamiento.
- **Media**: Acceso directo a video demostrativo mediante iconos de estado.

### 5.2. Dashboard de Entrenamiento
- Monitorización de progreso y visión clara sobre el rendimiento basado en la estructura de capacidades físicas.

---

## 6. Requisitos No Funcionales y Aestética
- **UI/UX**: Tema oscuro con acentos "Indigo" y "Slate". Uso intensivo de `backdrop-blur` y gradientes para una experiencia premium.
- **Validación**: Esquemas `Zod` en cliente y RLS (Row Level Security) en Supabase para proteger la estructura de la base de datos.
- **Performance**: Implementación de `useMemo` para filtrado local y paginación controlada para optimizar las consultas a la DB.
