# Changelog

All notable changes to this project are documented in this file.

## [1.3.0] - 2026-06-18

### Added
- Added support for `x-for` and `x-if` directly on a component's root element: the component becomes a comment anchor and re-renders its content as siblings, so structural directives survive persistent router pages that wipe and reuse the outlet between navigations.
- Added the `x-html` directive to bind an expression to an element's `innerHTML`.
- Added integration tests covering root-level `x-for`/`x-if`, `x-html`, component props/emits, and router persistent pages.

### Changed
- `mounted()` is now called once binding is fully complete, instead of partway through component creation; it is also re-invoked whenever a root-directive component re-renders (e.g. on router remount).

## [1.2.0] - 2026-06-13

### Added
- Added `untrack()` to read signals without subscribing the current reactive effect.
- Added object support to `x-for`, including `(value, key) in object` loops.
- Added focused regression tests for router globals, watch callback tracking, empty templates, camelCase emits, and object loops.

### Changed
- Updated `watch()` so callback reads do not become dependencies of the watched source.
- Updated `createRouter()` so `globals.$route` is owned and updated by the router even before `RouterView` mounts.
- Updated component emit listener matching so kebab-case listeners can handle camelCase declared emits.

### Fixed
- Empty templates now fail with `TinyBubble template must return one root element` instead of surfacing a low-level DOM append error.

### Docs
- Updated the TinyBubble skill guidance for router globals, untracked watch callbacks, object loops, template scope limits, writable `x-model` targets, `x-show` lifecycle behavior, and emit listener naming.

## [1.0.2] - 2026-03-07

### Added
- Added repository metadata fields for GitHub, homepage, and issue tracking in `package.json`.
- Added a VS Code TinyBubble template helper extension under `tools/vscode-tinybubble-template`.
- Added a first project changelog and extension-specific changelog for future GitHub and marketplace releases.

### Changed
- Renamed the GitHub repository references from `bubble` to `tinybubble` across package metadata, docs, examples, and Claude skill prompts.
- Switched the project license from Apache-2.0 to MIT.
- Updated `@input` and `@change` runtime handling so native event data is easier to access in advanced handlers such as file uploads.

### Docs
- Expanded AI/component authoring guidance with explicit `$event` usage notes for `@input` and `@change` handlers.
