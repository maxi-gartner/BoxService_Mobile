# BoxService_Mobile

App mobile de BoxService — Expo (React Native) + TypeScript + Expo Router.
Sprint 4 del roadmap (ver `ESTADO_DEL_PROYECTO.md` en la raíz del
proyecto), arrancado antes de tiempo a pedido.

Habla **directo con el mismo backend real** que usa
[`BoxService_FrontEnd/web`](https://github.com/maxi-gartner/BoxService_FrontEnd)
(`BoxService_BackEnd`, ASP.NET Core + JWT) — sin lógica offline, sin
SQLite local, como ya estaba decidido en el roadmap. No hay un backend
mock acá: para probar algo hace falta el backend real corriendo (ver
`BoxService_BackEnd/README.md`).

## Por qué estas tecnologías

- **Expo (managed) + Expo Router**: mismo modelo de ruteo por archivos
  que ya usa `web/` con Next.js App Router — la curva de entrada para el
  equipo es baja porque es el mismo mental model. Sin Expo (bare RN CLI)
  haría falta Android Studio/Xcode instalados solo para compilar; con
  Expo Go alcanza con escanear un QR desde el celular.
- **NativeWind**: clases de Tailwind sobre RN — mismo criterio que
  NativeWind, el equipo ya conoce esa sintaxis de `web/`. Los colores en
  `tailwind.config.js` están portados de `web/app/globals.css`, no es un
  rediseño.
- **TanStack Query**: misma librería que usa `web/` para data-fetching.

## Auth

Sin BFF (no existe ese concepto en una app nativa): login directo contra
`POST /auth/login` del backend real, token guardado en `expo-secure-store`
(Keychain/Keystore — el equivalente mobile de una cookie httpOnly) y
mandado como `Authorization: Bearer` en cada request. Mismo contrato que
ya documenta
[`web/docs/API_CONTRACT.md`](https://github.com/maxi-gartner/BoxService_FrontEnd/blob/develop/web/docs/API_CONTRACT.md).

## Setup

```bash
npm install
cp .env.example .env
# editar .env: EXPO_PUBLIC_BACKEND_URL
npx expo start
```

Con el backend real corriendo en `localhost:5001` (ver
`BoxService_BackEnd/README.md`), escaneá el QR con la app **Expo Go**
desde tu celular (Android o iOS) — tiene que estar en la misma red WiFi
que tu PC. Si probás en un celular físico, `EXPO_PUBLIC_BACKEND_URL` no
puede ser `localhost` (eso apunta al celular, no a tu PC): usá la IP de
tu PC en la red local, ej. `http://192.168.0.x:5001`.

Usuarios de prueba: los mismos 3 de siempre — ver
`BoxService_BackEnd/appsettings.example.json`.

## Estructura

```
app/
  _layout.tsx        ← layout raíz: providers + gate de sesión (Stack.Protected)
  login.tsx
  (tabs)/
    _layout.tsx       ← tab bar
    dashboard.tsx
    clientes.tsx      ← placeholder, próximo módulo a migrar
    vehiculos.tsx      ← placeholder
    taller.tsx          ← placeholder, el flujo grande, se migra último
    mas.tsx               ← perfil + cerrar sesión
components/ui/         ← Screen, Button, Input, ErrorText, ModulePlaceholder
lib/
  api/client.ts        ← fetch tipado al backend real + envelope
  auth/session.ts       ← SecureStore
  auth/AuthContext.tsx    ← useAuth()
  queryClient.ts
types/                  ← copia de web/types/ (mismo contrato de API)
```

## Qué falta (próximos pasos, mismo patrón mecánico que se usó en `web/`)

CRUD real de Clientes → Vehículos → Taller, uno por uno. Infraestructura
de build (EAS) recién cuando haya algo real que buildear para
distribuir — ver `BoxService_BackEnd/docs/DEPLOYMENT.md` para el criterio
que se usó con el resto del proyecto.
