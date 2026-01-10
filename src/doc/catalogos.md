KRONTHOR MVP – Pestañas Ejercicio y Deporte
Catálogos en tablas y combinaciones permitidas
Uso recomendado: copiar/pegar estos catálogos como listas cerradas (enums) en el sistema. Las “combinaciones” se expresan como reglas y plantillas para campos multi-selección y mix ponderado.
1. Pestaña: EJERCICIO (MVP)
1.1 Esquema de campos
Campo	Tipo	Obligatorio	Selección	Regla / valores (MVP)
nombre	Texto	Sí	Única	Nombre del ejercicio (sin abreviaturas ambiguas)
tipo_ejercicio	Enum	Sí	Única	compuesto | aislado (ver Catálogo: Tipo de ejercicio)
dificultad	Enum	Sí	Única	básico | intermedio | avanzado (ver Catálogo: Dificultad)
metodo_entrenamiento	Enum	Sí	Única	Ver Catálogo: Método de entrenamiento
equipo	Lista	Sí	Multi	Seleccionar 1–3; ver Catálogo: Equipo
plano	Mix ponderado	Sí	Mix	sagital | frontal | transversal (permite mix)
vector_dominante	Mix ponderado	Sí	Mix	horizontal | vertical | rotacional (permite mix)
patron_movimiento	Enum	Sí	Única	Ver Catálogo: Patrón de movimiento
lateralidad_apoyo	Enum	Sí	Única	bilateral | unilateral | alternante (define apoyo/soporte)
lateralidad_carga	Enum	Sí	Única	simétrica | asimétrica (offset) (define distribución de carga)
SSC_exigencia	Enum	Sí	Única	bajo | medio | alto
impacto_exigencia	Enum	Sí	Única	bajo | medio | alto
estabilidad_antirotacion	Enum	Sí	Única	baja | media | alta
musculos_primarios	Lista	Sí	Multi	Seleccionar 1–3; ver Catálogo: Músculos (grupos)
musculos_secundarios	Lista	No	Multi	Seleccionar 0–5; ver Catálogo: Músculos (grupos)

1.2 Catálogos (listas de selección)
Catálogo – Plano
Código	Valor	Descripción breve
SAG	sagital	Predomina flexo-extensión / desplazamiento antero-posterior
FRO	frontal	Predomina abducción/aducción / desplazamiento lateral
TRA	transversal	Predomina rotación / torsión alrededor del eje longitudinal

Catálogo – Vector dominante
Código	Valor	Descripción breve
HOR	horizontal	Fuerza/propulsión/frenado principalmente en horizontal
VER	vertical	Fuerza principalmente en vertical (soporte y propulsión vertical)
ROT	rotacional	Producción/resistencia de torque rotacional (tronco/cadera/hombro)

Catálogo – Lateralidad de apoyo
Código	Valor	Criterio operativo
BIL	bilateral	Ambos apoyos simultáneos; base estable
UNI	unilateral	Un solo apoyo dominante; requiere control de pelvis/rodilla
ALT	alternante	Unilateral alternado (pasos/cambios); soporte cambia repetidamente
Catálogo – Lateralidad de carga
Código	Valor	Criterio operativo
SIM	simétrica	Carga centrada y equilibrada (bilateral simétrica)
ASIM	asimétrica (offset)	Carga desplazada/unilateral (p. ej., suitcase, offset KB/DB)

Catálogo – Tipo de ejercicio
Código	Valor	Criterio operativo / uso típico
COMP	compuesto	Multiarticular; involucra ≥2 articulaciones y grandes masas musculares (p. ej., sentadilla, press, peso muerto)
AISL	aislado	Monoarticular o énfasis local; menor demanda sistémica (p. ej., curl, extensión de rodilla)

Catálogo – Dificultad
Código	Valor	Criterio operativo
BAS	básico	Técnica simple; bajo riesgo; fácil de enseñar y auto-regular
INT	intermedio	Técnica moderada; requiere control de carga/velocidad y supervisión ocasional
AVA	avanzado	Técnica compleja y/o alto riesgo; requiere coaching y criterios estrictos

Catálogo – Método de entrenamiento
Código	Valor	Descripción breve
FM	fuerza máxima	1–5 rep; altas cargas; descansos largos
HYP	hipertrofia	6–15 rep; volumen moderado-alto
FR	fuerza-resistencia	12–30 rep o densidad; descansos cortos
POT	potencia	cargas ligeras-moderadas con intención máxima; baja fatiga técnica
RFD	RFD/velocidad	énfasis en inicio rápido; repeticiones bajas
ISO	isométrico	holds; control y rigidez específica
ECC	excéntrico	tiempo excéntrico o sobrecarga excéntrica
PLY	pliometría/SSC	saltos y rebotes; SSC corto/largo
AER	aeróbico continuo	Z1–Z2; base aeróbica
INT	intervalos/HIIT	repeticiones por tiempo/distancia; recuperación definida
CIR	circuito	estaciones; densidad; trabajo mixto
SKL	técnica/skill	baja fatiga; alta calidad; feedback frecuente

Catálogo – Equipo
Código	Valor	Notas
NONE	sin equipo	Peso corporal / sin implementos
BAR	barra	Barra olímpica/hex (si aplica en tu catálogo)
DB	mancuernas	Par o individual
KB	kettlebell	KB simple/doble
PLT	discos	Discos/sandbag como carga
BND	bandas elásticas	Bandas circulares o largas
CAB	polea/cables	Polea simple o cruzada
MAC	máquina	Máquinas guiadas o selectorizadas
MB	balón medicinal	Lanzamientos, slams
BOX	caja/plyo	Saltos, step
SLD	trineo	Sled push/pull
RNG	anillas	Gimnasia
PULL	barra dominadas	Pull-up bar
ROW	ergómetro remo	RowErg
SKI	ergómetro ski	SkiErg
BIK	ergómetro bici	BikeErg/AirBike
ROP	cuerda	Saltos/trepa

Catálogo – Patrón de movimiento
Código	Valor	Notas
SQ	sentadilla (squat)	Dominio de rodilla; extensión cadera/rodilla
HN	bisagra (hinge)	Dominio de cadera; extensión cadera; posterior
LN	zancada (lunge/step)	Patrón de paso; unilateral funcional
PUSH_H	empuje horizontal	Press horizontal; proyección anterior
PUSH_V	empuje vertical	Press vertical; soporte escapular
PULL_H	tracción horizontal	Remo; retracción escapular
PULL_V	tracción vertical	Dominadas/polea; depresión escapular
CARRY	carga/porte (carry)	Farmer, front rack, overhead
ROT	rotación	Producción de rotación (torque)
ANTI	antirotación	Resistencia a rotación/inclinación
LOCO	locomoción cíclica	Correr, remar, ski, bici (si aplica)
JMP	salto/aterrizaje	Pliometría, aterrizaje, stiffness
SSC	ciclo estiramiento-acortamiento (SSC)	SSC general; rebote/contramovimiento; contacto medio/largo
SSC_R	SSC reactivo (contacto corto)	Tiempos de contacto cortos; alta rigidez; p. ej., pogos
DROP	caída + respuesta	Caídas (drop/depth) + rebote; alta demanda excéntrica y control de aterrizaje
SSC_TS	SSC tren superior	SSC en empuje/tracción (p. ej., plyo push-up, pases con contramovimiento)
SSC_L	SSC largo (contacto largo)	Tiempos de contacto más largos; potencia con contramovimiento (p. ej., CMJ)
THR	lanzamiento/golpe	MB throws/slams
COD	cambio de dirección (COD)	Aceleración-frenado y redirección

Catálogo – SSC_exigencia
Código	Valor	Guía
BAJO	bajo	Poca elasticidad/reactividad; sin rebotes; tempo controlado
MEDIO	medio	SSC presente pero no dominante; saltos bajos o ciclos moderados
ALTO	alto	SSC dominante; pliometría/reactividad alta; ciclos rápidos

Catálogo – Impacto_exigencia
Código	Valor	Guía
BAJO	bajo	Sin impactos relevantes; apoyo controlado; baja fuerza de reacción
MEDIO	medio	Impactos moderados o repetidos; aterrizajes controlados
ALTO	alto	Impacto alto (saltos, sprints, pliometría intensa)

Catálogo – Estabilidad_antirotacion
Código	Valor	Guía
BAJA	baja	Tronco estable sin demandas rotacionales relevantes
MEDIA	media	Requiere control de tronco/pelvis ante perturbaciones moderadas
ALTA	alta	Resistencia a rotación/inclinación crítica (unilateral pesado, carries, etc.)

Catálogo – Músculos (grupos)
Código	Grupo muscular	Notas
QUAD	cuádriceps	
HAM	isquiotibiales	
GLU_MAX	glúteo mayor	
GLU_MED	glúteo medio/abductores	
ADD	aductores	
CALF	pantorrilla (gemelos/soleo)	
TIB	tibial anterior	
ERCT	erectores espinales	
LAT	dorsal ancho	
TRAP	trapecio/escápula	
DEL	deltoides	
PEC	pectoral	
BIC	bíceps	
TRI	tríceps	
ABS	abdominales	recto/oblicuos/transverso (según tu desglose)
HIP_FLX	flexores de cadera	
ROT_CUFF	manguito rotador	
FORE	antebrazo/agarre	

1.3 Combinaciones permitidas (reglas + plantillas)
Objetivo: limitar combinaciones para que sean consistentes y computables (evitar infinitos formatos).
Campo	Tipo de combinación	Regla (MVP)	Plantillas permitidas (ejemplos)
plano	Mix ponderado	1–3 componentes; suma = 100; incrementos de 10; al menos un componente >= 50	SAG:100 | SAG:70|FRO:30 | SAG:60|TRA:40 | SAG:50|FRO:30|TRA:20
vector_dominante	Mix ponderado	1–3 componentes; suma = 100; incrementos de 10; al menos un componente >= 50	VER:100 | HOR:70|VER:30 | HOR:60|ROT:40 | HOR:50|VER:30|ROT:20
lateralidad (apoyo × carga)	Par de enums	Seleccionar 1 valor de apoyo + 1 valor de carga (obligatorio). Sin pesos.	BIL+SIM | BIL+ASIM | UNI+SIM | UNI+ASIM | ALT+SIM | ALT+ASIM
equipo	Multi-selección	1–3 selecciones; usar códigos del catálogo; ordenar por relevancia	BAR | BAR+PLT | ROW | KB+BOX (si aplica)
musculos_primarios	Multi-selección	1–3 selecciones; deben reflejar el motor principal del gesto	GLU_MAX+HAM | QUAD | PEC+TRI
musculos_secundarios	Multi-selección	0–5 selecciones; músculos de asistencia/estabilización	ABS+TRAP | GLU_MED+CALF+FORE

2. Pestaña: DEPORTE (MVP)
2.1 Esquema de campos
Campo	Tipo	Obligatorio	Selección	Regla / valores (MVP)
sport_id	Texto	Sí	Única	Código único (sin espacios). Recomendado: SPORT_XXXX
deporte	Texto	Sí	Única	Nombre del deporte
posicion_prueba	Texto	No	Única	Posición/prueba si aplica (si no, vacío)
acciones_clave	Lista	Sí	Multi	Seleccionar 6–10 del catálogo; sin duplicados
prioridades_fisicas	Lista ordenada	Sí	Ordenada	Seleccionar 3–5 del catálogo; el orden importa
vector_dominante	Mix ponderado	Sí	Mix	horizontal | vertical | rotacional (permite mix)
plano_dominante	Mix ponderado	Sí	Mix	sagital | frontal | transversal (permite mix)
lateralidad_apoyo	Enum	Sí	Única	bilateral | unilateral | alternante
lateralidad_carga	Enum	Sí	Única	simétrica | asimétrica (offset)
estabilidad_antirotacion	Enum	Sí	Única	baja | media | alta
COD_exigencia	Enum	Sí	Única	bajo | medio | alto
SSC_exigencia	Enum	Sí	Única	bajo | medio | alto
impacto_exigencia	Enum	Sí	Única	bajo | medio | alto
volumen_practica_tipico	Enum	Sí	Única	baja | media | alta
perfil_energetico	Enum	Sí	Única	continuo | intermitente | mixto
zonas_riesgo_tipicas	Lista	Sí	Multi	Seleccionar 1–3 del catálogo; sin duplicados
limitantes_comunes	Lista	Sí	Multi	Seleccionar 1–3 del catálogo; sin duplicados

2.2 Catálogos (listas de selección)
Catálogo – Acciones clave (genérico)
Código	Acción	Notas
ACC	aceleración 0–10 m	Inicio y salida; fuerza horizontal
SPD	velocidad máxima	Sprint; mecánica y SSC
RSA	esfuerzos repetidos	Repeated sprints/intervalos cortos
COD	cambio de dirección	Frenado, re-aceleración y redirección
JMP	salto/aterrizaje	Altura, rigidez, absorción
THR	lanzamiento/golpe	Medball/impacto; coordinación
LIFT	levantamiento	Patrones de fuerza con carga externa
CARRY	cargas/portes	Farmer/front rack/overhead
ROT	rotación específica	Torque de tronco/cadera/hombro
ANTI	antirotación	Resistencia a rotación/inclinación
AER	resistencia continua	Trabajo sostenido; base aeróbica
INT	intermitente	Cambios de ritmo; pausa-trabajo
SKL	técnica/precisión	Habilidad y control fino

Catálogo – Prioridades físicas
Código	Prioridad	Notas
STR	fuerza máxima	
HYP	hipertrofia	
PWR	potencia/RFD	
SPD	velocidad	
AGI	agilidad/COD	
AER	resistencia aeróbica	
ANA	resistencia anaeróbica	
FR	fuerza-resistencia	
MOB	movilidad	
STAB	estabilidad del tronco	
SKL	técnica/skill	
TOL	tolerancia de tejidos	tendón/hueso/fascia según demandas

Catálogo – Vector dominante (igual que en Ejercicio)
Código	Valor	Descripción breve
HOR	horizontal	Fuerza/propulsión/frenado principalmente en horizontal
VER	vertical	Fuerza principalmente en vertical (soporte y propulsión vertical)
ROT	rotacional	Producción/resistencia de torque rotacional (tronco/cadera/hombro)

Catálogo – Plano dominante (igual que en Ejercicio)
Código	Valor	Descripción breve
SAG	sagital	Predomina flexo-extensión / desplazamiento antero-posterior
FRO	frontal	Predomina abducción/aducción / desplazamiento lateral
TRA	transversal	Predomina rotación / torsión alrededor del eje longitudinal

Catálogo – Lateralidad de apoyo (demanda del deporte)
Código	Valor	Criterio operativo
BIL	bilateral	Apoyo con ambos pies/manos simultáneamente; base simétrica.
UNI	unilateral	Apoyo dominante en un solo pie/mano por repetición o fase; alta demanda de control.
ALT	alternante	Apoyo unilateral alternado (izq/der) por repeticiones o ciclos; demanda coordinativa moderada-alta.
Catálogo – Lateralidad de carga (demanda del deporte)
Código	Valor	Criterio operativo
SIM	simétrica	Carga distribuida simétricamente (dos manos/dos implementos; barra al centro).
ASIM	asimétrica (offset)	Carga desplazada/offset (una mano, una mancuerna/kettlebell; implemento unilateral).
Catálogo – Estabilidad_antirotacion (igual que en Ejercicio)
Código	Valor	Guía
BAJA	baja	Tronco estable sin demandas rotacionales relevantes
MEDIA	media	Requiere control de tronco/pelvis ante perturbaciones moderadas
ALTA	alta	Resistencia a rotación/inclinación crítica (unilateral pesado, carries, etc.)

Catálogo – COD_exigencia
Código	Valor	Guía
BAJO	bajo	Pocos COD; ángulos pequeños; baja frecuencia
MEDIO	medio	COD moderados; ángulos variados; frecuencia media
ALTO	alto	COD frecuentes; ángulos altos (90–180); frenado exigente

Catálogo – SSC_exigencia (igual que en Ejercicio)
Código	Valor	Guía
BAJO	bajo	Poca elasticidad/reactividad; sin rebotes; tempo controlado
MEDIO	medio	SSC presente pero no dominante; saltos bajos o ciclos moderados
ALTO	alto	SSC dominante; pliometría/reactividad alta; ciclos rápidos

Catálogo – Impacto_exigencia (igual que en Ejercicio)
Código	Valor	Guía
BAJO	bajo	Sin impactos relevantes; apoyo controlado; baja fuerza de reacción
MEDIO	medio	Impactos moderados o repetidos; aterrizajes controlados
ALTO	alto	Impacto alto (saltos, sprints, pliometría intensa)

Catálogo – Volumen_practica_tipico
Código	Valor	Guía
BAJA	baja	Baja exposición semanal o estacional; menor volumen técnico
MEDIA	media	Exposición moderada; volumen consistente
ALTA	alta	Alta exposición; volumen elevado de práctica y/o competición

Catálogo – Perfil_energetico
Código	Valor	Guía
CONT	continuo	Esfuerzo sostenido; pocas pausas
INT	intermitente	Trabajo-pausa; esfuerzos repetidos
MIX	mixto	Componentes continuos e intermitentes relevantes

Catálogo – Zonas_riesgo_tipicas
Código	Zona	Notas
KNEE	rodilla	
HIP	cadera	
ANK	tobillo/pie	
LSP	lumbar	
TSP	torácica	
SHO	hombro	
ELB	codo	
WRI	muñeca/mano	
NEC	cuello	

Catálogo – Limitantes_comunes
Código	Limitante	Notas
STR	fuerza insuficiente	
PWR	potencia/RFD insuficiente	
AER	base aeróbica insuficiente	
ANA	tolerancia anaeróbica insuficiente	
MOB	movilidad/ROM limitado	
STAB	estabilidad del tronco insuficiente	
TECH	técnica/skill deficiente	
TOL	tolerancia de tejidos baja	tendón/hueso/fascia; historial lesional
END	resistencia local insuficiente	
lateralidad_apoyo × lateralidad_carga	Combo cruzado	Seleccionar 1 valor de apoyo y 1 valor de carga; todas las combinaciones permitidas

2.3 Combinaciones permitidas (reglas + plantillas)
Estas combinaciones definen formatos aceptados y límites de selección para mantener consistencia.
Campo	Tipo de combinación	Regla (MVP)	Plantillas permitidas (ejemplos)
vector_dominante	Mix ponderado	1–3 componentes; suma = 100; incrementos de 10; al menos un componente >= 50	HOR:100 | HOR:70|VER:30 | VER:60|ROT:40 | HOR:50|VER:30|ROT:20
plano_dominante	Mix ponderado	1–3 componentes; suma = 100; incrementos de 10; al menos un componente >= 50	SAG:100 | SAG:70|FRO:30 | FRO:60|TRA:40 | SAG:50|FRO:30|TRA:20
acciones_clave	Lista	Elegir 6–10; sin duplicados; orden opcional (si quieres ranking, usa Lista ordenada)	ACC, COD, RSA, AER, CARRY, SKL (ejemplo)
prioridades_fisicas	Lista ordenada	Elegir 3–5; sin duplicados; el orden define prioridad	1) AER 2) FR 3) PWR (ejemplo)
zonas_riesgo_tipicas	Lista	Elegir 1–3; sin duplicados	KNEE+LSP | SHO | HIP+ANK (ejemplo)
limitantes_comunes	Lista	Elegir 1–3; sin duplicados	AER+TECH | STR | TOL+MOB (ejemplo)
lateralidad_apoyo × lateralidad_carga	Combo cruzado	Seleccionar 1 valor de apoyo y 1 valor de carga; todas las combinaciones permitidas	BIL+SIM | BIL+ASIM | UNI+SIM | UNI+ASIM | ALT+SIM | ALT+ASIM

