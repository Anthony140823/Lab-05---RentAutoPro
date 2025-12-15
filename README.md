# RentAutoPro

Sistema integral para la gestión de alquiler y mantenimiento de flotas vehiculares.

## 🚀 Características

- **Gestión de Flota**: CRUD completo de vehículos con filtros y búsqueda
- **Sistema de Alquileres**: Proceso completo de reserva, confirmación y finalización
- **Mantenimiento**: Registro de mantenimientos preventivos, correctivos y programados
- **Reportes**: Análisis de ingresos, costos y disponibilidad con gráficos interactivos
- **Dashboard**: KPIs en tiempo real y alertas inteligentes
- **Autenticación**: Sistema seguro con Supabase
- **Roles**: Admin, Gestor de Flota, Cliente, Mecánico, Contabilidad
- **PDF**: Generación de contratos de alquiler
- **Responsive**: Optimizado para web y móvil

## 📋 Requisitos Previos

- PHP 8.1 o superior
- Composer
- Node.js 16+ y npm
- Cuenta de Supabase (ya configurada)

## 🛠️ Instalación

### 1. Configurar Base de Datos en Supabase

1. Accede a tu proyecto de Supabase: https://bkzbtlrgpeadneyawihy.supabase.co
2. Ve a SQL Editor
3. Ejecuta el script `database_schema.sql` que se encuentra en la raíz del proyecto
4. Verifica que todas las tablas se hayan creado correctamente

### 2. Configurar Backend (Laravel)

```bash
cd backend

# Instalar dependencias
composer install

# Copiar archivo de configuración
copy .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Las credenciales de Supabase ya están configuradas en el .env de la raíz
# No necesitas ejecutar migraciones ya que usamos Supabase

# Iniciar servidor de desarrollo
php artisan serve
```

El backend estará disponible en: `http://localhost:8000`

### 3. Configurar Frontend (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
copy .env.example .env.local

# El archivo .env.local ya contiene las credenciales de Supabase

# Iniciar servidor de desarrollo
npm start
```

El frontend estará disponible en: `http://localhost:3000`

## 🔑 Credenciales de Supabase

Las credenciales ya están configuradas en los archivos `.env`:

- **Project URL**: https://bkzbtlrgpeadneyawihy.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

## 📱 Uso de la Aplicación

### Primer Uso

1. Accede a `http://localhost:3000/auth/register`
2. Crea una cuenta con rol "admin" para tener acceso completo
3. Inicia sesión con tus credenciales

### Funcionalidades Principales

#### Dashboard
- Vista general con KPIs
- Vehículos disponibles/alquilados
- Mantenimientos pendientes
- Ingresos del mes
- Alertas activas

#### Gestión de Vehículos
- **Listar**: Ver todos los vehículos con filtros por estado y tipo
- **Crear**: Agregar nuevos vehículos a la flota
- **Editar**: Actualizar información de vehículos
- **Eliminar**: Remover vehículos de la flota
- **Cambiar Estado**: Disponible, Alquilado, Mantenimiento, No Disponible

#### Alquileres
- **Crear Reserva**: Seleccionar vehículo y fechas
- **Confirmar**: Aprobar alquiler pendiente
- **Completar**: Finalizar alquiler con kilometraje final
- **Generar PDF**: Descargar contrato de alquiler

#### Mantenimiento
- **Registrar**: Crear registro de mantenimiento
- **Historial**: Ver mantenimientos por vehículo
- **Programar**: Establecer próximos mantenimientos
- **Alertas**: Notificaciones de mantenimientos vencidos

#### Reportes
- **Ingresos**: Análisis de ingresos por alquileres
- **Costos**: Costos de mantenimiento
- **Disponibilidad**: Estado de la flota
- **Gráficos**: Visualización interactiva con Recharts

## 🎨 Tecnologías Utilizadas

### Backend
- **Laravel 10**: Framework PHP
- **Supabase**: Base de datos PostgreSQL
- **DomPDF**: Generación de PDFs
- **Laravel Sanctum**: Autenticación API

### Frontend
- **React 18**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **Heroicons**: Iconos
- **Recharts**: Gráficos
- **React Router**: Navegación
- **React Query**: Gestión de estado
- **Axios**: Cliente HTTP
- **date-fns**: Manejo de fechas

## 📁 Estructura del Proyecto

```
RentAutoPro/
├── backend/                    # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # Controladores de API
│   │   │   └── Middleware/    # Middleware de roles
│   │   └── Models/            # Modelos Eloquent
│   ├── resources/
│   │   └── views/
│   │       └── pdf/           # Plantillas PDF
│   └── routes/
│       └── api.php            # Rutas de API
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   └── layout/        # Layouts
│   │   ├── contexts/          # Contextos de React
│   │   ├── pages/             # Páginas de la aplicación
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── vehicles/      # Vehículos
│   │   │   ├── rentals/       # Alquileres
│   │   │   ├── maintenance/   # Mantenimiento
│   │   │   ├── reports/       # Reportes
│   │   │   └── profile/       # Perfil de usuario
│   │   ├── services/          # Servicios de API
│   │   └── lib/               # Configuración Supabase
├── database_schema.sql        # Schema de base de datos
└── README.md                  # Este archivo
```

## 🔐 Roles y Permisos

- **Admin**: Acceso completo a todas las funcionalidades
- **Gestor de Flota**: Gestión de vehículos y mantenimiento
- **Cliente**: Ver vehículos disponibles y sus alquileres
- **Mecánico**: Gestión de mantenimientos
- **Contabilidad**: Acceso a reportes financieros

## 🐛 Solución de Problemas

### El backend no inicia
- Verifica que PHP 8.1+ esté instalado: `php -v`
- Asegúrate de que Composer esté instalado: `composer -v`
- Ejecuta `composer install` nuevamente

### El frontend no inicia
- Verifica que Node.js esté instalado: `node -v`
- Elimina `node_modules` y ejecuta `npm install` nuevamente
- Verifica que el puerto 3000 esté disponible

### Errores de conexión a Supabase
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de haber ejecutado el script `database_schema.sql`
- Verifica que tu proyecto de Supabase esté activo

### PDF no se genera
- Asegúrate de que la librería DomPDF esté instalada
- Verifica que la plantilla `rental.blade.php` exista
- Revisa los logs de Laravel en `storage/logs`

## 📝 Próximas Mejoras

- [ ] Notificaciones por email
- [ ] Integración con pasarelas de pago
- [ ] App móvil nativa
- [ ] Sistema de multas por retrasos
- [ ] Geolocalización de vehículos
- [ ] Chat en tiempo real
- [ ] Exportación de reportes a Excel

## 👥 Autores

Proyecto desarrollado para el curso de Ingeniería de Software - UNT

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

**RentAutoPro** - Sistema de Gestión de Flotas Vehiculares
