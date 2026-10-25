# SOS-VEC — Sistema Integral de Seguridad Vecinal

Base inicial creada desde cero con React + Vite, Node.js + Express y PostgreSQL.

## Requisitos
- Node.js 20 o superior
- npm
- PostgreSQL 15 o superior (para persistencia real)

## 1. Instalar dependencias
Desde la carpeta raíz:
```bash
npm install
```

## 2. Configurar backend
Copiar `backend/.env.example` como `backend/.env` y configurar `DATABASE_URL`.
Crear la base de datos PostgreSQL y ejecutar el contenido de `database/schema.sql`.

Ejemplo:
```sql
CREATE DATABASE sos_vec;
```

Luego, con la base creada, ejecutar `database/schema.sql` usando pgAdmin o psql.

## 3. Iniciar
```bash
npm run dev
```
Frontend: http://localhost:5173  
API: http://localhost:4000/api/health

## Funcionalidad incluida en esta primera base
- Panel de inicio con diseño inspirado en el mockup.
- Modo claro/oscuro.
- Navegación por Inicio, Alertas, Mapa, Comunidad, Contactos, Historial y Administración.
- Creación de alertas de demostración y respuestas de ayuda.
- Backend Express con endpoints iniciales.
- Esquema PostgreSQL inicial para usuarios, comunidades, membresías, alertas, respuestas, contactos y notificaciones.

## Importante
Esta es la primera versión de desarrollo, no un sistema de emergencias certificado. El flujo de alertas del frontend está en modo demostración hasta conectar autenticación, base de datos y notificaciones. No se debe usar para reemplazar el 911 ni otros servicios oficiales. No hay integración directa con organismos de emergencia.

## Próximas etapas recomendadas
1. Conectar persistencia PostgreSQL en los endpoints.
2. Autenticación segura y roles.
3. Comunidades reales y membresías.
4. Alertas persistidas y respuestas en tiempo real con Socket.IO.
5. Notificaciones push y pruebas de seguridad.
