# Proyecto-5-PathFinder
PROYECTO DE IMPLEMENTACIÓN DE SOFTWARE

# Flujo de Trabajo y Gestión de Ramas

Este repositorio sigue una estrategia de control de versiones basada en dos ramas principales: `main` y `develop`, con el objetivo de asegurar la calidad del software, permitir la integración controlada y facilitar el despliegue del sistema.

---

## Estructura de Ramas

### Rama `main` (Producción)

* Contiene la versión estable del sistema.
* Solo incluye código validado y aprobado.
* Es la base para el despliegue en producción.

Restricciones:

* No se desarrollan funcionalidades directamente en esta rama.
* No se realizan commits directos.
* Solo recibe cambios desde la rama `develop` mediante aprobación formal.

---

### Rama `develop` (Desarrollo e Integración)

* Es la rama de integración de funcionalidades.
* Representa un entorno de pruebas.
* Sirve como base para validación por parte del equipo de QA.

Características:

* Recibe cambios de ramas de desarrollo (`feature/*`). Un ejemplo sería feature/login.
* Es validada antes de promover cambios a `main`.

---

## Flujo de Trabajo y Responsables

El flujo de trabajo está dividido por roles para asegurar control y calidad.

---

### 1. Desarrollo de funcionalidades

Responsable: Desarrollador

El desarrollador crea una rama a partir de `develop` para trabajar en una funcionalidad específica.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/login
```

Durante el desarrollo:

```bash
git add .
git commit -m "feat: implementación de login"
git push origin feature/login
```

Importante:

* El desarrollador NO debe hacer merge directo a `develop`.
* El desarrollador NO debe trabajar en `main`.

---

### 2. Integración de funcionalidades

Responsable: Integrador (o Líder de Equipo)

Una vez finalizado el desarrollo, se realiza un Pull Request desde la rama `feature/*` hacia `develop`.

Flujo:

* `feature/login` → `develop`

El integrador revisa:

* consistencia del código
* conflictos
* cumplimiento de estándares

Si todo es correcto, se realiza el merge.

Alternativamente, el integrador puede ejecutar:

```bash
git checkout develop
git pull origin develop
git merge feature/login
git push origin develop
```

Importante:

* El desarrollador no debe hacer este merge por control de calidad.
* El integrador centraliza la integración de cambios.

---

### 3. Validación en entorno de pruebas

Responsable: QA (Control de Calidad)

El equipo de QA valida el sistema desplegado desde la rama `develop`.

Actividades:

* ejecución de casos de prueba
* validación funcional
* reporte de errores

Resultado:

* aprobación → pasa a producción
* rechazo → regresa a desarrollo

QA no ejecuta comandos Git sobre ramas principales.

---

### 4. Paso a producción

Responsable: Implantador

Una vez que QA aprueba los cambios, el implantador gestiona el pase a producción.

Flujo:

* `develop` → `main`

El implantador ejecuta:

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

Responsabilidades del implantador:

* asegurar que el código está validado
* gestionar el despliegue en producción
* configurar el entorno productivo

Importante:

* Ni desarrolladores ni QA deben hacer merge a `main`.

---

### 5. Limpieza de ramas

Responsable: Integrador o Desarrollador

Después de integrar la funcionalidad:

```bash
git branch -d feature/login
git push origin --delete feature/login
```

---

## Resumen de responsabilidades

| Rol             | Acciones principales                              |
| --------------- | ------------------------------------------------- |
| Desarrollador   | Crear ramas, programar, hacer commits y push      |
| Integrador      | Revisar y hacer merge hacia `develop`                 |
| QA              | Validar funcionalidad en entorno de pruebas       |
| Implantador     | Hacer merge hacia `main` y desplegar a producción |
| Arquitecto      | Definir lineamientos técnicos                     |
| Líder de equipo | Coordinar actividades del equipo                  |

---

## Buenas Prácticas

* No realizar commits directos en `main`.
* No hacer merge sin validación previa.
* Mantener la separación de responsabilidades por rol.
* Utilizar Pull Requests para control de cambios.
* El código en `main` debe estar siempre listo para producción.

---

## Objetivo

Este flujo permite:

* asegurar la calidad del software
* reducir errores en producción
* mantener control sobre los cambios
* facilitar el trabajo en equipo

---
