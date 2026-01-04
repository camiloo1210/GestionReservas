# Sistema de Reservas de Salas de Estudio - UDLA

![NodeJS](https://img.shields.io/badge/Node.js-18.x-green) ![Express](https://img.shields.io/badge/Express-4.x-lightgrey) ![SQLite](https://img.shields.io/badge/SQLite-3-blue) ![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple) ![Status](https://img.shields.io/badge/Status-Sprint%203%20Complete-success)

## Descripción del Proyecto
Este proyecto consiste en una aplicación web para la gestión y reserva de salas de estudio en la Universidad de las Américas (UDLA). El objetivo es facilitar a los estudiantes el acceso a espacios de estudio y permitir a los administradores una gestión eficiente de los recursos.

La aplicación se desarrolla bajo la metodología ágil **Scrum**, organizada en 5 Sprints. Se ha implementado un diseño **Dark Mode** nativo con Bootstrap 5.3 para garantizar accesibilidad y estética moderna.

## Objetivo Académico
Evidenciar el uso correcto de una metodología ágil (Scrum), implementando una solución funcional de forma iterativa e incremental.

## Alcance del Proyecto
- **Estudiantes:** Registro, inicio de sesión, consultar disponibilidad, crear/cancelar reservas, gestión de perfil.
- **Administradores:** Gestión de salas (CRUD), definición de horarios, reporte de uso, gestión global de reservas.

## Tech Stack
- **Frontend:** HTML5, CSS3 (Bootstrap 5.3 Dark Mode), JavaScript (Vanilla).
- **Backend:** Node.js + Express.
- **Base de Datos:** SQLite (Local).
- **Control de Versiones:** Git.

---

## Progreso del Proyecto

### ✅ Sprint 1: Acceso y Gestión Básica de Salas
Configuración inicial y fundamentos del sistema.
- **HU01/HU02:** Registro e Inicio de Sesión (Estudiantes y Admin).
- **HU04:** Gestión de Salas (CRUD para Admin).
- **HU05:** Definición de Horarios Disponibles.
- **HU06:** Visualización de disponibilidad por fecha.

### ✅ Sprint 2: Flujo de Reservas
Implementación del núcleo del negocio: reservas.
- **HU07:** Creación de reservas por parte de estudiantes.
- **HU08:** Validación de conflictos (evitar solapamientos de horario).
- **HU09:** Visualización de "Mis Reservas".
- **HU10:** Cancelación de reservas propias.
- **HU12:** Confirmación visual de reserva exitosa.

### ✅ Sprint 3: Experiencia de Usuario y Control
Refinamiento y herramientas de gestión.
- **HU03:** Gestión de Perfil de Usuario (Nombre, Teléfono).
- **HU11:** Panel de Administrador para ver todas las reservas con filtros (Fecha/Sala).
- **HU11:** Capacidad del Admin para cancelar cualquier reserva.
- **HU13:** Sistema base de recordatorios (Mock).

---

## Instrucciones de Ejecución
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
