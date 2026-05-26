import {
  siteNavigationBySection,
  siteNavigationSectionLabel,
} from '../../docs/site-navigation.ts';
import { setupDocsShellInteractions } from './docs-shell-interactions.widget.ts';

export class DocsLayout {
  labels = siteNavigationSectionLabel;
  getStartedItems = siteNavigationBySection.getStarted;
  frameworkItems = siteNavigationBySection.framework;
  uiItems = siteNavigationBySection.ui;
  componentItems = siteNavigationBySection.components;
  exampleItems = siteNavigationBySection.examples;
  referenceItems = siteNavigationBySection.reference;
  commandItems = [
    ...siteNavigationBySection.getStarted,
    ...siteNavigationBySection.ui,
    ...siteNavigationBySection.components,
    ...siteNavigationBySection.examples,
  ];

  constructor() {
    setupDocsShellInteractions();
  }
}
