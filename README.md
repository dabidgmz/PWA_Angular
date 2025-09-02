# PWA Angular con Service Worker

## Descripción
Este proyecto es una Progressive Web App (PWA) desarrollada con Angular que incluye un Service Worker para funcionalidades offline y caching.

## Configuración del Service Worker

### 1. Instalación
Para agregar el Service Worker a tu proyecto Angular, ejecuta:

```bash
ng add @angular/pwa
```

Este comando realiza automáticamente:
- Instala el paquete `@angular/service-worker`
- Habilita el soporte de Service Worker en Angular CLI
- Importa y registra el Service Worker en los providers de la aplicación
- Actualiza `index.html` con:
  - Link al archivo `manifest.webmanifest`
  - Meta tag para theme-color
  - Iconos para la PWA instalable
- Crea el archivo de configuración `ngsw-config.json`

### 2. Construcción del Proyecto
```bash
ng build
```

El proyecto se construye en `dist/pwa-angular/browser/`

## Uso del Service Worker

### 1. Servir la Aplicación
```bash
npx http-server -p 8080 -c-1 dist/pwa-angular/browser
```

### 2. Acceder a la Aplicación
- URL local: `http://localhost:8080`
- URL de red: `http://192.168.1.7:8080`

### 3. Funcionalidades del Service Worker

#### Caching Automático
El Service Worker cachea automáticamente:
- `index.html`
- `favicon.ico`
- Archivos JS y CSS del build
- Recursos en la carpeta `assets`
- Iconos y fuentes

#### Modo Offline
Para probar el modo offline:
1. Abre DevTools (F12)
2. Ve a la pestaña Network
3. Selecciona "Offline" en el dropdown de Throttling
4. Recarga la página - seguirá funcionando desde el cache

#### Actualizaciones
El Service Worker:
- Instala actualizaciones en segundo plano
- Cambia a la nueva versión en la siguiente recarga
- Mantiene la versión anterior hasta que se confirme la nueva

## Archivos de Configuración

### ngsw-config.json
Configura el comportamiento del caching y estrategias de red.

### manifest.webmanifest
Define la PWA como instalable con:
- Nombre de la aplicación
- Iconos en diferentes tamaños
- Colores del tema
- Configuración de display

## Estructura del Proyecto
```
PWA_Angular/
├── src/
│   ├── app/
│   ├── assets/
│   │   └── icons/          # Iconos para la PWA
│   ├── manifest.webmanifest
│   └── index.html
├── angular.json             # Configuración del build
├── ngsw-config.json        # Configuración del Service Worker
└── dist/
    └── pwa-angular/
        └── browser/         # Archivos construidos
```

## Comandos Útiles

### Desarrollo
```bash
npm start          # Servidor de desarrollo
npm run build     # Construir para producción
```

### Producción
```bash
npm run build     # Construir la aplicación
npx http-server -p 8080 -c-1 dist/pwa-angular/browser
```

## Notas Importantes

- **HTTPS**: El Service Worker solo se registra en localhost o HTTPS
- **Testing**: Usa ventana incógnita para evitar conflictos de cache
- **Actualizaciones**: El Service Worker no espera a verificar actualizaciones antes de servir la app
- **Puerto**: Si el puerto 8080 está ocupado, usa otro puerto o mata el proceso existente

## Solución de Problemas

### Puerto Ocupado
```bash
lsof -ti:8080 | xargs kill -9
```

### Limpiar Cache del Service Worker
1. Abre DevTools
2. Ve a Application > Service Workers
3. Haz clic en "Unregister"
4. Recarga la página

## Recursos Adicionales
- [Documentación oficial de Angular PWA](https://angular.io/guide/service-worker-getting-started)
- [Guía de Service Workers](https://web.dev/service-workers/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
