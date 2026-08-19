# Preproducción privada — control de calidad

## Alcance

La revisión corresponde al sitio público de Ingeniería MVH. MVH Digital se
mantiene separado y no fue modificado.

## Controles ejecutados

- Compilación de producción.
- Pruebas automatizadas del envoltorio de alojamiento.
- Inventario de dieciséis páginas HTML.
- Revisión de navegación principal y páginas clave.
- Revisión responsiva en 1440 × 900, 1024 × 768 y 390 × 844.
- Menú móvil y cierre mediante teclado.
- Ausencia de desbordamiento horizontal en las vistas revisadas.
- Flujo completo del formulario con información ficticia.
- Selección de municipio dependiente del departamento.
- Identificación automática de actividad económica a partir del CIIU 8610.
- Revisión previa de la solicitud.
- Conservación de la línea consultada desde las cinco páginas de servicio.
- Mensajes de WhatsApp y asuntos de correo contextualizados por servicio.
- Descarte de parámetros de línea no reconocidos.
- Distribución de diecisiete imágenes optimizadas sin repeticiones.
- Simulación de envío sin transmisión ni almacenamiento.
- Confirmación de que MVH Digital permanece deshabilitado.
- Revisión de errores y advertencias de consola.

## Resultado

El candidato es apto para demostración privada y pruebas del propietario. No es
una liberación pública definitiva.

## Incidente de preproducción resuelto

La primera publicación privada permitió detectar que el navegador bloqueaba el
recurso genérico `config.js`. El recurso se renombró como
`mvh-site-settings.js`, se actualizaron todas las páginas y se repitieron la
compilación y las pruebas. El cambio restablece los enlaces de contacto y el
bloqueo visible de MVH Digital.

También se sustituyeron las referencias visibles a “prototipo local” por
“preproducción privada” para que el estado comunicado coincida con el entorno.

## Pendientes para apertura pública

- Aprobar privacidad, términos y autorización de datos.
- Definir el mecanismo seguro de recepción del formulario.
- Aprobar analítica respetuosa de la privacidad.
- Seleccionar y conectar el dominio.
- Configurar correo corporativo.
- Ejecutar pruebas en dispositivos físicos y navegadores objetivo.
- Definir el acceso seguro y definitivo a MVH Digital.
