# Editor Architecture

## Overview

The editor is a client-only Svelte application with three primary flows:

1. Authoring flow: canvas, layers, and inspector mutate a single active Project state.
2. Persistence flow: debounced autosave writes to localStorage and restore hydrates active state at startup.
3. Export flow: deterministic HTML/CSS/JS artifacts are generated and zipped for static hosting.

## Data Flow

1. UI interactions modify project nodes/styles via domain helpers.
2. Mutation marks editor dirty and schedules autosave.
3. Autosave updates operation status and persists project payload.
4. Export builds manifest plus artifacts in canonical file order.

## State Containers

- projectRegistryStore: project metadata and active project pointer.
- activeProjectStore: full editable project payload.
- operationStatusStore: non-blocking status for autosave/restore/export.

## Security and Determinism

- Interaction behavior is restricted to predefined safe presets.
- Export filenames and manifest ordering are fixed to avoid nondeterministic output.
- Export HTML references only relative local assets.
