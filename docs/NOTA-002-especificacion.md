# NOTA 002 — Usuarios, permisos, estructura y auditoría

Estado: especificación en construcción.  
Rama de trabajo: `nota-002-usuarios-permisos-auditoria`  
Regla: no implementar cambios funcionales hasta que Victor cierre la definición de creación de usuarios y permisos.

## 1. Panel de Control
Menú principal:
- Inicio
- Usuarios
- Logística
- Producción
- Clientes y Cobranza
- Sucursales
- Trabajadores
- Reportes

### Cambio de nombre
- "Despachos" pasa a llamarse "Logística".
- Dentro de Logística, inicialmente existirá Despachos.
- A futuro podrá crecer con Rutas, Entregas, Vehículos e Historial, sin rehacer el módulo.

## 2. Separación de conceptos
- Trabajador: persona que trabaja para VIYEDI.
- Usuario: persona con credenciales y permisos para entrar a VIYEDI Control.
- Cliente: entidad comercial a la que se vende/cobra.
- Un trabajador puede existir sin usuario.
- Un usuario puede corresponder a una persona administrativa/directiva que no sea trabajador operativo.
- Un cliente nunca debe confundirse con usuario o trabajador.

## 3. Perfiles / cargos generales
Perfiles previstos:
- Propietario
- Administración y Contabilidad
- Gerencia
- Coordinación de Operaciones y Logística
- Tienda / Sucursal
- Producción

Notas:
- Rafael y Rebeca: Propietarios.
- Victor: Administrador raíz del sistema; a nivel laboral, Coordinación de Operaciones y Logística.
- La cuenta raíz de Victor no debe poder ser desactivada ni perder permisos por acción de otro usuario.
- La hermana de Victor: Administración y Contabilidad.
- El hermano de Victor: Gerencia.
- Los cargos no definen automáticamente los permisos; los permisos se asignan aparte.

## 4. Trabajadores de Tienda / Sucursal
- Tienen una sucursal principal.
- Pueden ser asignados temporalmente a otra sucursal por casos especiales.
- La asignación temporal no cambia la sucursal principal.
- Ejemplo: Mayra pertenece a La Pampa, pero un día puede trabajar en Cotoca.
- Cobrar no será un cargo; será un permiso asignable.

## 5. Trabajadores de Producción
- No tendrán un cargo fijo obligatorio como Pelador, Champador, Matador, etc.
- La actividad real se registra día por día.
- Un trabajador puede pelar un día y champar otro.
- Las actividades que sabe realizar pueden guardarse de forma informativa, sin limitar la planilla.
- La planilla debe calcular según la actividad realmente registrada ese día.

## 6. Creación de Usuario
Flujo previsto:
1. Elegir a quién se dará acceso:
   - Persona administrativa/directiva.
   - Trabajador existente.
2. Si se elige trabajador existente, vincular el usuario a su ficha laboral sin duplicar datos.
3. La aplicación sugerirá automáticamente un nombre de usuario.
4. El nombre sugerido será editable antes de guardar.
5. Si el nombre ya existe, sugerir siguiente correlativo disponible.
6. La aplicación sugerirá una contraseña temporal.
7. La contraseña temporal podrá modificarse antes de crear la cuenta.
8. Elegir perfil/cargo.
9. Elegir ámbito de sucursales.
10. Elegir permisos.
11. Mostrar resumen final antes de confirmar.

Ejemplos de nombres sugeridos:
- MAYRA01
- JMAMANI01
- RAFAEL01
- REBECA01
- PROD01

El nombre de usuario no determina cargo ni permisos.

## 7. Seguridad de contraseñas
- No mantener un listado permanente de contraseñas visibles.
- El administrador podrá:
  - Restablecer contraseña.
  - Generar contraseña temporal.
  - Copiar la contraseña temporal cuando se genere.
  - Bloquear usuario.
  - Cerrar sesiones activas.
- La contraseña temporal es para el primer acceso o recuperación.

## 8. Permisos
Los permisos serán jerárquicos y granulares.

Ejemplo inicial:
Producción
- Pollo vivo
  - Ver
  - Registrar
  - Editar
  - Ver boleta
- Producción diaria
  - Ver
  - Registrar actividades
  - Editar actividades
- Planilla semanal
  - Ver
  - Modificar
  - Registrar adelantos
  - Registrar descuentos
  - Ver control vivo vs. pelado
  - Exportar planilla

Los módulos no deben funcionar únicamente como "todo sí / todo no".
El árbol completo de permisos sigue pendiente de definición.

## 9. Adelantos
Cada adelanto debe guardar:
- Trabajador
- Monto con decimales
- Tipo:
  - Efectivo
  - Producto
  - Mixto
  - Otro
- Detalle / motivo
- Fecha automática
- Hora automática
- Usuario que registró
- Sucursal donde se registró

En la planilla semanal:
- El monto del adelanto será interactivo.
- Al tocarlo debe abrirse su detalle completo.
- Debe poder verse por qué existe ese importe y quién lo registró.

## 10. Auditoría resumida
No registrar cada clic o cada pantalla visitada.

Guardar:
- Último ingreso del usuario.
- Última actividad importante.
- Historial de acciones sensibles.

Formato mínimo:
- Usuario
- Fecha/hora
- Acción importante
- Detalle

Ejemplos de acciones sensibles:
- Inicio de sesión.
- Registrar adelanto.
- Registrar cobro.
- Registrar pollo vivo.
- Editar boleta.
- Modificar permisos.
- Crear/bloquear usuario.
- Modificar datos relevantes.

Política inicial propuesta:
- Historial detallado aproximado de 90 días.
- Mantener aparte datos básicos como último acceso.

## 11. Inicio
Durante la etapa actual:
- Eliminar estadísticas ficticias/demo.
- Mantener Inicio limpio.
- Diseñar el tablero real posteriormente.

## 12. Calculadora del login
- Debe iniciar vacía.
- Sin peso, precio ni resultado ficticio precargado.
- Mientras siga la etapa de desarrollo, las credenciales raíz de prueba pueden continuar precargadas.

## 13. Estado actual
- NOTA 001 ya está integrada en main.
- NOTA 002 tiene rama propia:
  `nota-002-usuarios-permisos-auditoria`
- Todavía no se deben realizar cambios funcionales de NOTA 002 hasta cerrar creación de usuarios y árbol de permisos.

## 14. Pendiente inmediato
Terminar de definir:
1. Campos exactos de la ficha de usuario.
2. Árbol completo de permisos por cada módulo del Panel de Control.
3. Alcance por sucursal.
4. Estados del usuario y recuperación de acceso.
5. Qué acciones entran en auditoría.
