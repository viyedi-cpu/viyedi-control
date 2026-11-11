# Lector de pizarras — plan de prototipo
Goal: un panel revisable integrado a Producción que no pueda alterar liquidaciones.
Architecture: extensión JavaScript del HTML existente; Node server local para OpenAI Responses API opcional; sin almacenamiento real.
Tech stack: HTML/JS existente y Node nativo.
Spec: docs/superpowers/specs/2026-11-11-importacion-pizarra-diseno.md
Branch: spike/pizarra-ia-revision.

1. Crear pruebas para normalización y validación del JSON extraído.
2. Implementar lógica determinista: tipo de imagen, cantidades, totales, estados de revisión, diferencias.
3. Crear backend local para fotografías JPG/PNG/WEBP con clave secreta en variable de entorno.
4. Implementar interfaz de subir foto, ver imagen, editar filas y marcar pendientes; nunca guardar jornadas reales.
5. Verificar regresiones manuales del módulo Producción y casos de pizarra no reconocida, error API, nombres nuevos y duplicados.
6. Revisar y aprobar seguridad y diseño antes de desplegar o permitir guardar datos.

Review focus: archivo bancario rechazado; números ilegibles pendientes; no autovinculación; no doble importación; sin falsa respuesta IA.