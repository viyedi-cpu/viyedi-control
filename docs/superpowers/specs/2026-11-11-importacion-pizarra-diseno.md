# VIYEDI Control — importación de pizarra con revisión humana
Fecha: 2026-11-11. Estado: prototipo, no listo para producción.

## Objetivo
Subir fotografía de pizarra, identificar si es de jornadas de Producción, extraer cantidades por trabajador/actividad/tanda y permitir corregir todo antes de guardar.

## Restricciones confirmadas
- Producción únicamente; semana de lunes a domingo. Ventas queda fuera.
- La IA no crea trabajadores, no decide pagos y no inventa datos ilegibles.
- Nombre nuevo/apodo: conservar nombre leído y marcar pendiente de vincular. Nunca asociación dudosa automática.
- Pelar, matar, champar y pintar son actividades distintas, aunque correspondan a los mismos pollos.
- Los descuentos y adelantos pertenecen a otra sección.
- Datos ilegibles: null/pendiente, no cero. Sumas deben calcularse por código y contrastarse con totales de pizarra.
- Imágenes ajenas se rechazan. Errores o ausencia de API no deben impedir cargar manualmente.
- Nunca escribir S.activities, S.advances, S.discounts ni S.payments desde la extracción.

## Opciones evaluadas
1. OCR clásico: menos costo, peor para manuscritos — descartado.
2. API de visión con resultado estructurado y aprobación humana — seleccionado.
3. Agente autónomo que completa pagos — descartado.

## Alcance de este prototipo
- Entrada de fotografía en módulo Producción, previsualización y revisión editable.
- API opcional en backend local que devuelve borrador estructurado; sin guardar salarios.
- Rechazo de archivo no permitido, foto ajena, sumas equivocadas, campos dudosos y duplicados potenciales.
- Sin API conectada, interfaz manual con mensaje sincero, no simulación de análisis.
- Seguridad: OPENAI_API_KEY solo servidor, límite de tamaño, sin logging de fotos, escucha localhost.
- Para desplegar: HTTPS, autenticación real, rate limiting, gasto máximo, almacenamiento de auditoría y deduplicación persistente.

## No incluido
Despliegue público ni acceso real a API (requiere credenciales y servidor), guardado definitivo, pagos, permisos de producción y multas.

## Aceptación
Una imagen bancaria no produce registros; los nombres dudosos no se asignan; las sumas se verifican; se pueden corregir filas; nada modifica la planilla real.

## Ampliaciones solicitadas — 2026-11-11
- Si un nombre no coincide con el padrón, mostrar decisión Sí/No: Sí inicia alta regular (solo tras completar ficha y confirmar); No crea una identidad eventual asociada a la fecha y actividades, sin incluirla automáticamente en plantilla permanente. Reutilizar identidad si regresa, y permitir convertirla sin duplicar historial.
- Foto idéntica: comparación SHA-256 del archivo contra registros de importaciones. Mismo contenido con otra foto: comparación semántica de fecha, trabajador, actividad y tandas. Ante coincidencia, sugerir revisar/actualizar un registro existente, nunca duplicar automáticamente. En spike esto se limitará a alerta de sesión; producción necesita persistencia transaccional.
- Comparación preliminar: sumar todas las boletas de pollo vivo de la fecha y comparar con pelado declarado. Diferencia absoluta 0 = coincide, 1..9 = observación roja pequeña, >=10 = revisión urgente. Detectar también exceso de pelado sobre recibidos. La alerta no implica por sí sola faltante, culpa, ni descuento.
- Conciliación definitiva necesita saldo inicial, bajas, saldo final, registros de otros días y fechas de sacrificio; si se desconocen estos movimientos, mostrar siempre "preliminar" y no presentar diferencias como faltantes definitivos. Imagen dudosa o campos sin registrar: no marcar como conciliada.
- No sustituir botón de guardado de pizarra real: estos cambios se prueban en spike con borradores, sin guardar en S.activities.
