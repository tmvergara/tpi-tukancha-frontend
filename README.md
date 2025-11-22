# TuKancha - Sistema de Gestión de Canchas Deportivas

![TuKancha Banner](https://github.com/tmvergara/tpi-tukancha-frontend/blob/main/public/TukanchaDemo.png?raw=true)

<!-- Agregar una captura de pantalla del sistema aquí -->

## 📋 Que es TuKancha?

**TuKancha** es un sistema integral de gestión para clubes deportivos que permite administrar reservas de canchas, gestionar horarios, procesar pagos en línea y organizar torneos. Funciona como un SaaS Multitenant, lo que permite que cualquier club se registre y ofrezca sus canchas para ser reservadas. Desarrollado con Next.js 14 y TypeScript, ofrece una experiencia moderna tanto para administradores como para clientes.

### ✨ Características Principales

- 🎯 **Reservas en línea**: Sistema completo de reservas con disponibilidad en tiempo real
- 💳 **Pagos integrados**: Procesamiento de pagos con Mercado Pago (integracio ficticia por ser un MVP)
- 🏆 **Gestión de torneos**: Creación y administración de torneos con fixture y tabla de posiciones
- 📊 **Panel de administración**: Dashboard completo para gestión de clubes, canchas y reservas
- 👥 **Gestión de usuarios**: Sistema de roles y permisos (Admin, Encargado, Org. de Torneos)
- 📱 **Diseño responsive**: Interfaz adaptada para dispositivos móviles y desktop
- 🎨 **UI moderna**: Construida con shadcn/ui y Tailwind CSS

## 🚀 Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Autenticación**: JWT (JSON Web Tokens)
- **Notificaciones**: Sonner
- **Iconos**: Lucide React

## 📦 Instalación

### Prerequisitos

- Node.js 18.x o superior
- npm, yarn, pnpm o bun
- Backend de TuKancha corriendo (ver sección de Backend)

### Pasos de instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tmvergara/tpi-tukancha-frontend.git
cd tpi-tukancha-frontend
```

2. **Instalar dependencias**

```bash
npm install
# o
yarn install
# o
pnpm install
```

3. **Configurar variables de entorno**

Crear un archivo `.env.local` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus configuraciones:

```env
# URL del backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# URL base del frontend (para redirecciones de pago)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Nota**: Asegúrate de que la URL del backend (`NEXT_PUBLIC_API_URL`) coincida con la dirección donde está corriendo tu servidor backend.

4. **Iniciar el servidor de desarrollo**

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

5. **Abrir en el navegador**

Visita [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 🔧 Backend

Este proyecto requiere el backend de TuKancha para funcionar correctamente.

### Configurar el Backend

1. **Clonar el repositorio del backend**

```bash
git clone https://github.com/PedroYorlano/TPI-TuKancha-Backend.git
cd TPI-TuKancha-Backend
```

2. **Seguir las instrucciones de instalación del backend**

Consulta el README del repositorio backend para instrucciones detalladas de instalación y configuración.

3. **Asegurarse de que el backend esté corriendo**

Por defecto, el backend corre en `http://localhost:5000`. Verifica que el servidor esté activo antes de iniciar el frontend.

**Importante**: La URL configurada en `NEXT_PUBLIC_API_URL` del frontend debe coincidir con la dirección del backend.

## 🏗️ Estructura del Proyecto

```
tpi-tukancha-frontend/
├── app/                    # App Router de Next.js
│   ├── admin/             # Panel de administración
│   ├── reservas/          # Sistema de reservas público
│   ├── login/             # Autenticación
│   └── ...
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de shadcn/ui
│   └── reservas/         # Componentes específicos de reservas
├── lib/                   # Utilidades y configuración
│   ├── auth.ts           # Lógica de autenticación
│   ├── types.ts          # Tipos TypeScript
│   └── utils.ts          # Funciones auxiliares
├── hooks/                 # Custom React Hooks
├── public/               # Archivos estáticos
└── docs/                 # Documentación adicional
```

## 👥 Roles de Usuario

El sistema maneja tres tipos de usuarios:

- **👑 Admin**: Acceso completo al sistema
- **🔧 Encargado**: Gestión de reservas y canchas
- **👨‍💼 Organizador de Torneos**: Visualización y operaciones de Torneos unicamente.

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm start            # Inicia el servidor de producción

# Calidad de código
npm run lint         # Ejecuta el linter
```

## 📝 Licencia

Este proyecto es parte de un Trabajo Práctico Integrador de la Materia D.A.O de UTN FRC.

Es un trabajo del Grupo N43:

- Olmos Tomas - 95538
- Piccioni Agostini Máximo Augusto - 89565
- Vergara Tomas Ignacio - 94197
- Yorlano Pedro - 95197

⚽ Hecho con ❤️ para la gestión moderna de clubes deportivos. _No nos hacemos responsables de los riesgos asociados a usar una aplicacion en etapas early de desarollo. Leer el T&C y Politica de Privacidad._
