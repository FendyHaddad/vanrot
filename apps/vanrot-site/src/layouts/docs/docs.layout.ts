import {
  flattenNavigationItems,
  siteNavigationBySection,
  siteNavigationSectionLabel,
} from '../../docs/site-navigation.ts';
import { setupDocsShellInteractions } from './docs-shell-interactions.widget.ts';

export class DocsLayout {
  labels = siteNavigationSectionLabel;
  getStartedItems = siteNavigationBySection.getStarted;
  frameworkItems = siteNavigationBySection.framework;
  exampleItems = siteNavigationBySection.examples;
  referenceItems = siteNavigationBySection.reference;
  commandItems = [
    ...flattenNavigationItems(siteNavigationBySection.getStarted),
    ...flattenNavigationItems(siteNavigationBySection.framework),
    ...flattenNavigationItems(siteNavigationBySection.examples),
    ...flattenNavigationItems(siteNavigationBySection.reference),
  ];

  constructor() {
    setupDocsShellInteractions();
  }
}
