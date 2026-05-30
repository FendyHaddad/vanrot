# Components

## Button

Use buttons for actions and command triggers. Usage: <vr-button variant.default type="button">Save</vr-button> Accessibility: Buttons lower to native button elements and preserve focus, disabled, keyboard, and type behavior.

Docs: /docs/components/button

## Card

Use cards for grouped content surfaces. Usage: <vr-card variant.default>Content</vr-card> Accessibility: Cards lower to article-like surfaces and keep child content readable.

Docs: /docs/components/card

## Badge

Use badges for short status, category, or metadata labels. Usage: <vr-badge tone.success>Ready</vr-badge> Accessibility: Badge examples should not rely on color alone for meaning.

Docs: /docs/components/badge

## Avatar

Use avatars for person, tenant, team, or entity identity. Usage: <vr-avatar variant.soft>VR</vr-avatar> Accessibility: Avatar content should include accessible names when it represents a person or entity.

Docs: /docs/components/avatar

## Alert

Use alerts for persistent inline feedback. Usage: <vr-alert tone.info>Project ready.</vr-alert> Accessibility: Alerts use severity-aware semantics without making every note interruptive.

Docs: /docs/components/alert

## Loader

Use loaders for pending activity. Usage: <vr-loader variant.spinner aria-label="Loading"></vr-loader> Accessibility: Decorative loaders are hidden by default unless labelled.

Docs: /docs/components/loader

## Skeleton

Use skeletons to preserve layout while content loads. Usage: <vr-skeleton variant.text></vr-skeleton> Accessibility: Skeletons are decorative by default and should not replace real loading labels.

Docs: /docs/components/skeleton

## Separator

Use separators to divide related content. Usage: <vr-separator orientation.horizontal></vr-separator> Accessibility: Separators expose orientation when semantics are needed.

Docs: /docs/components/separator

## Layout

Use layouts for full-page shell structure. Usage: <vr-layout><vr-router></vr-router></vr-layout> Accessibility: Layouts preserve landmarks provided by child header, main, sidebar, and footer regions.

Docs: /docs/components/layout

## Container

Use containers to constrain readable content width. Usage: <vr-container size.lg>Content</vr-container> Accessibility: Containers are structural and should not replace semantic headings or landmarks.

Docs: /docs/components/container

## Section

Use sections to separate meaningful page regions. Usage: <vr-section spacing.md>Content</vr-section> Accessibility: Sections should include clear headings when they introduce a new content region.

Docs: /docs/components/section

## Grid

Use grids for responsive column layouts. Usage: <vr-grid cols.3 gap.4>Content</vr-grid> Accessibility: Grids control layout only; keep reading order meaningful in the source.

Docs: /docs/components/grid

## Header

Use headers for top-level page or section identity. Usage: <vr-header>Header</vr-header> Accessibility: Headers lower to native header landmarks when used in page structure.

Docs: /docs/components/header

## Footer

Use footers for closing page or section metadata. Usage: <vr-footer>Footer</vr-footer> Accessibility: Footers lower to native footer landmarks when used in page structure.

Docs: /docs/components/footer

## Sidebar

Use sidebars for static adjacent navigation or secondary content. Usage: <vr-sidebar placement.left>Navigation</vr-sidebar> Accessibility: Sidebars lower to aside and should be paired with labelled navigation when they contain links.

Docs: /docs/components/sidebar

## Nav

Use nav for labelled navigation groups. Usage: <vr-nav aria-label="Primary">Links</vr-nav> Accessibility: Navigation elements must keep clear aria-label values when multiple nav regions are present.

Docs: /docs/components/nav

## Breadcrumb

Use breadcrumbs to show the current page path. Usage: <vr-breadcrumb aria-label="Breadcrumb">Path</vr-breadcrumb> Accessibility: Breadcrumbs lower to nav and should expose the current page in the trail.

Docs: /docs/components/breadcrumb

## Image

Use images for responsive visual media. Usage: <vr-img src="/image.png" alt="Preview"></vr-img> Accessibility: Images preserve platform alt text requirements; decorative images should use an empty alt value.

Docs: /docs/components/img

## Source

Use sources inside picture or media elements. Usage: <vr-src srcset="/image.avif" type="image/avif"></vr-src> Accessibility: Sources are media candidates and rely on the parent media element for accessible text.

Docs: /docs/components/src

## Form

Use forms to group registered controls and submit application-owned data. Usage: <vr-form><vr-form-field name="email" required><vr-input type.email></vr-input></vr-form-field></vr-form> Accessibility: Submit orchestration marks invalid fields touched before preventing submit.

Docs: /docs/components/form

## Form Field

Use form fields to bind a label, help text, validation message, and control. Usage: <vr-form-field name="email" label="Email"><vr-input name="email"></vr-input></vr-form-field> Accessibility: Connect labels, descriptions, and validation messages to the control with stable field names.

Docs: /docs/components/formField

## Label

Use labels for visible control names that can target a native input. Usage: <vr-label for="email">Email</vr-label> Accessibility: Labels should use for when targeting a separate control and remain visible for editable fields.

Docs: /docs/components/label

## Input

Use inputs for single-line form values with typed dotted tokens. Usage: <vr-input type.email size.md name="email" placeholder="Email"></vr-input> Accessibility: Use a visible <vr-label> or aria-label. Validation sets aria-invalid and aria-describedby when an error element is present.

Docs: /docs/components/input

## Textarea

Use textareas for multi-line form values. Usage: <vr-textarea name="notes" placeholder="Notes"></vr-textarea> Accessibility: Pair each textarea with a visible label or aria-label and connect help text through aria-describedby.

Docs: /docs/components/textarea

## Select

Use selects for choosing one value from application-owned options. Usage: <vr-select name="status"><option>Draft</option><option>Ready</option></vr-select> Accessibility: Keep a visible label or aria-label and preserve native option semantics.

Docs: /docs/components/select

## Checkbox

Use checkboxes for independent boolean choices. Usage: <vr-checkbox name="accepted" checked></vr-checkbox> Accessibility: Checkboxes keep native checked state; pair each control with an accessible label.

Docs: /docs/components/checkbox

## Radio Group

Use radio groups to collect mutually exclusive choices. Usage: <vr-radio-group name="plan"><vr-radio value="basic"></vr-radio><vr-radio value="pro"></vr-radio></vr-radio-group> Accessibility: Use a group label and keep radio options keyboard reachable.

Docs: /docs/components/radioGroup

## Radio

Use radios for one option inside a shared group. Usage: <vr-radio name="plan" value="pro" checked></vr-radio> Accessibility: Radios keep native checked state and should share a name with related options.

Docs: /docs/components/radio

## Switch

Use switches for immediate on/off settings. Usage: <vr-switch checked aria-label="Notifications"></vr-switch> Accessibility: Compiler lowering keeps switch as a button with role switch.

Docs: /docs/components/switch

## Slider

Use sliders for bounded numeric values. Usage: <vr-slider name="volume" min="0" max="100" step="5"></vr-slider> Accessibility: Expose a label and keep min, max, step, and value understandable to assistive technology.

Docs: /docs/components/slider

## Table

Use tables for structured data with optional sorting, filtering, pagination, and selection state. Usage: <vr-table density.compact sortable filterable paginated selectable></vr-table> Accessibility: Use <vr-table-caption> for accessible context when visible title copy helps.

Docs: /docs/components/table

## Table Header

Use table headers to group heading rows. Usage: <vr-table-header><vr-table-row><vr-table-head>Name</vr-table-head></vr-table-row></vr-table-header> Accessibility: Table headers lower to thead and should contain header cells for column context.

Docs: /docs/components/tableHeader

## Table Body

Use table bodies to group data rows. Usage: <vr-table-body><vr-table-row><vr-table-cell>Value</vr-table-cell></vr-table-row></vr-table-body> Accessibility: Table bodies lower to tbody and should keep rows aligned with table headers.

Docs: /docs/components/tableBody

## Table Row

Use table rows inside table header, body, or footer groups. Usage: <vr-table-row selected><vr-table-cell>Value</vr-table-cell></vr-table-row> Accessibility: Rows can expose selected or disabled state while preserving native row structure.

Docs: /docs/components/tableRow

## Table Head

Use table head cells for compact column or row headings with dashboard table density. Usage: <vr-table-head sort="name">Name</vr-table-head> Accessibility: Header cells lower to th and should describe their related table cells.

Docs: /docs/components/tableHead

## Table Cell

Use table cells for compact tabular values that align with dense dashboard rows. Usage: <vr-table-cell>Value</vr-table-cell> Accessibility: Cells lower to td and should stay aligned with row and column headers.

Docs: /docs/components/tableCell

## Table Footer

Use table footers for totals, summaries, or repeated table actions. Usage: <vr-table-footer><vr-table-row><vr-table-cell>Total</vr-table-cell></vr-table-row></vr-table-footer> Accessibility: Footers lower to tfoot and should not replace row or column headers.

Docs: /docs/components/tableFooter

## Table Caption

Use table captions for concise table context. Usage: <vr-table-caption>Recent invoices</vr-table-caption> Accessibility: Captions lower to caption and should describe the table content.

Docs: /docs/components/tableCaption

## Pagination

Use pagination for navigating paged data sets. Usage: <vr-pagination page="1" total="120" pageSize="20"></vr-pagination> Accessibility: Pagination lowers to nav and should include a useful aria-label when multiple nav regions exist.

Docs: /docs/components/pagination

## List

Use lists for ordered or unordered grouped content. Usage: <vr-list marker.disc><vr-list-item>One</vr-list-item><vr-list-item>Two</vr-list-item></vr-list> Accessibility: Lists keep native list semantics; choose marker and density without removing item meaning.

Docs: /docs/components/list

## List Item

Use list items inside Vanrot list primitives. Usage: <vr-list-item>Checklist item</vr-list-item> Accessibility: List items lower to li and should remain children of a list.

Docs: /docs/components/listItem

## Stat

Use stats for compact metric readouts with dense card spacing, tone, and alignment tokens. Usage: <vr-stat tone.success align.left>98%</vr-stat> Accessibility: Stats should keep labels close to values so the metric is understandable out of context.

Docs: /docs/components/stat

## Empty State

Use empty states when a data view has no available records. Usage: <vr-empty-state tone.muted>No records yet</vr-empty-state> Accessibility: Empty states should explain the missing content and expose recovery actions when available.

Docs: /docs/components/emptyState

## Dialog

Use dialogs for focused modal decisions, edits, or confirmations. Usage: <vr-dialog size.md><vr-dialog-trigger>Open</vr-dialog-trigger><vr-dialog-content>Content</vr-dialog-content></vr-dialog> Accessibility: Dialogs move focus into content when opened and restore focus to the trigger when closed.

Docs: /docs/components/dialog

## Drawer

Use drawers for temporary side panels that keep users in the current page context. Usage: <vr-drawer side.right><vr-drawer-trigger>Open</vr-drawer-trigger><vr-drawer-content>Content</vr-drawer-content></vr-drawer> Accessibility: Drawers use the shared overlay controller, close on escape or outside pointer, and preserve focus return.

Docs: /docs/components/drawer

## Dropdown

Use dropdowns for compact action lists and contextual menus. Usage: <vr-dropdown align.end side.bottom><vr-dropdown-trigger>Account</vr-dropdown-trigger><vr-dropdown-content><vr-dropdown-item>Profile</vr-dropdown-item></vr-dropdown-content></vr-dropdown> Accessibility: Dropdown triggers remain keyboard reachable and content closes predictably through the overlay controller.

Docs: /docs/components/dropdown

## Tabs

Use tabs for switching between related panels without leaving the page. Usage: <vr-tabs value.overview><vr-tabs-list><vr-tabs-trigger value.overview>Overview</vr-tabs-trigger></vr-tabs-list><vr-tabs-panel value.overview>Overview</vr-tabs-panel></vr-tabs> Accessibility: Tabs wire tab and tabpanel roles, selected state, focus order, and arrow-key movement through a small controller.

Docs: /docs/components/tabs

## Toast

Use toasts for short, non-blocking feedback messages. Usage: <vr-toast tone.success><vr-toast-title>Saved</vr-toast-title><vr-toast-description>Changes were saved.</vr-toast-description></vr-toast> Accessibility: Toast queues should use a labelled viewport and keep messages dismissible without stealing focus.

Docs: /docs/components/toast

## Popover

Use popovers for anchored contextual panels that keep users in the current workflow. Usage: <vr-popover align.center side.bottom><vr-popover-trigger><vr-button variant.outline>Open popover</vr-button></vr-popover-trigger><vr-popover-content><vr-popover-title>Dimensions</vr-popover-title><input value="100%" /></vr-popover-content></vr-popover> Accessibility: Popovers return focus to their trigger, close on escape or outside pointer, and keep labelled content available to assistive technology.

Docs: /docs/components/popover

## Tooltip

Use tooltips for short supporting copy on compact controls. Usage: <vr-tooltip side.top align.center><vr-tooltip-trigger><vr-button variant.outline>Hover</vr-button></vr-tooltip-trigger><vr-tooltip-content>Add to library</vr-tooltip-content></vr-tooltip> Accessibility: Tooltips supplement the trigger label and should not hide information needed to complete the task.

Docs: /docs/components/tooltip

## Command Menu

Use command menus for searchable keyboard-first action and navigation surfaces. Usage: <vr-command-menu density.compact><vr-command-menu-input placeholder="Type a command or search..."></vr-command-menu-input><vr-command-menu-group><vr-command-menu-item value.calendar>Calendar</vr-command-menu-item></vr-command-menu-group></vr-command-menu> Accessibility: Command menus keep active descendant state, skip disabled items, and expose selectable actions through predictable keyboard movement.

Docs: /docs/components/commandMenu
