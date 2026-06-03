import type { RichProject } from '../schemas/projectSchema'

const defaultStyle = {
  spacing: {},
  alignment: {},
  background: {},
}

export function createRichSampleProject(): RichProject {
  const now = new Date().toISOString()

  return {
    id: 'rich-project-sample',
    name: 'ai-wysiwyg',
    createdAt: now,
    updatedAt: now,
    rootNodeId: 'root',
    theme: { id: 'default', label: 'Default' },
    assets: {},
    version: 2,
    nodes: {
      root: {
        id: 'root',
        type: 'section',
        parentId: null,
        children: ['section-hero'],
        name: 'Root',
        visible: true,
        style: defaultStyle,
        props: {},
      },
      'section-hero': {
        id: 'section-hero',
        type: 'section',
        parentId: 'root',
        children: ['header-welcome', 'text-summary', 'columns-actions', 'picture-preview'],
        name: 'Hero Section',
        visible: true,
        style: {
          ...defaultStyle,
          spacing: { padding: '1rem' },
          background: { backgroundColor: '#f8fafc' },
        },
        props: { padding: '1rem' },
      },
      'header-welcome': {
        id: 'header-welcome',
        type: 'header',
        parentId: 'section-hero',
        children: [],
        name: 'Welcome Heading',
        visible: true,
        style: {
          ...defaultStyle,
          spacing: { margin: '0 0 0.5rem 0' },
          textColor: '#111827',
        },
        props: {
          headerLevel: 'h1',
          text: 'Build richer pages, not just text blocks',
        },
      },
      'text-summary': {
        id: 'text-summary',
        type: 'text',
        parentId: 'section-hero',
        children: [],
        name: 'Summary Copy',
        visible: true,
        style: {
          ...defaultStyle,
          spacing: { margin: '0 0 1rem 0' },
          textColor: '#334155',
        },
        props: {
          content: 'Use the layer panel to add sections, headings, columns, and pictures, then edit type-specific fields in the inspector.',
          link: null,
        },
      },
      'columns-actions': {
        id: 'columns-actions',
        type: 'columns',
        parentId: 'section-hero',
        children: [],
        name: 'Feature Columns',
        visible: true,
        style: {
          ...defaultStyle,
          spacing: { margin: '0 0 1rem 0' },
        },
        props: {
          columnCount: 3,
          gap: '0.75rem',
          collapseBreakpointPx: 768,
          manualWidths: [40, 30, 30],
          normalizedWidths: [40, 30, 30],
        },
      },
      'picture-preview': {
        id: 'picture-preview',
        type: 'picture',
        parentId: 'section-hero',
        children: [],
        name: 'Preview Image',
        visible: true,
        style: defaultStyle,
        props: {
          assetRef: '',
          alt: 'Placeholder for uploaded image assets',
          caption: 'Picture layers already support alt text and captions.',
        },
      },
    },
  }
}