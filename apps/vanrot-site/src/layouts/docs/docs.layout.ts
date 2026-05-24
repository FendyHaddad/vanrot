import {
  siteNavigationBySection,
  siteNavigationSectionLabel,
} from '../../docs/site-navigation.ts';

export class DocsLayout {
  labels = siteNavigationSectionLabel;
  getStartedItems = siteNavigationBySection.getStarted;
  frameworkItems = siteNavigationBySection.framework;
  uiItems = siteNavigationBySection.ui;
  componentItems = siteNavigationBySection.components;
  exampleItems = siteNavigationBySection.examples;
  referenceItems = siteNavigationBySection.reference;
}
