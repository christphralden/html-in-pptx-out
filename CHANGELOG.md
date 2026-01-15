# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2025-01-15

### Fixed

- Table header not preserving styling
- Single borders creating line+border element instead of just line

## [0.4.0] - 2025-01-15

### Fixed

- Double bullet points when HTML list items contain literal bullet characters (e.g., `<li>• Text</li>`)
- Strip leading bullet characters from text content when PowerPoint bullet formatting is applied

## [0.3.0] - 2025-11-20

### Added

- Vertical text support (`writing-mode: vertical-rl` and `vertical-lr`)
- List support for `<ul>` and `<ol>` elements with bullets and numbering
- `extractBullet` extractor for list item detection
- `writingMode` property to Typography interface
- `bullet` property to TextElementDTO
- `BASE_INDENT` constant for list indentation (default: 10)

### Changed

- Dynamic COORDINATE_BUFFER calculation based on font size (fonts <20px: 1.03, 20-40px: 1.04, ≥40px: 1.06)
- List items now correctly numbered sequentially using `numberStartAt`
- List detection now checks both `<li>` element and parent `<ul>`/`<ol>` computed styles
- Supports Tailwind `list-decimal` class on `<ul>` elements

### Fixed

- Text sizing now scales appropriately based on font size
- Vertical text properly rendered with PptxGenJS `vert` property
- Numbered lists display correct sequential numbers instead of all "1"
- List items detect `list-style-type: decimal` from CSS

## [0.2.4] - 2025-11-18

### Changed

- Support for pptxgenjs >=3.12.x

## [0.2.3] - 2025-11-17

### Changed

- Icon sizing logic

## [0.2.2] - 2025-11-17

### Added

- Text runs for table cell for more accurate formatting
- Deduplication for iframe parser

### Changed

- `COORDINATE_BUFFER` from `1.02` to `1.03` bc too small

## [0.2.1] - 2025-11-17

### Changed

- Bug fixes i guess

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
