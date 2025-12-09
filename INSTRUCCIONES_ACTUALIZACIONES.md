# 🔄 Sistema de Notificaciones de Actualizaciones

## 📋 Descripción

El sistema ahora detecta automáticamente cuando hay una nueva versión de la aplicación disponible y muestra una notificación al usuario para que pueda actualizar.

## ✨ Características

- ✅ Detección automática de actualizaciones
- ✅ Notificación con SweetAlert2 cuando hay una nueva versión
- ✅ Opción para actualizar ahora o más tarde
- ✅ Recarga automática después de la actualización
- ✅ Verificación periódica cada 6 horas
- ✅ Verificación al iniciar la aplicación

## 🚀 Cómo Funciona

1. **Detección Automática**: El Service Worker de Angular detecta cuando hay cambios en los archivos de la aplicación (JS, CSS, HTML, etc.)

2. **Notificación**: Cuando se detecta una actualización, se muestra un diálogo con SweetAlert2 informando al usuario

3. **Actualización**: El usuario puede elegir:
   - **Actualizar ahora**: Recarga la aplicación inmediatamente con la nueva versión
   - **Más tarde**: Continúa usando la versión actual (la notificación aparecerá de nuevo)

## 🧪 Cómo Probar

### Opción 1: Probar en Producción (Recomendado)

1. **Construir la aplicación**:
   ```bash
   npm run build
   ```

2. **Servir la aplicación**:
   ```bash
   npx http-server -p 8080 -c-1 dist/pwa-angular/browser
   ```

3. **Abrir en el navegador**:
   - Ve a `http://localhost:8080`
   - Abre DevTools (F12) y ve a la pestaña "Application" > "Service Workers"
   - Verifica que el Service Worker esté registrado

4. **Hacer un cambio mínimo**:
   - Edita cualquier archivo del frontend (por ejemplo, `src/app/app.component.ts`)
   - Agrega un comentario o cambia un texto
   - Ejemplo: Cambia `title = 'PWA_Angular';` a `title = 'PWA_Angular v2';`

5. **Reconstruir**:
   ```bash
   npm run build
   ```

6. **Recargar el servidor** (si es necesario):
   ```bash
   # Detén el servidor anterior (Ctrl+C) y vuelve a iniciarlo
   npx http-server -p 8080 -c-1 dist/pwa-angular/browser
   ```

7. **Recargar la página en el navegador**:
   - La aplicación detectará que hay una nueva versión
   - Aparecerá la notificación de actualización
   - Haz clic en "Actualizar ahora" para aplicar los cambios

### Opción 2: Forzar Verificación Manual

Si quieres forzar la verificación de actualizaciones sin esperar:

1. Abre la consola del navegador (F12)
2. Ejecuta:
   ```javascript
   navigator.serviceWorker.getRegistration().then(reg => {
     if (reg) {
       reg.update();
     }
   });
   ```

## 📝 Notas Importantes

### ⚠️ Solo Funciona en Producción

El Service Worker solo está habilitado en modo producción (`!isDevMode()`). Esto significa:

- ✅ **Funciona**: Cuando ejecutas `npm run build` y sirves los archivos construidos
- ❌ **No funciona**: Cuando ejecutas `npm start` o `ng serve` (modo desarrollo)

### 🔄 Cambios Detectados

El Service Worker detecta cambios en:
- Archivos JavaScript (`*.js`)
- Archivos CSS (`*.css`)
- `index.html`
- `manifest.webmanifest`
- Archivos en `/assets/**`

### ⏱️ Frecuencia de Verificación

- **Al iniciar la app**: Verifica inmediatamente
- **Cada 6 horas**: Verificación automática periódica
- **Manual**: Puedes forzar la verificación desde la consola

## 🛠️ Configuración

### Archivo: `src/app/core/services/update.service.ts`

Puedes ajustar:
- **Intervalo de verificación**: Cambia `6 * 60 * 60 * 1000` (6 horas) a otro valor
- **Mensaje de notificación**: Personaliza el texto en `showUpdateNotification()`

### Archivo: `src/app/app.config.ts`

Puedes ajustar:
- **Tiempo de registro**: `registerWhenStable:5000` (5 segundos)
- **Habilitar en desarrollo**: Cambia `enabled: !isDevMode()` a `enabled: true` (solo para testing)

## 🐛 Solución de Problemas

### La notificación no aparece

1. **Verifica que estés en producción**:
   - Asegúrate de haber ejecutado `npm run build`
   - No uses `ng serve` o `npm start`

2. **Verifica el Service Worker**:
   - Abre DevTools > Application > Service Workers
   - Debe estar "activated and running"
   - Si no, haz clic en "Unregister" y recarga la página

3. **Limpia el cache**:
   - DevTools > Application > Clear storage > Clear site data
   - Recarga la página

### La actualización no se aplica

1. **Verifica que el build sea nuevo**:
   - Cada build genera un hash único en los archivos
   - Si los archivos no cambian, no habrá actualización

2. **Fuerza la actualización**:
   - DevTools > Application > Service Workers > "Update"

3. **Recarga forzada**:
   - Presiona `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)

## 📚 Archivos Modificados

- ✅ `src/app/core/services/update.service.ts` - Nuevo servicio de actualizaciones
- ✅ `src/app/app.component.ts` - Integración del servicio
- ✅ `src/app/app.config.ts` - Ajuste de configuración del Service Worker

## 🎯 Ejemplo de Uso

```typescript
// El servicio se inicializa automáticamente al iniciar la app
// No necesitas hacer nada adicional

// Si quieres verificar manualmente desde otro componente:
constructor(private updateService: UpdateService) {}

checkForUpdate() {
  this.updateService.checkForUpdates();
}
```

---

**¡Listo!** 🎉 Ahora tu aplicación notificará automáticamente a los usuarios cuando haya actualizaciones disponibles.

