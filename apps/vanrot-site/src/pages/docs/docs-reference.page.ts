import {
  commandReference,
  conventionReference,
  diagnosticReference,
  generatedFileReference,
  limitationReference,
  packageReference,
  publicExportReference,
} from '../../docs/site-reference.ts';

export class DocsReferencePage {
  packageReference = packageReference;
  publicExportReference = publicExportReference;
  commandReference = commandReference;
  diagnosticReference = diagnosticReference;
  generatedFileReference = generatedFileReference;
  conventionReference = conventionReference;
  limitationReference = limitationReference;
}
