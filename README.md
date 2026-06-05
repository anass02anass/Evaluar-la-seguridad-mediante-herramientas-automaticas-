# Todo App — Auditoría de Seguridad

Continuación de las actividades anteriores. Esta entrega añade el análisis de seguridad del código usando 5 herramientas, con vulnerabilidades introducidas intencionadamente para observar las alertas generadas.

---

## 1. Definición de la aplicación y cómo ejecutarla

**Todo App** es una aplicación web CRUD para gestionar listas de tareas. Usa Node.js + Express, SQLite y un frontend HTML vanilla, contenerizada con Docker.

Este repositorio contiene dos versiones:
- `app-vulnerable/` — versión con fallos intencionados para demostrar las herramientas
- La versión segura se encuentra en el repositorio de la actividad anterior

### Cómo ejecutar la versión vulnerable

```bash
git clone https://github.com/anass02anass/todo-app-security-audit.git
cd todo-app-security-audit
docker compose up --build -d
```

Abrir en: `http://localhost:3000`

---

## 2. Consideraciones de seguridad

Las medidas de seguridad de la versión original se documentan en el repositorio de la actividad anterior. En esta versión se eliminaron intencionadamente para observar las alertas de las herramientas:

- Sin `helmet.js` → cabeceras HTTP inseguras
- Secretos hardcodeados → credenciales en el código fuente
- `eval()` con input del usuario → Remote Code Execution potencial
- Concatenación directa en SQL → SQL Injection
- Sin validación de entradas → datos maliciosos sin filtrar
- `lodash@4.17.4` → dependencia con CVEs críticos conocidos

---

## 3. Herramientas de seguridad seleccionadas

Se eligieron 5 herramientas que cubren distintas fases y vectores de ataque:

**1. npm audit** — análisis de vulnerabilidades en dependencias (SAST). Se eligió por estar integrada en npm, sin instalación adicional, y porque detecta CVEs en el árbol de dependencias completo.

**2. ESLint + eslint-plugin-security** — análisis estático del código fuente. Se eligió porque detecta patrones peligrosos (eval, SQL concatenado, RegExp inseguros) en tiempo de desarrollo, antes de ejecutar el código.

**3. Trivy** — análisis de imagen Docker. Se eligió porque escanea no solo las dependencias de la app sino también el sistema operativo base y las librerías nativas, detectando CVEs que npm audit no ve.

**4. OWASP ZAP** — análisis dinámico (DAST). Se eligió porque es la única herramienta que prueba la aplicación en ejecución como lo haría un atacante real, detectando cabeceras ausentes, cookies inseguras y exposición de información.

**5. GitHub CodeQL** — análisis semántico de flujo de datos. Se eligió porque es gratuito para repositorios públicos de GitHub y puede trazar el recorrido de datos del usuario desde la entrada hasta su uso en operaciones peligrosas (SQL, eval, etc.), detectando vulnerabilidades distribuidas en varios archivos.

El informe completo con los resultados de cada herramienta está en [`security/security-report.md`](security/security-report.md).

---

## 4. Paso a paso — S-SDLC y DevSecOps con auditoría de código

Esta actividad corresponde a la **Fase 5 — Pruebas** del S-SDLC descrito en la actividad anterior, ampliada con herramientas concretas:

**SAST (análisis estático):** `npm audit` y ESLint se ejecutan automáticamente en cada Push mediante GitHub Actions. CodeQL se activa en cada Pull Request via `.github/workflows/codeql.yml`.

**Análisis de imagen:** Trivy escanea la imagen Docker en el pipeline de CI antes del despliegue.

**DAST (análisis dinámico):** OWASP ZAP se ejecuta contra la aplicación desplegada en el entorno de pruebas antes de pasar a producción.

Si cualquier herramienta detecta una vulnerabilidad de severidad alta o crítica, el merge queda bloqueado automáticamente.


