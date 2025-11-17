# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2025-11-17

### Added

- Font Awesome icon plugin (`core:fontawesome`)
- TextRun and Shadow types exported from public API
- STROKE_DASH_MAP centralized in constants

### Changed

- **BREAKING**: pptxgenjs is now a peer dependency (install separately)
- **BREAKING**: Minimum Node.js version is now 20.19.0
- Switched bundler from tsup to tsdown (faster builds)
- Output files use `.mjs`/`.cjs` extensions
- Bundle size reduced from ~825KB to ~35KB

### Fixed

- CLI now properly writes output files
- Text margin order corrected (top/right/bottom/left)
- Circular export in plugins/core/index.ts
- Chart dimensions use container bounds instead of SVG dimensions
- Shape fill opacity extraction for RGB colors

### Removed

- DOMPurify dependency (unused)
- Unused utility functions (waitFor, sanitizeHtml, sanitizeString)

## [0.1.0] - 2025-11-16

### Added

- Initial release
- Core plugins: text, shape, line, table, image, chart (Plotly)
- IframeParser for HTML rendering
- PptxSerializer using pptxgenjs
- Plugin architecture with lifecycle hooks
- CLI tool for command-line conversion
