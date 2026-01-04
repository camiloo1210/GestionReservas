# Sistema de Reservas de Salas de Estudio - UDLA

## Descripción del Proyecto
Este proyecto consiste en una aplicación web para la gestión y reserva de salas de estudio en la Universidad de las Américas (UDLA). El objetivo es facilitar a los estudiantes el acceso a espacios de estudio y permitir a los administradores una gestión eficiente de los recursos.

La aplicación se desarrolla bajo la metodología ágil **Scrum**, organizada en 5 Sprints.

## Objetivo Académico
Evidenciar el uso correcto de una metodología ágil (Scrum), implementando una solución funcional de forma iterativa e incremental.

## Alcance del Proyecto
- **Estudiantes:** Registro, inicio de sesión, consultar disponibilidad, crear/cancelar reservas.
- **Administradores:** Gestión de salas (CRUD), definición de horarios, reporte de uso.

## Tech Stack
- **Frontend:** HTML5, CSS3 (Bootstrap 5), JavaScript.
- **Backend:** Node.js + Express.
- **Base de Datos:** SQLite.
- **Control de Versiones:** Git.

---

## Sprint 1: Acceso y Gestión Básica de Salas

**Objetivo:** Habilitar el acceso al sistema y la gestión básica de salas. Que el administrador pueda gestionar salas y horarios, y los estudiantes puedan autenticarse y ver la disponibilidad básica.

### Funcionalidades (Historias de Usuario)
- **HU01 - Registro de Estudiantes:** Permitir a los estudiantes crear una cuenta.
- **HU02 - Inicio de Sesión:** Autenticación de estudiantes y administradores.
- **HU04 - Gestión de Salas (Admin):** Crear, editar, desactivar y listar salas.
- **HU05 - Definir Horarios (Admin):** Asignar bloques de disponibilidad a las salas.
- **HU06 - Ver Disponibilidad:** Los estudiantes pueden ver qué salas están disponibles por fecha.

### Instrucciones de Ejecución
1.  Instalar dependencias:
    ```bash
    npm install
    ```
2.  Iniciar el servidor:
    ```bash
    node server.js
    ```
3.  Acceder en el navegador a `http://localhost:3000`

**Credenciales por defecto (Admin):**
- Email: `admin@udla.edu.ec`
- Password: `admin123`
