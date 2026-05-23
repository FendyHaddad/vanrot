import { writeFile } from 'node:fs/promises';
import { runDoctorChecks } from '../doctor/checks.js';
import { ensureAiDirectory } from './paths.js';

export async function writeAiDoctor(cwd: string): Promise<string> {
  const paths = await ensureAiDirectory(cwd);
  const findings = await runDoctorChecks(cwd);
  await writeFile(paths.doctor, `${JSON.stringify({ schemaVersion: 1, findings }, null, 2)}\n`);
  return paths.doctor;
}
