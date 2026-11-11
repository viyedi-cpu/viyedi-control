# Lector de pizarras VIYEDI — prototipo de integración

Rama de pruebas: `spike/pizarra-ia-revision`, basada en NOTA 002. No integrar en producción sin revisión.

## Qué permite probar
- En el apartado **Producción**, nuevo botón **Importar pizarra (prueba)**.
- Elegir foto JPG/PNG/WEBP, revisar fecha, ver imagen.
- Si hay API local conectada: intentar extraer filas manuscritas y tandas de la fotografía.
- Si no hay API: botón **Ejemplo manual** y botón **+ Fila**, campos corregibles.
- Vincular trabajadores conocidos *solo como propuesta* y descargar borrador JSON.

NUNCA cambia pagos, actividades definitivas, trabajadores, adelantos ni descuentos. La extracción devuelve un borrador para revisión.

## Cómo probar lógica sin clave
Desde el repo:

```bash
node --test api/validar-pizarra.test.mjs
```

## Cómo habilitar la API de lectura local (no en el teléfono)
Requiere Node 20+ y una clave privada de API de OpenAI, obtenida fuera de este chat. **No publiques la clave ni la introduzcas en la aplicación web.**

```bash
export OPENAI_API_KEY="clave-en-tu-entorno-local"
export OPENAI_MODEL="gpt-5.4-mini"
node api/pizarra-server.mjs
```

Por defecto, la API escucha exclusivamente en `127.0.0.1:8787`. Permite CORS solo desde `https://viyedi-cpu.github.io`; cambiar `ALLOWED_ORIGIN` si se prueba desde otro origen. El botón del frontend intenta usar `http://127.0.0.1:8787/api/pizarra`, que requiere ejecutar el servidor en la misma computadora que usa el navegador.

**Para usarlo desde teléfonos se necesita desplegar un backend HTTPS** con autenticación, límites de uso y control de costos. GitHub Pages no puede alojar este servicio ni guardar la clave con seguridad.

## Pendientes antes de llevarlo a producción
- Prueba real API con 7 pizarras y 2 imágenes ajenas.
- Control de duplicados persistente y evitar importar fechas/sucursales incorrectas.
- Vinculación humana de apodos/trabajadores, roles y permisos.
- Auditoría de borradores, almacenamiento privado de imágenes y política de retención.
- Integración con guardado de jornadas después de aprobación humana.
- Pruebas de seguridad, control de cuotas y un mecanismo de cancelación.

## Casos esperados
Una imagen de banco o equipo electrónico debe clasificarse como `otro` y devolver cero filas; una pizarra dudosa debe marcarse `dudosa`. Un dato ilegible se devuelve como `null`, no cero. La aplicación recalcula totales por tandas sin confiar en la cifra manuscrita.
