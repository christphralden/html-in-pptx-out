# html-in-pptx-out

TypeScript library converting HTML to PowerPoint with plugin architecture.

## Architecture

```
HTML → Parser → Plugins (onParse) → ElementDTOs → Plugins (onSlide) → Serializer → PPTX
```

## Key Directories

- `src/core/` - Converter orchestration
- `src/parsers/` - HTML parsing strategies
- `src/serializers/` - PPTX generation
- `src/plugins/core/` - Built-in element plugins
- `src/lib/extractors/` - DOM data extraction
- `src/types/` - Type definitions
- `src/utils/` - Utilities (sanitize, units, assert)

## Conventions

- Extractors: `extract*` functions
- Parsers: `parse*` functions
- Classifiers: `classify*` functions
- Sanitizers: `sanitize*` functions
- Plugin names: `core:*` namespace
- No comments on typed code unless custom business logic
- Constants live in `src/constants.ts`

## Adding Element Types

1. Add to `ElementType` in `src/types/base.types.ts`
2. Create DTO in `src/types/elements.types.ts`
3. Add classification in `src/lib/extractors/classifier.ts`
4. Create plugin in `src/plugins/core/`
5. Create serializer in `src/serializers/elements/`
6. Register in `src/constants.ts`

## Plugin Lifecycle

1. `beforeParse` - Modify HTML string
2. `onParse` - Transform DOM element to DTO
3. `onSlide` - Modify slide after parsing
4. `afterGenerate` - Post-process PPTX object
