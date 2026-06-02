# Quickstart: Svelte WYSIWYG Editor

## Goal
Implement a fully client-side Svelte WYSIWYG editor with local persistence and deterministic static ZIP export while keeping dependencies minimal.

## Prerequisites
- Node.js 20+
- npm 10+

## 1. Bootstrap project
```bash
npm create vite@latest . -- --template svelte-ts
npm install
```

## 2. Install minimal dependencies
```bash
npm install bits-ui fflate
npm install -D vitest @testing-library/svelte @testing-library/jest-dom playwright
```

## 3. Suggested structure
```text
src/
  app.css
  main.ts
  lib/
    components/
      canvas/
      inspector/
      layers/
      shell/
    domain/
      project/
      export/
      interaction/
    stores/
      editor.ts
      projects.ts
      persistence.ts
    services/
      local-storage.ts
      exporter.ts
      validator.ts
    presets/
      interactions.ts
  routes/
    +page.svelte

tests/
  unit/
  integration/
  contract/
```

## 4. Implement in vertical slices
1. Build shell UI (canvas, layer tree, inspector) with keyboard focus support.
2. Implement project registry store and active project switching.
3. Add debounced autosave + restore from localStorage.
4. Add storage-full degraded mode banner and recovery actions.
5. Add safe interaction preset binding UI and validators.
6. Implement deterministic exporter (fixed manifest + canonical filenames).
7. Generate ZIP with `fflate` and trigger browser download.

## 5. Run locally
```bash
npm run dev
```

## 6. Validate quality gates
```bash
npm run test
npx playwright test
```

## 7. Manual verification script
1. Create project A and B, switch active project, reload tab, verify active restore.
2. Add content/styles/interactions to project A and export.
3. Unzip and verify files exist: `index.html`, `assets/styles.css`, `assets/app.js`, `manifest.json`.
4. Re-export unchanged project and compare file names/order for determinism.
5. Simulate storage pressure and verify persistent warning + autosave pause + manual export remains available.
