# Ingeniería MVH — web pública

Candidato de preproducción de la experiencia digital pública de Ingeniería MVH.
La aplicación privada MVH Digital no forma parte de este proyecto y no se
encuentra embebida ni conectada.

## Estado

- Versión del candidato: 0.9.0.
- Acceso previsto: privado, únicamente para revisión del propietario.
- Indexación: bloqueada mediante metadatos y `robots.txt`.
- Formulario: simulación local; no almacena ni transmite datos.
- WhatsApp y correo: enlaces preparados para que el visitante inicie el contacto
  voluntariamente.
- Centro de conocimiento: ocho contenidos iniciales organizados en normativa,
  consultas resueltas, curiosidades y aprendizaje práctico, con filtros locales
  y límites editoriales. Incluye un mapa de diez fuentes nacionales e
  internacionales clasificadas por jerarquía y función, además de tres
  microjuegos accesibles que no almacenan puntajes ni datos personales.
- Laboratorio MVH: observatorio ambiental con información modelada y actualizada
  de Open-Meteo, referencias oficiales del IDEAM y módulos educativos sobre
  fuentes de luz, luminarias y criterios de selección. No presenta estos datos
  como mediciones en sitio ni genera conclusiones automáticas.
- Dominio propio: pendiente de selección y conexión.
- Política de privacidad y términos: pendientes de aprobación antes de apertura
  pública.

## Ejecución local

Requiere Node.js `>=22.13.0` y pnpm.

```bash
pnpm install
pnpm dev
pnpm test
```

## Estructura

- `app/`: envoltorio de despliegue.
- `public/`: sitio editorial de dieciséis páginas y sus recursos.
- `tests/`: verificaciones del candidato renderizado.
- `docs/PREPRODUCCION_PRIVADA.md`: alcance y evidencia de control de calidad.
- `docs/CONVERSION_Y_ANALITICA.md`: recorrido comercial y límites de analítica.
- `docs/CENTRO_DE_CONOCIMIENTO.md`: gobierno y operación editorial del centro de
  conocimiento.
- `docs/LABORATORIO_LUZ_AMBIENTE.md`: fuentes, límites, actualización y pruebas
  del observatorio y del atlas tecnológico.
- `.openai/hosting.json`: identificador y recursos del proyecto de alojamiento.

## Reglas de liberación

No abrir al público ni habilitar indexación hasta aprobar:

1. textos jurídicos;
2. tratamiento de datos y analítica;
3. recepción segura del formulario;
4. dominio y correo corporativos;
5. revisión final de contenidos;
6. separación y acceso seguro a MVH Digital.
