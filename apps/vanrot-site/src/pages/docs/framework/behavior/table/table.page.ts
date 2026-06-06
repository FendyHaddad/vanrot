import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const behaviorTableArticle = {
  "key": "behaviorTable",
  "section": "framework",
  "path": "/docs/behavior/table",
  "label": "Table",
  "title": "Table Behavior",
  "summary": "createTableController adds client-side filtering, sorting, pagination, and row selection over a typed row array.",
  "status": "production-ready-through-phase-16h",
  "sections": [
    {
      "id": "derived-state",
      "title": "Derived state",
      "body": "createTableController is for client-side tables where rows are already available in memory. Give the controller rows and an optional pageSize and getRowId. It maintains rows, filteredRows, visibleRows, query, page, pageSize, totalPages, sortKey, sortDirection, selectedIds, loading, and empty as signals, so a table template can render filters, headers, pagination, and empty states from one controller.",
      "points": [
        "setFilter(query) does a case-insensitive match across all row values.",
        "sortBy(key) toggles asc and desc using numeric-aware comparison.",
        "setPage(page) clamps to the available range; visibleRows holds the page slice."
      ]
    },
    {
      "id": "selection-and-filter",
      "title": "Selection and external filter",
      "body": "toggleRow(row, index) and clearSelection() drive selectedIds using getRowId. Use a stable row id for app data, because the index fallback is only safe for static demos. connectTableFilter(input, controller) binds a native search input to setFilter and returns a disposer so search wiring cleans up when the table page is destroyed.",
      "code": {
        "title": "Filter and sort",
        "code": "import { createTableController } from '@vanrot/behavior/table';\n\nconst table = createTableController({ rows, pageSize: 20 });\ntable.setFilter('vancouver');\ntable.sortBy('name');\ntable.setPage(2);\n\nconst visible = table.visibleRows();"
      }
    },
    {
      "id": "pagination-and-empty-state",
      "title": "Pagination and empty state",
      "body": "Filtering, sorting, and row replacement all refresh pagination. setRows resets to page one, setFilter resets to page one, and setPage clamps the requested page against totalPages. The empty signal is true when the filtered result has no rows and loading is false, which lets a page distinguish between loading skeletons and a real no-results message.",
      "points": [
        "Use loading for app-owned fetch state; the controller does not perform network requests.",
        "Render visibleRows() instead of slicing rows again in the template.",
        "Use totalPages(), page(), and setPage() for pager buttons."
      ]
    }
  ]
} as const;

const sectionLinks = behaviorTableArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class TablePage {
  title(): string {
    return behaviorTableArticle.title;
  }

  summary(): string {
    return behaviorTableArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = behaviorTableArticle.sections[0].body;
  section1Body = behaviorTableArticle.sections[1].body;
  section2Body = behaviorTableArticle.sections[2].body;
  section0Points = behaviorTableArticle.sections[0].points ?? [];
  section2Points = behaviorTableArticle.sections[2].points ?? [];
  section1Code = behaviorTableArticle.sections[1].code?.code ?? '';
}
