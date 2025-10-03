# 🚀 Planificador de Tareas y Hábitos | TIGERTECH SOFTWARE SOLUTIONS

> **Estado del Proyecto:** Producto Mínimo Viable (MVP) en Desarrollo.
> **Versión:** 1.0.0
> **Objetivo:** Sistema web enfocado en la organización personal, profesional y académica.

-----

## 📋 Tabla de Contenidos

1.  [Acerca del Proyecto]
2.  (\#2-funcionalidades-clave-rfs)
3.  (\#3-stack-tecnológico)
4.  [Arquitectura y Estándares de Calidad]
5.  (\#5-instalación-y-despliegue)
6.  (\#6-equipo-de-desarrollo)

-----

## 1\. Acerca del Proyecto

El **Sistema Web Planificador de Tareas y Hábitos** es una herramienta digital multiplataforma diseñada para ayudar a los usuarios a gestionar su tiempo y mejorar su productividad. El sistema permite planificar actividades diarias, establecer y dar seguimiento a hábitos, configurar recordatorios automáticos (RF-06) y visualizar el progreso mediante reportes estadísticos (RF-08).

## 2\. Funcionalidades Clave (RFs)

Basado en los Requisitos Funcionales definidos :

  * **Gestión de Usuarios (RF-01, RF-02):** Registro seguro, inicio de sesión y recuperación de contraseña utilizando *hashing* con bcrypt.
  * **Gestión de Tareas (RF-04):** Creación, edición, clasificación por prioridad y marcaje como completada.
  * **Tareas Recurrentes (RF-05):** Configuración de la frecuencia (diaria, semanal, mensual) y generación automática de instancias de tareas.
  * **Gestión de Hábitos (RF-06, RF-07):** Definición de nuevos hábitos, registro de cumplimiento (*check-in* diario) y cálculo automático de rachas (*streaks*) de constancia.
  * **Visualización (RF-07):** Vista cronológica detallada y visualización de actividades en formato Calendario.
  * **Dashboard y Analítica (RF-08):** Generación de estadísticas de progreso semanal y mensual para medir la tasa de completado de tareas y el cumplimiento de hábitos.
  * **Integración (RF-09):** Sincronización bidireccional de tareas con Google Calendar mediante OAuth 2.0 y la API externa.
  * **Exportación de Datos (RF-10):** Capacidad para exportar el historial y los reportes de progreso a formatos como PDF o Excel.

## 3\. Stack Tecnológico

El proyecto se basa en un *stack* de alto rendimiento, moderno y altamente adoptado en la industria (RNF 2.4):

| Categoría | Tecnología | Propósito |
|---|---|---|
| **Backend** | Node.js (Express) | Lógica de negocio, APIs RESTful y gestión de autenticación. |
| **Frontend** | React | Desarrollo de una interfaz de usuario responsiva y moderna. |
| **Base de Datos** | MySQL | Almacenamiento relacional de usuarios, tareas y registros de hábitos. |
| **Caché (Recomendado)**| Redis / LRU Cache | Aceleración de la API y reducción de la carga de DB para consultas críticas (RF-08).[2, 3] |
| **Seguridad** | JWT, bcrypt, Helmet | Autenticación, gestión de sesiones y configuración de *security headers*. |

## 4\. Arquitectura y Estándares de Calidad

La arquitectura adoptada es un **Monolítico Modular**, diseñado para maximizar la mantenibilidad (RNF 3.3.5) y facilitar una futura transición a microservicios, si el proyecto lo requiere.


## 5\. Instalación y Despliegue

Siga estos pasos para configurar el entorno de desarrollo.

### 5.1. Prerrequisitos

Asegúrese de tener instalado:

  * Node.js (LTS recomendado)
  * MySQL Server
  * Git

### 5.2. Configuración del Entorno

1.  **Clonar el repositorio:**
    
    ```
    git clone [https://github.com/AlexLessus/PLANIFICADOR-HABITOS-WEB](https://github.com/AlexLessus/PLANIFICADOR-HABITOS-WEB.git)
    cd PLANIFICADOR-HABITOS-WEB
    ```

2.  **Configuración de Variables de Entorno:**
    Cree un archivo `.env` en el directorio raíz del *backend* (o del proyecto principal) y defina las siguientes variables:

    ```env
    # Configuración del servidor
    PORT=3000

    # Configuración de MySQL
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=planner_db

    # Clave secreta para JWT
    JWT_SECRET=tu_clave_secreta_aqui

    ```

3.  **Instalación de Dependencias:**

    Instalar dependencias del *backend* (Node.js):

    ```bash
    # Asumiendo que el código del backend está en una carpeta 'backend' o 'src'
    npm install
    ```

    Instalar dependencias del *frontend* (React):

    ```bash
    # Asumiendo que el código del frontend está en una carpeta 'client' o 'frontend'
    cd client 
    npm install
    ```

4.  **Ejecución del Proyecto:**

    Iniciar el servidor *backend*:

    ```bash
    npm run start:dev  # O el script definido en package.json
    ```

    Iniciar la aplicación *frontend*:

    ```bash
    cd../client
    npm run start
    ```

-----

## 6\. Equipo de Desarrollo

El proyecto fue desarrollado por el equipo de **TIGERTECH SOFTWARE SOLUTIONS** como parte de una práctica especializada:

| Rol | Nombre | Contacto |
|---|---|---|
| Product Owner | Cristian Axel Gómez Melchor | `---` |
| Scrum Master | Alexis De Jesús Pérez Carmona | `l2290827@cdguzman.tenm.com` |
| Developer | Gustavo Valerio Guzmán | `---` |
| UI/UX Designer | Ronaldo Varona Baranda | `---` |

-----
