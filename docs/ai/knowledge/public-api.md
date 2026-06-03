# Public API

## @vanrot/runtime *

All public exports from @vanrot/runtime are covered by the runtime and public API documentation.

Docs: /docs/public-api

## @vanrot/runtime signal

Creates a writable Vanrot signal for local state.

Docs: /docs/runtime

## @vanrot/runtime computed

Creates a derived value that tracks signal reads.

Docs: /docs/runtime

## @vanrot/runtime effect

Runs reactive side effects with cleanup and disposal.

Docs: /docs/runtime

## @vanrot/behavior *

All public exports from @vanrot/behavior are covered by behavior and public API documentation.

Docs: /docs/behavior

## @vanrot/compiler *

All public exports from @vanrot/compiler are covered by compiler and public API documentation.

Docs: /docs/public-api

## @vanrot/compiler compileComponent

Compiles a Vanrot component source into executable output.

Docs: /docs/compiler

## @vanrot/compiler parseTemplate

Parses Vanrot template source into the compiler AST.

Docs: /docs/compiler

## @vanrot/compiler diagnosticCatalog

Exposes compiler diagnostic metadata for docs and tools.

Docs: /docs/diagnostics

## @vanrot/config *

All public exports from @vanrot/config are covered by configuration and public API documentation.

Docs: /docs/public-api

## @vanrot/config defineVanrotConfig

Defines a typed Vanrot config object.

Docs: /docs/configuration

## @vanrot/config normalizeVanrotConfig

Normalizes config defaults and domains.

Docs: /docs/configuration

## @vanrot/config configDiagnosticCode

Lists config diagnostic codes.

Docs: /docs/diagnostics

## @vanrot/language-server *

All public exports from @vanrot/language-server are covered by editor language-server and public API documentation.

Docs: /docs/public-api

## @vanrot/language-server buildInitializeResult

Builds the Vanrot LSP initialize result with server metadata, document sync, completion, hover, definition, references, and rename capabilities.

Docs: /docs/public-api

## @vanrot/language-server isVanrotTemplateFile

Checks whether a path is an authored Vanrot HTML template.

Docs: /docs/public-api

## @vanrot/language-server startLanguageServer

Starts the Vanrot language server on an LSP connection with completion, hover, definition, references, rename, compiler diagnostics, and TypeScript expression diagnostics handlers.

Docs: /docs/public-api

## @vanrot/language-server vanrotTemplateRules

Canonical template-file rule emitted for editor integrations.

Docs: /docs/public-api

## @vanrot/router *

All public exports from @vanrot/router are covered by routing and public API documentation.

Docs: /docs/public-api

## @vanrot/router createRoutes

Creates the typed route builder used by apps.

Docs: /docs/routing

## @vanrot/router defineRoutes

Defines route refs from a route table.

Docs: /docs/routing

## @vanrot/router provideRouter

Installs router state into a Vanrot app.

Docs: /docs/routing

## @vanrot/ssr *

All public exports from @vanrot/ssr are covered by SSR hydration and public API documentation.

Docs: /docs/ssr-hydration

## @vanrot/ssr hydrationStateScriptId

Stable script element id used for serialized hydration state.

Docs: /docs/ssr-hydration

## @vanrot/ssr hydrationEventReplayPolicy

Documents that event replay stays explicit and deferred outside the first SSR package.

Docs: /docs/ssr-hydration

## @vanrot/ssr SsrDiagnosticCode

Diagnostic code union for SSR browser API, route, and hydration mismatches.

Docs: /docs/ssr-hydration

## @vanrot/ssr SsrDiagnostic

Structured SSR and hydration diagnostic record.

Docs: /docs/ssr-hydration

## @vanrot/ssr ServerRenderResult

Server render output with deterministic HTML, state, and diagnostics.

Docs: /docs/ssr-hydration

## @vanrot/ssr ServerComponentModule

Server-side component module contract for pure string rendering.

Docs: /docs/ssr-hydration

## @vanrot/ssr HydratableComponentModule

Client component contract accepted by hydration attach helpers.

Docs: /docs/ssr-hydration

## @vanrot/ssr RenderToStringOptions

Options for deterministic component string rendering.

Docs: /docs/ssr-hydration

## @vanrot/ssr HtmlAssetOptions

Shell asset options for scripts, stylesheets, and modules.

Docs: /docs/ssr-hydration

## @vanrot/ssr HtmlDocumentOptions

Document shell options for head content, app HTML, assets, and hydration state.

Docs: /docs/ssr-hydration

## @vanrot/ssr HydrateOptions

Hydration attach options for app container, props, state, and context.

Docs: /docs/ssr-hydration

## @vanrot/ssr HydrationResult

Hydration result that exposes the mounted app handle and reused element.

Docs: /docs/ssr-hydration

## @vanrot/ssr ReadHydrationStateOptions

Options for reading serialized state from a document.

Docs: /docs/ssr-hydration

## @vanrot/ssr SsrRouteResult

Router SSR resolution result for renders, redirects, not-found states, and diagnostics.

Docs: /docs/ssr-hydration

## @vanrot/ssr VanrotSsrError

Typed SSR error that carries the relevant diagnostic code.

Docs: /docs/ssr-hydration

## @vanrot/ssr renderToString

Renders a server component module to deterministic HTML.

Docs: /docs/ssr-hydration

## @vanrot/ssr renderServerComponent

Renders a nested server component for slot composition.

Docs: /docs/ssr-hydration

## @vanrot/ssr renderServerSlot

Renders a list of server component slots into a stable HTML fragment.

Docs: /docs/ssr-hydration

## @vanrot/ssr renderDocument

Builds a full HTML document shell with escaped hydration state and assets.

Docs: /docs/ssr-hydration

## @vanrot/ssr escapeHtml

Escapes text for safe server-rendered HTML output.

Docs: /docs/ssr-hydration

## @vanrot/ssr escapeAttribute

Escapes attribute values for safe server-rendered HTML output.

Docs: /docs/ssr-hydration

## @vanrot/ssr serializeHydrationState

Serializes hydration state while escaping HTML-sensitive script content.

Docs: /docs/ssr-hydration

## @vanrot/ssr readHydrationState

Reads serialized hydration state from the browser document.

Docs: /docs/ssr-hydration

## @vanrot/ssr hydrate

Attaches a hydratable Vanrot component to existing SSR markup.

Docs: /docs/ssr-hydration

## @vanrot/ssr compareHydrationMarkup

Compares server and client markup for text and attribute mismatch diagnostics.

Docs: /docs/ssr-hydration

## @vanrot/ssr diagnoseRouteHydration

Reports route divergence between server and client route resolution.

Docs: /docs/ssr-hydration

## @vanrot/ssr resolveSsrRoute

Resolves router tables for server rendering, redirects, lazy pages, and not-found results.

Docs: /docs/ssr-hydration

## @vanrot/ssr renderRouteToString

Combines router SSR resolution with component string rendering.

Docs: /docs/ssr-hydration

## @vanrot/vite-plugin *

All public exports from @vanrot/vite-plugin are covered by Vite plugin and public API documentation.

Docs: /docs/public-api

## @vanrot/vite-plugin vanrot

Creates the Vanrot Vite plugin.

Docs: /docs/vite-plugin

## @vanrot/vite-plugin vanrotPlugin

Named Vanrot Vite plugin factory.

Docs: /docs/vite-plugin

## @vanrot/vite-plugin default

Default Vanrot Vite plugin export.

Docs: /docs/vite-plugin

## @vanrot/cli *

All public exports from @vanrot/cli are covered by CLI and public API documentation.

Docs: /docs/public-api

## @vanrot/cli runCli

Runs the Vanrot CLI command dispatcher.

Docs: /docs/cli

## @vanrot/cli createConsoleReporter

Creates the terminal reporter used by CLI commands.

Docs: /docs/cli

## @vanrot/cli createMemoryReporter

Creates an in-memory reporter for tests and integrations.

Docs: /docs/cli

## @vanrot/ui *

All public exports from @vanrot/ui are covered by UI and public API documentation.

Docs: /docs/public-api

## @vanrot/ui uiPrimitiveOrder

Canonical order for UI primitive docs.

Docs: /docs/ui

## @vanrot/ui uiComponentRegistry

Structured UI component registry.

Docs: /docs/ui

## @vanrot/ui getUiComponentRegistryItem

Looks up a UI component registry entry.

Docs: /docs/ui

## @vanrot/testing *

All public exports from @vanrot/testing are covered by testing and public API documentation.

Docs: /docs/public-api

## @vanrot/testing testComponent

Builds a Vanrot component test builder around Vitest.

Docs: /docs/testing

## @vanrot/testing runComponentTest

Runs a component test directly with deterministic mount and destroy cleanup.

Docs: /docs/testing

## @vanrot/testing testPage

Builds a page-focused test builder for role-based `.page.ts` files.

Docs: /docs/testing

## @vanrot/testing runPageTest

Mounts a page in a jsdom app shell with screen, cleanup, rerender, and lifecycle helpers.

Docs: /docs/testing

## @vanrot/testing setupRouterTest

Creates a router test harness for route refs, params, query values, redirects, guards, lazy pages, and teardown.

Docs: /docs/testing/routing

## @vanrot/testing createAccessibilityAssertions

Creates readable role, name, disabled, focus, and semantic accessibility assertions for jsdom tests.

Docs: /docs/testing

## @vanrot/testing findByRole

Finds an element by explicit or implicit role and accessible name.

Docs: /docs/testing

## @vanrot/testing flushTestingTasks

Flushes queued promise work before DOM assertions.

Docs: /docs/testing/strategy

## @vanrot/testing waitForDomUpdate

Retries an assertion until signal-driven DOM output settles or a deterministic timeout is reached.

Docs: /docs/testing/strategy

## @vanrot/testing createFakeTimerBridge

Coordinates Vitest fake timers explicitly without hiding timer APIs.

Docs: /docs/testing/strategy

## @vanrot/testing createAsyncTestScope

Tracks pending promises, abort controllers, and cleanup callbacks for leak-free async tests.

Docs: /docs/testing/strategy

## @vanrot/devtools *

All public exports from @vanrot/devtools are covered by devtools and public API documentation.

Docs: /docs/public-api

## @vanrot/devtools normalizeGraphManifest

Normalizes a project graph manifest for devtools consumers.

Docs: /docs/devtools

## @vanrot/ai *

All public exports from @vanrot/ai are covered by AI bundle and public API documentation.

Docs: /docs/public-api

## @vanrot/seo *

All public exports from @vanrot/seo are covered by SEO and public API documentation.

Docs: /docs/public-api
