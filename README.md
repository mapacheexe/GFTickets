# GFTickets

Repositorio frontend del proyecto **GFTicket**. Contiene las implementaciones cliente de la aplicación.

## Estructura del repositorio

```text
GFTicket-Frontend/
├── gftickets-react/      # Implementación React
├── gftickets-angular/    # Implementación Angular
└── .github/workflows/    # Pipelines de GitHub Actions
```

---

# Integración continua (CI)

Todas las Pull Requests dirigidas a la rama `main` ejecutan validaciones automáticas mediante GitHub Actions antes de permitir su integración.

Las validaciones están divididas en:

- **Validaciones automáticas:** ejecutadas por las pipelines de CI.
- **Revisión manual:** comprobaciones realizadas durante la revisión del código.

---

# Pipelines disponibles

El repositorio dispone de las siguientes pipelines:

## Branch and Commit Validation

Valida la nomenclatura de ramas y la calidad de los mensajes de commit.

### Validación de nombres de ramas

Todas las ramas deben seguir una de estas convenciones:

```text
feature/<descripción>
bugfix/<descripción>
hotfix/<descripción>
release/<descripción>
docs/<descripción>
chore/<descripción>
```

Ejemplos:

```text
feature/add-event-catalog-card
bugfix/fix-login-validation
hotfix/security-patch
release/v1.0.0
docs/update-readme
chore/update-dependencies
```

La descripción posterior al prefijo es obligatoria y debe identificar claramente el objetivo del cambio.

---

### Validación de commits

Todos los commits incluidos en una Pull Request deben cumplir la especificación **Conventional Commits**.

Formato:

```text
<tipo>(<ámbito opcional>): <descripción>
```

Ejemplos:

```text
feat: add ticket creation form
fix(react): fix email validation
docs: update README
refactor: simplify ticket service
test: add ticket component tests
chore: update dependencies
ci: update github actions workflow
```

Tipos habituales:

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad. |
| `fix` | Corrección de errores. |
| `docs` | Cambios en documentación. |
| `refactor` | Cambios internos sin modificar comportamiento. |
| `test` | Nuevas pruebas o modificaciones de pruebas existentes. |
| `chore` | Tareas de mantenimiento. |
| `ci` | Cambios en integración continua o configuración. |

---

# Frontend Quality

Esta pipeline valida la calidad técnica de las aplicaciones frontend.

## Angular

Ejecuta:

- Instalación de dependencias.
- Análisis estático del código mediante linting.
- Ejecución de pruebas unitarias.
- Compilación de la aplicación.

## React

Ejecuta:

- Instalación de dependencias.
- Análisis estático mediante ESLint.
- Ejecución de pruebas unitarias.
- Compilación de la aplicación.

Además, permite ejecutar manualmente un análisis completo de ESLint mediante `workflow_dispatch`.

---

# Pruebas de calidad automáticas

| Prueba | Descripción |
|--------|-------------|
| Instalación de dependencias | El proyecto instala correctamente todas sus dependencias sin errores ni conflictos de versiones. |
| Análisis estático del código | El código cumple las reglas definidas por ESLint y las herramientas de análisis configuradas en el proyecto. |
| Pruebas unitarias | Todas las pruebas unitarias finalizan correctamente y el código nuevo incorpora pruebas cuando introduce lógica de negocio. |
| Compilación de la aplicación | La aplicación genera el build correctamente, detectando errores de compilación, tipado o dependencias. |

---

# Pruebas de calidad manuales

Además de las validaciones automáticas, cada Pull Request debe cumplir los siguientes criterios durante la revisión de código.

| Prueba | Qué revisar |
|--------|-------------|
| Convenciones de nomenclatura | Variables y funciones utilizan **camelCase**, componentes, clases, interfaces y tipos utilizan **PascalCase** y los archivos siguen la convención definida por el proyecto. Los nombres deben describir claramente su propósito y evitar abreviaturas ambiguas. |
| Diseño y responsabilidad de componentes | Cada componente tiene una única responsabilidad, mantiene un tamaño razonable y favorece la reutilización. Se evita concentrar demasiada lógica en un único componente. |
| Limpieza del código | No existen imports sin utilizar, variables o funciones sin uso, código comentado innecesario, `console.log`, `debugger` ni código obsoleto. |
| Gestión del estado | El estado se mantiene en el nivel adecuado, evitando duplicidades, estados derivados innecesarios y sincronizaciones manuales que puedan provocar inconsistencias. |
| Rendimiento de la aplicación | Se evitan renderizados innecesarios y se utilizan técnicas de optimización como `memo`, `useMemo`, `useCallback`, `OnPush`, `trackBy`, Lazy Loading o Code Splitting cuando aportan valor. |
| Gestión de errores | Las operaciones asíncronas y llamadas HTTP gestionan correctamente los errores y muestran mensajes adecuados al usuario sin exponer información interna. |
| Accesibilidad (A11y) | Se utiliza HTML semántico, atributos ARIA cuando son necesarios, navegación mediante teclado, textos alternativos y contraste adecuado. |
| Seguridad | Se validan entradas del usuario, se evita el uso inseguro de `innerHTML` o `dangerouslySetInnerHTML` sin sanitización y no se expone información sensible. |
| Tipado fuerte | Se utilizan interfaces y tipos específicos, evitando `any` salvo casos excepcionales debidamente justificados. |
| Separación de responsabilidades | La lógica de negocio está separada de la presentación mediante servicios, hooks o utilidades compartidas. |
| Gestión eficiente de llamadas HTTP | Se evitan peticiones duplicadas, se reutilizan datos cuando sea posible y se gestionan correctamente estados de carga, error y caché. |
| Arquitectura del proyecto | Se respeta la estructura de carpetas, organización de módulos, servicios, componentes compartidos y patrones definidos por el proyecto. |
| Legibilidad y mantenibilidad | El código es claro, modular y fácil de mantener. Los comentarios se utilizan únicamente cuando aportan contexto relevante. |

---

# Entorno de ejecución

Las validaciones automáticas se ejecutan en entornos reproducibles mediante:

- Runner Ubuntu.
- Versión de Node.js definida en cada pipeline.
- Dependencias instaladas mediante el gestor de paquetes del proyecto.

---

# Tecnologías

- Angular
- React
- TypeScript
- GitHub Actions
- ESLint
- Vitest / herramientas de testing configuradas por cada aplicación

---

# Licencia

ISC