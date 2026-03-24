# Project Structure

```
src/
├── main.js           # App entry, Pinia setup
├── App.vue           # Root component, canvas, event handlers
├── style.css         # Global styles, CSS variables
├── components/
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   ├── Sidebar.vue   # Filter controls
│   └── ProjectCard.vue
└── stores/
    └── gallery.js    # Pinia store - all project data & logic
```

## Conventions
- Components use `<script setup>` syntax
- Store: `defineStore` with state/getters/actions pattern
- CSS: CSS variables in `:root`, scoped styles in components
- All components auto-import via Vue's resolution