import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const inventoryPath = join('docs', 'superpowers', 'final-tdd-inventory.md');
const deferredStatus = 'Deferred';
const auditNeededStatus = 'Audit-Needed';
const postProductionPhasePattern = /\bPhase (17|18|19|20|21|22)\b/;

export async function verifyFinalTddInventory(root = process.cwd()) {
  const source = await readFile(join(root, inventoryPath), 'utf8');
  const failures = checkFinalTddInventory(source);

  if (failures.length > 0) {
    return {
      exitCode: 1,
      failures,
      message: ['Final TDD inventory verification failed.', ...failures.map((failure) => `- ${failure}`)].join(
        '\n',
      ),
    };
  }

  return { exitCode: 0, failures, message: 'Final TDD inventory verification passed.' };
}

export function checkFinalTddInventory(source) {
  return [
    ...checkInventoryTables(source),
    ...checkInventoryRows(parseFinalTddInventoryRows(source)),
  ];
}

export function parseFinalTddInventoryRows(source) {
  const rows = [];
  const lines = source.split('\n');
  let section = '';
  let header = [];

  for (const [index, line] of lines.entries()) {
    const heading = line.match(/^##+\s+(.*)$/);

    if (heading !== null) {
      section = heading[1];
      header = [];
      continue;
    }

    if (!isMarkdownTableRow(line)) {
      continue;
    }

    const cells = parseMarkdownTableRow(line);

    if (cells.includes('Current Maturity')) {
      header = cells;
      continue;
    }

    if (!header.includes('Tested') || !header.includes('Item') || !header.includes('Current Maturity')) {
      continue;
    }

    if (cells.length !== header.length) {
      continue;
    }

    const row = Object.fromEntries(header.map((column, cellIndex) => [column, cells[cellIndex]]));
    rows.push({
      area: row.Area,
      item: row.Item,
      line: index + 1,
      maturity: row['Current Maturity'],
      notes: row.Notes,
      ownerPhase: row['Owner Phase'],
      section,
      tested: row.Tested,
    });
  }

  return rows;
}

function checkInventoryTables(source) {
  const failures = [];
  const lines = source.split('\n');
  let section = '';
  let header = [];

  for (const [index, line] of lines.entries()) {
    const heading = line.match(/^##+\s+(.*)$/);

    if (heading !== null) {
      section = heading[1];
      header = [];
      continue;
    }

    if (!isMarkdownTableRow(line)) {
      continue;
    }

    const cells = parseMarkdownTableRow(line);

    if (!cells.includes('Current Maturity')) {
      if (header.includes('Current Maturity') && cells.length !== header.length) {
        failures.push(
          `${inventoryPath}:${index + 1} ${section} inventory row has ${cells.length} cells but expected ${header.length}.`,
        );
      }

      continue;
    }

    header = cells;

    if (!cells.includes('Tested')) {
      failures.push(`${inventoryPath}:${index + 1} inventory table for ${section} is missing the Tested column.`);
    }
  }

  return failures;
}

function checkInventoryRows(rows) {
  const failures = [];

  for (const row of rows) {
    if (row.maturity === auditNeededStatus) {
      failures.push(`${inventoryPath}:${row.line} ${row.section} ${row.item} is still ${auditNeededStatus}.`);
      continue;
    }

    if (row.maturity === deferredStatus && row.tested !== '[ ]') {
      failures.push(
        `${inventoryPath}:${row.line} ${row.section} ${row.item} is ${deferredStatus} but Tested is ${row.tested}.`,
      );
      continue;
    }

    if (row.maturity === deferredStatus && !postProductionPhasePattern.test(row.ownerPhase)) {
      failures.push(
        `${inventoryPath}:${row.line} ${row.section} ${row.item} is ${deferredStatus} outside post-production phases.`,
      );
      continue;
    }

    if (row.maturity !== deferredStatus && row.tested !== '[x]') {
      failures.push(
        `${inventoryPath}:${row.line} ${row.section} ${row.item} is ${row.maturity} but Tested is ${row.tested}.`,
      );
    }
  }

  return failures;
}

function isMarkdownTableRow(line) {
  return line.startsWith('|') && !/^\|[- :|]+\|$/.test(line);
}

function parseMarkdownTableRow(line) {
  return line
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim());
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await verifyFinalTddInventory();
  console.log(result.message);
  process.exitCode = result.exitCode;
}
