# Laboratorio MVH — luz, ambiente y tecnología

## Propósito

El Laboratorio MVH ofrece una experiencia pública y educativa en tres capas:

1. indicadores meteorológicos y solares actualizados;
2. familias de fuentes de luz;
3. familias de luminarias y una ruta básica de selección.

No diagnostica una instalación, no selecciona productos comerciales y no
declara conformidad.

## Fuente dinámica

- Proveedor: Open-Meteo.
- Servicio: Forecast API.
- Condiciones actuales: datos de modelos meteorológicos con intervalo reportado
  de 15 minutos.
- Actualización de la interfaz: al cargar, al cambiar de ubicación, por acción
  del visitante y cada 15 minutos mientras la página está visible.
- Persistencia: ninguna.
- Geolocalización: únicamente por acción del visitante; no se almacena ni se
  transmite a MVH.

Variables mostradas:

- temperatura a 2 m;
- humedad relativa;
- nubosidad;
- precipitación;
- velocidad del viento a 10 m;
- radiación global horizontal;
- radiación directa normal;
- radiación difusa horizontal;
- amanecer y atardecer;
- duración del día;
- duración estimada de sol;
- radiación diaria acumulada del modelo.

## Fuentes oficiales complementarias

- IDEAM, Atlas climatológico de Colombia.
- IDEAM, indicador de brillo solar.
- IDEAM, información estadística de radiación global en superficie.

La integración directa con estaciones del IDEAM queda como evolución futura y
solo debe habilitarse cuando exista un servicio estable, documentado y con
metadatos suficientes para diferenciar medición, validación y provisionalidad.

## Controles científicos

- La interfaz usa “datos modelados y actualizados”; no usa “medición MVH”.
- La duración de sol se identifica como estimación del modelo.
- La radiación no se presenta como iluminancia.
- No se convierten valores meteorológicos en cumplimiento normativo.
- No se hardcodean umbrales de RETILAP, CIE o normas internacionales.
- Los indicadores no sustituyen reconocimiento, simulación o medición en sitio.

## Accesibilidad y contingencia

- Los tres módulos funcionan con teclado y controles táctiles.
- Los datos numéricos tienen etiquetas y unidades visibles.
- La gráfica horaria conserva valores textuales accesibles.
- Si falla la conexión, se informa el error y se mantiene disponible el
  contenido educativo.
- La ubicación del dispositivo requiere permiso explícito.
