import { readFileSync } from 'node:fs';
import {
  cliCommands,
  commandGroups,
  commandInvocation,
  commandName,
  vanrotSitePath,
  vanrotSiteUrl,
} from '../commands/metadata.js';
import {
  boldText,
  brandColor,
  brandGlow,
  dimText,
  gradientText,
  paintText,
  underlineText,
} from '../reporter/style.js';

export interface IntroOptions {
  version: string;
  color: boolean;
}

const introWidth = 62;
const usageColumnWidth = 26;
const journeyColumnWidth = 27;
const packageColumnWidth = 18;
const learnColumnWidth = 12;

const tagline = 'Signal-first web framework · runtime under 2 KB gzipped';

const journeySteps = [
  { run: `${commandInvocation(commandName.create)} my-app`, note: 'Scaffold a fresh Vanrot app' },
  { run: 'cd my-app && npm install', note: 'Step in and install dependencies' },
  { run: commandInvocation(commandName.dev), note: 'Start the dev server with instant HMR' },
  {
    run: `${commandInvocation(commandName.generate)} page about`,
    note: 'Grow with pages and components',
  },
  { run: `${commandInvocation(commandName.add)} button`, note: 'Pull in accessible UI primitives' },
  { run: commandInvocation(commandName.doctor), note: 'Check project health and intelligence' },
  { run: commandInvocation(commandName.build), note: 'Ship a production build' },
] as const;

const frameworkPackages = [
  { name: '@vanrot/runtime', note: 'Signals core · under 2 KB gzipped' },
  { name: '@vanrot/router', note: 'Client-side routing' },
  { name: '@vanrot/store', note: 'Signal-based state' },
  { name: '@vanrot/forms', note: 'Form state and validation' },
  { name: '@vanrot/ui', note: `Accessible primitives · ${commandInvocation(commandName.add)}` },
  { name: '@vanrot/behavior', note: 'Headless interaction helpers' },
  { name: '@vanrot/ssr', note: 'Server-side rendering' },
  { name: '@vanrot/seo', note: 'Metadata and SEO' },
  { name: '@vanrot/testing', note: 'Component testing helpers' },
  { name: '@vanrot/ai', note: 'AI knowledge base and MCP server' },
] as const;

const commandByName = new Map(cliCommands.map((command) => [command.name, command]));

export function readCliVersion(): string {
  try {
    const manifestUrl = new URL('../../package.json', import.meta.url);
    const manifest = JSON.parse(readFileSync(manifestUrl, 'utf8')) as { version?: string };
    return manifest.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export function renderIntro(options: IntroOptions): string {
  return [
    ...renderBanner(options),
    '',
    `  ${boldText('Usage', options.color)}   vr <command> [options]`,
    '',
    ...renderJourney(options),
    ...renderCommands(options),
    ...renderFramework(options),
    ...renderLearn(options),
    dimText('  Run vr <command> --help for flags and examples.', options.color),
    '',
  ].join('\n');
}

function renderBanner(options: IntroOptions): string[] {
  const rule = '─'.repeat(introWidth);
  const wordmark = boldText(gradientText('VANROT', options.color, brandColor, brandGlow), options.color);
  const version = dimText(`v${options.version}`, options.color);

  return [
    '',
    gradientText(rule, options.color, brandColor, brandGlow),
    `  ${wordmark}  ${version}`,
    `  ${dimText(tagline, options.color)}`,
    gradientText(rule, options.color, brandGlow, brandColor),
  ];
}

function renderJourney(options: IntroOptions): string[] {
  const lines = [sectionTitle('Start your journey', options)];

  journeySteps.forEach((step, index) => {
    const number = paintText(String(index + 1), options.color, brandColor);
    const run = boldText(step.run.padEnd(journeyColumnWidth), options.color);
    lines.push(`    ${number}  ${run} ${dimText(step.note, options.color)}`);
  });

  lines.push('');
  return lines;
}

function renderCommands(options: IntroOptions): string[] {
  const lines: string[] = [];

  for (const group of commandGroups) {
    lines.push(sectionTitle(group.label, options));

    for (const name of group.commands) {
      const metadata = commandByName.get(name);

      if (metadata === undefined) {
        continue;
      }

      lines.push(
        `  ${metadata.rootUsage.padEnd(usageColumnWidth)} ${dimText(metadata.description, options.color)}`,
      );
    }

    if ((group.commands as readonly string[]).includes(commandName.create)) {
      lines.push(
        dimText(
          `  e.g.  ${commandInvocation(commandName.create)} my-app  ·  ${commandInvocation(commandName.generate)} component header  ·  ${commandInvocation(commandName.add)} button`,
          options.color,
        ),
      );
    }

    lines.push('');
  }

  return lines;
}

function renderFramework(options: IntroOptions): string[] {
  const lines = [sectionTitle('The framework', options)];

  for (const frameworkPackage of frameworkPackages) {
    lines.push(
      `  ${paintText(frameworkPackage.name.padEnd(packageColumnWidth), options.color, brandGlow)} ${dimText(frameworkPackage.note, options.color)}`,
    );
  }

  lines.push('');
  return lines;
}

function renderLearn(options: IntroOptions): string[] {
  const docsUrl = `${vanrotSiteUrl}${vanrotSitePath.docs}`;
  const componentsUrl = `${vanrotSiteUrl}${vanrotSitePath.components}`;

  return [
    sectionTitle('Learn', options),
    `  ${'Docs'.padEnd(learnColumnWidth)} ${underlineText(docsUrl, options.color)}`,
    `  ${'Components'.padEnd(learnColumnWidth)} ${underlineText(componentsUrl, options.color)}`,
    '',
  ];
}

function sectionTitle(title: string, options: IntroOptions): string {
  return `  ${boldText(paintText(title.toUpperCase(), options.color, brandColor), options.color)}`;
}
