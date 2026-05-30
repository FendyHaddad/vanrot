# Documentation Pages

## Vanrot

Vanrot is a small frontend framework with compiler-known templates, signals, route ownership, source-owned UI, and a documentation-first development path.

Docs: /docs

## Installation

Create or run a Vanrot app through the CLI and workspace package graph.

Docs: /docs/installation

## Project Structure

Vanrot keeps source roles explicit with TypeScript, HTML, and CSS side by side.

Docs: /docs/project-structure

## Runtime

@vanrot/runtime is the browser runtime boundary for reactivity, inputs, lifecycle cleanup, compiled-component mounting, and runtime graph contracts.

Docs: /docs/runtime

## Runtime Signals

A signal is the @vanrot/runtime state primitive: readable state, writable updates, cached computed values, and effects all share one explicit dependency graph.

Docs: /docs/runtime/signals

## Runtime Inputs

Runtime inputs are signal-shaped component boundary values for required and defaulted data passed into generated components.

Docs: /docs/runtime/inputs

## Runtime Forms

Runtime forms provide a small controller and validator surface for repeated field state, validation, and error handling.

Docs: /docs/runtime/forms

## Runtime UI Controllers

UI controllers are small runtime helpers for repeated interaction patterns such as overlays, command menus, layers, tabs, tooltips, and toasts.

Docs: /docs/runtime/controllers

## Runtime Devtools Graph

The runtime graph session records nodes, edges, and events so devtools can inspect reactive behavior without changing application code.

Docs: /docs/runtime/devtools-graph

## Runtime Lifecycle

Runtime lifecycle hooks attach setup and cleanup to the active mount scope so effects, DOM listeners, and component teardown stay deterministic.

Docs: /docs/runtime/lifecycle

## Runtime Mounting

mount() is the browser entry point that creates the root cleanup scope and attaches compiled component output to a target element.

Docs: /docs/runtime/mounting

## Behavior

@vanrot/behavior is optional and lets apps pick only the headless behavior helpers they use.

Docs: /docs/behavior

## Compiler

@vanrot/compiler turns role files, HTML templates, and scoped CSS into generated JavaScript, generated CSS, diagnostics, source maps, child component metadata, and readable feature metadata.

Docs: /docs/compiler

## Compiler File Conventions

Vanrot compiler file conventions pair each role TypeScript file with sibling HTML and CSS sources before any template or style transform runs.

Docs: /docs/compiler/file-conventions

## Compiler Component Class

The compiler reads a named exported class from each role file and uses that class as the generated component identity.

Docs: /docs/compiler/component-class

## Compiler Template Syntax

Vanrot template syntax keeps HTML declarative while supporting interpolation, property binding, event binding, control flow, child components, slots, router tags, and UI primitives.

Docs: /docs/compiler/template-syntax

## Compiler Expressions

Vanrot compiler expressions are rewritten into component-safe reads and method calls while rejecting statement-like logic in templates.

Docs: /docs/compiler/expressions

## Compiler Event Binding

Event binding compiles declarative template events into generated listeners that call component methods and stay cleanup-safe.

Docs: /docs/compiler/event-binding

## Compiler Scoped CSS

Scoped CSS transforms component styles with a generated scope attribute while keeping source mappings back to the original CSS file.

Docs: /docs/compiler/scoped-css

## Compiler Child Components

Child component compilation detects component tags, imports the child class, validates inputs, and records dependency metadata.

Docs: /docs/compiler/child-components

## Compiler Slots

Slots let a parent provide named content to a child component while the compiler validates slot targets and lowers slot outlets.

Docs: /docs/compiler/slots

## Compiler @for

@for compiles list rendering with an explicit item source and required tracking expression so generated DOM updates stay predictable.

Docs: /docs/compiler/for

## Compiler @if and @else

@if and @else compile conditional template branches into cleanup-safe DOM updates driven by a component expression.

Docs: /docs/compiler/if-else

## Compiler Inputs

Compiler input metadata lets Vanrot validate child component input bindings before generated code reaches the browser.

Docs: /docs/compiler/inputs

## Compiler Source Maps

Compiler source mappings connect generated JavaScript and CSS back to original template and style files for diagnostics, inspection, and tests.

Docs: /docs/compiler/source-maps

## Compiler Compilation API

The @vanrot/compiler API exposes full component compilation plus lower-level parsing, metadata, style, codegen, diagnostics, and source-location helpers for tooling.

Docs: /docs/compiler/compilation-api

## Vite Plugin

@vanrot/vite-plugin is the Vite integration layer for Vanrot applications. It compiles role files, watches sibling templates and styles, exposes virtual CSS and source modules, forwards diagnostics, and preserves source-map context during dev and build.

Docs: /docs/vite-plugin

## Vite Plugin Setup

Setup connects @vanrot/vite-plugin to Vite so Vanrot role files compile during development and production builds.

Docs: /docs/vite-plugin/setup

## Vite Plugin Options

VanrotPluginOptions control source matching, project root resolution, and source-root defaults for @vanrot/vite-plugin.

Docs: /docs/vite-plugin/options

## Vite Plugin Role File Transform

The role-file transform compiles Vanrot component, page, layout, and button files into Vite modules with generated JavaScript, CSS, diagnostics, and source maps.

Docs: /docs/vite-plugin/role-file-transform

## Vite Plugin Hot Reload

Hot reload keeps HTML and CSS sibling edits attached to the owning Vanrot role module instead of treating siblings as disconnected files.

Docs: /docs/vite-plugin/hot-reload

## Vite Plugin Virtual Modules

Virtual modules let generated Vanrot JavaScript import scoped CSS and original source through Vite without writing temporary generated files.

Docs: /docs/vite-plugin/virtual-modules

## Vite Plugin Diagnostics

Diagnostics from project configuration and Vanrot compilation are surfaced through Vite errors and warnings so integration failures are visible during dev and build.

Docs: /docs/vite-plugin/diagnostics

## Vite Plugin Source Maps

Source maps connect generated Vanrot JavaScript and CSS back to template, style, and role-file source positions.

Docs: /docs/vite-plugin/source-maps

## Vite Plugin Devtools Metadata

The devtools metadata endpoint lets local tooling read Vanrot graph metadata from the Vite dev server.

Docs: /docs/vite-plugin/devtools-metadata

## CLI

@vanrot/cli is the project operator for Vanrot applications. It creates projects, writes role files, installs UI primitives, repairs configuration, runs Vite tasks, checks local health, and builds the project intelligence files used by devtools and AI readers.

Docs: /docs/cli

## CLI Command Surface

The command surface explains how @vanrot/cli names, groups, reports, and validates every current vr command.

Docs: /docs/cli/commands

## CLI Project Creation

Project creation uses @vanrot/cli to start an application with Vanrot source layout, config, Vite wiring, and starter role files already aligned.

Docs: /docs/cli/project-creation

## CLI Role Generation

Role generation writes Vanrot role files with predictable names, suffixes, templates, styles, and starter logic.

Docs: /docs/cli/role-generation

## CLI UI Primitive Add

UI primitive commands add Vanrot UI files and imports without breaking the project conventions around style mode and generated component ownership.

Docs: /docs/cli/ui-primitives

## CLI Config Maintenance

Configuration commands keep vanrot.config.ts present, canonical, repairable, and aligned with package expectations.

Docs: /docs/cli/config-maintenance

## CLI Project Intelligence

Project intelligence commands write map and AI context artifacts that describe the actual Vanrot project instead of relying on stale human memory.

Docs: /docs/cli/project-intelligence

## CLI Task Runners

Task runner commands let a Vanrot project use familiar vr dev, vr build, and vr test commands while keeping the Vite integration and project config visible.

Docs: /docs/cli/task-runners

## CLI Dev Server

vr dev starts the local Vanrot preview loop by validating project config and then running Vite with the configured host and port.

Docs: /docs/cli/dev

## CLI Build

vr build validates Vanrot config and then runs the production Vite build so release output uses the same framework plugin path as development.

Docs: /docs/cli/build

## CLI Test

vr test validates config and runs the project test suite through vitest run so local and CI checks share the same non-watch behavior.

Docs: /docs/cli/test

## Configuration

@vanrot/config owns vanrot.config.ts, default normalization, validation, migration, recovery, generated domain editing, router diagnostics settings, UI settings, and AI rules settings.

Docs: /docs/configuration

## Configuration File

The config file guide explains how vanrot.config.ts is authored, loaded, typed, and shared across packages.

Docs: /docs/configuration/file

## Configuration Defaults

Configuration defaults explain what @vanrot/config supplies when a project leaves optional settings out.

Docs: /docs/configuration/defaults

## UI Configuration

UI configuration controls the flavor and style mode used by generated UI primitive files.

Docs: /docs/configuration/ui

## Router Configuration

Router configuration controls diagnostics and navigation polish settings consumed by @vanrot/router and related tooling.

Docs: /docs/configuration/router

## AI Configuration

AI configuration controls generated AI rule sections and project intelligence behavior without making AI bundles the source of truth.

Docs: /docs/configuration/ai

## Configuration Maintenance

Configuration maintenance covers migration, recovery, validation, diagnostics, and generated-domain editing in @vanrot/config.

Docs: /docs/configuration/maintenance

## Routing

@vanrot/router owns route refs, nested layouts, params, query strings, redirects, guards, active links, breadcrumbs, preloading, keepAlive, route diagnostics, and current route state.

Docs: /docs/routing

## Routing Route Table

Route tables use createRoutes and defineRoutes to keep paths, labels, pages, layouts, redirects, and route refs in one named structure.

Docs: /docs/routing/route-table

## Routing Params and Query

Params and query helpers parse, fill, match, and build URL data without hand-joining route strings.

Docs: /docs/routing/params-query

## Routing Layouts and Redirects

Layouts and redirects describe nested route structure and canonical navigation targets without putting routing policy in templates.

Docs: /docs/routing/layouts-redirects

## Routing Guards

Route guards decide whether navigation may continue, redirect, or stop before a protected page renders.

Docs: /docs/routing/guards

## Routing Navigation

Navigation polish covers current route state, active links, breadcrumbs, route params signals, and route diagnostics.

Docs: /docs/routing/navigation

## Routing Preloading and KeepAlive

Preloading and keepAlive improve navigation responsiveness and state restoration when a route really benefits from retained work.

Docs: /docs/routing/preloading-keep-alive

## UI October

October is Vanrot's dark-first, light-capable UI foundation with source-owned primitives, tokens, and vanrotstyles.

Docs: /docs/ui

## Theming

Vanrot themes use CSS custom properties for colors, surfaces, radius, shadows, typography, motion, and z-index layers.

Docs: /docs/theming

## vanrotstyles

vanrotstyles.css is Vanrot's first-party utility CSS layer with unprefixed utility classes.

Docs: /docs/vanrotstyles

## Testing

@vanrot/testing currently exposes component test helpers built around testComponent and Screen, with route-aware and production workflow guidance documented as the framework grows.

Docs: /docs/testing

## Testing Component Tests

Component tests mount a Vanrot component through testComponent and assert against rendered behavior.

Docs: /docs/testing/component-tests

## Testing Screen

Screen is the small DOM query surface returned by @vanrot/testing component tests.

Docs: /docs/testing/screen

## Testing Routing

Routing tests verify route refs, paths, params, guards, active state, preloading, and keepAlive behavior at the router boundary.

Docs: /docs/testing/routing

## Testing Strategy

Testing strategy explains where to put coverage across Vanrot runtime, compiler, router, CLI, docs, UI, and generated artifacts.

Docs: /docs/testing/strategy

## Devtools And Project Intelligence

@vanrot/devtools reads project map manifests, runtime graph metadata, Vite plugin metadata, panel state, stale-state diagnostics, and AI-adjacent project intelligence without becoming the source of truth.

Docs: /docs/devtools

## Devtools Project Map

The project map manifest describes Vanrot role files, graph nodes, graph edges, routes, compiler metadata, AI metadata, and stale state.

Docs: /docs/devtools/project-map

## Devtools Runtime Graph

The runtime graph describes components, signals, computed values, effects, and dependency edges for development inspection.

Docs: /docs/devtools/runtime-graph

## Devtools Vite Metadata

Vite metadata connects the dev server, plugin diagnostics, role-file transforms, and devtools inspection.

Docs: /docs/devtools/vite-metadata

## Devtools Panel State

Panel state normalizes graph manifests into renderable devtools state without changing the underlying manifest contract.

Docs: /docs/devtools/panel-state

## Devtools Stale State

Stale-state diagnostics explain when project intelligence needs to be regenerated before devtools or AI consumers can trust it.

Docs: /docs/devtools/stale-state

## Examples

Examples show practical Vanrot usage without hiding the source files.

Docs: /docs/examples

## Runnable Example Matrix

Use verified example workspaces as the source of truth for framework workflows and docs snippets.

Docs: /docs/example-matrix

## Build And Deployment Preparation

Prepare a Vanrot site for production hosting without pretending this repository controls DNS, credentials, analytics, or live deployment.

Docs: /docs/deployment

## Public API Reference

Read the documented public exports for each current Vanrot package and see which guide owns the behavior.

Docs: /docs/public-api

## Diagnostics Reference

Find the current compiler, config, router, CLI, and Vite-plugin diagnostic codes with user-facing explanations.

Docs: /docs/diagnostics

## Generated Files And Directories

Understand generated files Vanrot users should expect in starter apps, config flows, route workflows, and project intelligence output.

Docs: /docs/generated-files

## Changelog

Track published Vanrot versions, release notes, and upgrade guidance from the first npm release onward.

Docs: /docs/changelog

## October Showcase

A broad Phase 16G composition surface for admin, dashboard, and mobile patterns.

Docs: /docs/examples/october-showcase

## Conventions

Vanrot conventions keep role files, templates, styles, state, routing, generated strings, and AI-readable project structure consistent across the framework.

Docs: /docs/conventions

## Conventions Role Files

Role file conventions make Vanrot source files discoverable by humans, compiler transforms, CLI generators, Vite plugin matching, devtools, and AI tools.

Docs: /docs/conventions/role-files

## Conventions Templates and Styles

Template and style conventions keep markup, behavior, and presentation split across HTML, TypeScript, and scoped CSS.

Docs: /docs/conventions/templates-and-styles

## Conventions State and Logic

State and logic conventions keep Vanrot components signal-driven, readable, testable, and free of template-side business rules.

Docs: /docs/conventions/state-and-logic

## Conventions Routing and Strings

Routing and string conventions prevent docs, routes, diagnostics, command names, labels, generated copy, and file suffixes from drifting.

Docs: /docs/conventions/routing-and-strings

## Conventions Scoped CSS

Scoped CSS conventions keep role-file styling local, predictable, and portable across generated components and docs examples.

Docs: /docs/conventions/scoped-css

## Conventions AI-readable Projects

AI-readable project conventions help maps, docs bundles, devtools, and external AI consumers recover accurate framework context.

Docs: /docs/conventions/ai-readable-projects

## Limitations And Deferred Work

Read honest status notes for demo-capable, limited, deferred, and not-browser-facing areas before using Vanrot in production contexts.

Docs: /docs/limitations

## Reference Status

The reference section shows what is available now, demo-capable, in progress, planned, or deferred.

Docs: /docs/status
