# Browser Support Policy

## Supported Targets

The editor is designed for modern evergreen browsers:

- Chrome (latest stable)
- Edge (latest stable)
- Firefox (latest stable)
- Safari (latest stable)

Best-effort support is provided for tablet-class browsers where required browser APIs are available.

## Required Browser APIs

- localStorage
- Blob and URL.createObjectURL
- addEventListener for keyboard and pointer events
- querySelector / DOMParser

## Verification Notes

- Core render path verified through integration tests.
- Persistence restore flow verified through integration tests.
- Static export contract and deterministic output verified through contract/integration tests.

## Non-Goals

- Legacy browsers without modern JavaScript or DOM APIs.
- Server-rendered compatibility requirements.
