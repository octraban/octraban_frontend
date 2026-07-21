import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import monacoEditorPluginPkg from "vite-plugin-monaco-editor";
const monacoEditorPlugin =
  monacoEditorPluginPkg.default || monacoEditorPluginPkg;

export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: [
        "editorWorkerService",
        "typescript",
        "json",
        "css",
        "html",
      ],
    }),
  ],
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vite's internal dynamic-import preload helper is pulled in by
          // every lazy route and every dynamic import() (monaco's own
          // per-language loading included). Left unpinned, Rollup's
          // automatic chunking parked it inside whichever manual vendor
          // chunk happened to use it most, forcing every lazy route to load
          // that entire vendor chunk just to reach this helper. Pin it to
          // the always-loaded framework chunk instead.
          if (id.includes("vite/preload-helper")) return "vendor-react";

          if (!id.includes("node_modules")) return undefined;

          // Pin the framework runtime to its own chunk first. Without this,
          // forcing react-flow-renderer's modules into a separate chunk
          // caused Rollup to duplicate React's own module into that chunk
          // instead of sharing the single copy used by the rest of the app.
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          // Tiny stateless helper packages pulled in by several of the
          // heavy libraries below (react-flow-renderer, 3d-force-graph).
          // Pinning them here (rather than letting Rollup park them inside
          // one specific vendor chunk) stops routes that only need one
          // heavy library from having to fetch another's whole chunk just
          // to reach a shared helper function.
          if (id.includes("/@babel/runtime/") || id.includes("/tslib/")) {
            return "vendor-react";
          }

          // Small d3 utility packages pulled in both by react-flow-renderer
          // (via d3-zoom/d3-transition) and by 3d-force-graph (via
          // d3-scale-chromatic/tween helpers). Pinning them stops the two
          // heavy graph libraries' chunks from statically depending on
          // one another.
          if (
            id.includes("/d3-color/") ||
            id.includes("/d3-interpolate/") ||
            id.includes("/d3-timer/")
          ) {
            return "vendor-react";
          }

          // Monaco lazily splits its own per-language and language-service
          // chunks (csharp, typescript, tsMode, etc.) via internal dynamic
          // imports - leave those alone so they keep loading on demand.
          if (
            id.includes("/monaco-editor/esm/vs/basic-languages/") ||
            id.includes("/monaco-editor/esm/vs/language/")
          ) {
            return undefined;
          }

          if (
            id.includes("/monaco-editor/") ||
            id.includes("/monaco-editor-workers/") ||
            id.includes("/vite-plugin-monaco-editor/")
          ) {
            return "monaco-editor";
          }

          // Kept as separate chunks (rather than one shared "graph-libs"
          // bundle) so a route using only one of these - e.g. BatchMultiCall
          // with react-flow-renderer - never pulls in the other two.
          if (id.includes("/3d-force-graph/")) return "vendor-3d-force-graph";
          if (id.includes("/cytoscape/")) return "vendor-cytoscape";
          if (id.includes("/react-flow-renderer/"))
            return "vendor-react-flow-renderer";

          if (id.includes("/@webcontainer/")) return "vendor-webcontainer";
          if (id.includes("/jszip/")) return "vendor-jszip";

          return undefined;
        },
      },
    },
  },
  server: { proxy: { "/api": "http://localhost:3001" } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
  },
});
