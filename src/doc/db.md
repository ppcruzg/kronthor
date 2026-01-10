-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.difficulty_level (
  id integer NOT NULL DEFAULT nextval('difficulty_level_id_seq'::regclass),
  name character varying NOT NULL,
  CONSTRAINT difficulty_level_pkey PRIMARY KEY (id)
);
CREATE TABLE public.equipment (
  id integer NOT NULL DEFAULT nextval('equipment_id_seq'::regclass),
  name character varying NOT NULL,
  CONSTRAINT equipment_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exercise (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name_es character varying NOT NULL,
  name_en character varying,
  description text,
  plane_id integer,
  laterality_id integer,
  difficulty_id integer,
  training_method_id integer,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  type_id integer NOT NULL,
  urlvideo character varying,
  CONSTRAINT exercise_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_plane_id_fkey FOREIGN KEY (plane_id) REFERENCES public.plane(id),
  CONSTRAINT exercise_laterality_id_fkey FOREIGN KEY (laterality_id) REFERENCES public.laterality(id),
  CONSTRAINT exercise_difficulty_id_fkey FOREIGN KEY (difficulty_id) REFERENCES public.difficulty_level(id),
  CONSTRAINT exercise_training_method_id_fkey FOREIGN KEY (training_method_id) REFERENCES public.training_method(id),
  CONSTRAINT fk_exercise_type FOREIGN KEY (type_id) REFERENCES public.exercise_type(id)
);
CREATE TABLE public.exercise_equipment (
  id integer NOT NULL DEFAULT nextval('exercise_equipment_id_seq'::regclass),
  exercise_id uuid,
  equipment_id integer,
  CONSTRAINT exercise_equipment_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_equipment_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercise(id),
  CONSTRAINT exercise_equipment_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id)
);
CREATE TABLE public.exercise_movement_pattern (
  id integer NOT NULL DEFAULT nextval('exercise_movement_pattern_id_seq'::regclass),
  exercise_id uuid,
  pattern_id integer,
  CONSTRAINT exercise_movement_pattern_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_movement_pattern_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercise(id),
  CONSTRAINT exercise_movement_pattern_pattern_id_fkey FOREIGN KEY (pattern_id) REFERENCES public.movement_pattern(id)
);
CREATE TABLE public.exercise_muscle (
  id integer NOT NULL DEFAULT nextval('exercise_muscle_id_seq'::regclass),
  exercise_id uuid NOT NULL,
  muscle_id integer NOT NULL,
  role character varying NOT NULL CHECK (role::text = ANY (ARRAY['primary'::character varying, 'secondary'::character varying]::text[])),
  CONSTRAINT exercise_muscle_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_muscle_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercise(id),
  CONSTRAINT exercise_muscle_muscle_id_fkey FOREIGN KEY (muscle_id) REFERENCES public.muscle(id)
);
CREATE TABLE public.exercise_muscle_subgroup (
  id integer NOT NULL DEFAULT nextval('exercise_muscle_subgroup_id_seq'::regclass),
  exercise_id uuid NOT NULL,
  subgroup_id integer NOT NULL,
  CONSTRAINT exercise_muscle_subgroup_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_muscle_subgroup_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercise(id)
);
CREATE TABLE public.exercise_type (
  id integer NOT NULL DEFAULT nextval('exercise_type_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT exercise_type_pkey PRIMARY KEY (id)
);
CREATE TABLE public.laterality (
  id integer NOT NULL DEFAULT nextval('laterality_id_seq'::regclass),
  name character varying NOT NULL,
  CONSTRAINT laterality_pkey PRIMARY KEY (id)
);
CREATE TABLE public.movement_pattern (
  id integer NOT NULL DEFAULT nextval('movement_pattern_id_seq'::regclass),
  name character varying NOT NULL,
  CONSTRAINT movement_pattern_pkey PRIMARY KEY (id)
);
CREATE TABLE public.muscle (
  id integer NOT NULL DEFAULT nextval('muscle_id_seq'::regclass),
  name character varying NOT NULL,
  group_id integer NOT NULL,
  CONSTRAINT muscle_pkey PRIMARY KEY (id),
  CONSTRAINT muscle_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.muscle_group(id)
);
CREATE TABLE public.muscle_group (
  id integer NOT NULL DEFAULT nextval('muscle_group_id_seq'::regclass),
  name character varying NOT NULL,
  CONSTRAINT muscle_group_pkey PRIMARY KEY (id)
);
CREATE TABLE public.physical_capability (
  id integer NOT NULL DEFAULT nextval('physical_capability_id_seq'::regclass),
  name character varying NOT NULL,
  CONSTRAINT physical_capability_pkey PRIMARY KEY (id)
);
CREATE TABLE public.physical_subcapability (
  id integer NOT NULL DEFAULT nextval('physical_subcapability_id_seq'::regclass),
  capability_id integer NOT NULL,
  name character varying NOT NULL,
  CONSTRAINT physical_subcapability_pkey PRIMARY KEY (id),
  CONSTRAINT physical_subcapability_capability_id_fkey FOREIGN KEY (capability_id) REFERENCES public.physical_capability(id)
);
CREATE TABLE public.plane (
  id integer NOT NULL DEFAULT nextval('plane_id_seq'::regclass),
  name character varying NOT NULL,
  CONSTRAINT plane_pkey PRIMARY KEY (id)
);
CREATE TABLE public.training_method (
  id integer NOT NULL DEFAULT nextval('training_method_id_seq'::regclass),
  subcapability_id integer NOT NULL,
  name character varying NOT NULL,
  description character varying,
  CONSTRAINT training_method_pkey PRIMARY KEY (id),
  CONSTRAINT training_method_subcapability_id_fkey FOREIGN KEY (subcapability_id) REFERENCES public.physical_subcapability(id)
);