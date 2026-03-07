# Changelog

All notable changes to this project are documented in this file.

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
