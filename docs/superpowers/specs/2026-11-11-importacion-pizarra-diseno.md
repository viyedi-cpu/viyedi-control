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