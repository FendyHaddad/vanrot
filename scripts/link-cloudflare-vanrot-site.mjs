const accountId = requireEnv('CLOUDFLARE_ACCOUNT_ID');
const apiToken = requireEnv('CLOUDFLARE_API_TOKEN');
const projectName = process.env.CLOUDFLARE_PAGES_PROJECT_NAME ?? 'vanrot';
const productionBranch = process.env.CLOUDFLARE_PAGES_PRODUCTION_BRANCH ?? 'main';
const customDomain = process.env.CLOUDFLARE_PAGES_CUSTOM_DOMAIN ?? 'vanrot.vankode.com';
const zoneName = process.env.CLOUDFLARE_ZONE_NAME ?? 'vankode.com';
const cnameTarget = process.env.CLOUDFLARE_PAGES_CNAME_TARGET ?? `${projectName}.pages.dev`;

const apiBase = 'https://api.cloudflare.com/client/v4';

function requireEnv(name) {
  const value = process.env[name];

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  throw new Error(`Missing ${name}. Add it as a GitHub secret or export it locally.`);
}

function apiError(payload, response) {
  const messages = payload?.errors?.map(error => error.message).filter(Boolean) ?? [];
  const detail = messages.length > 0 ? messages.join('; ') : response.statusText;

  return new Error(`Cloudflare API ${response.status} ${response.url}: ${detail}`);
}

function isNotFound(payload, response) {
  if (response.status === 404) {
    return true;
  }

  const errors = payload?.errors ?? [];
  return errors.some(error => String(error.message ?? '').toLowerCase().includes('not found'));
}

async function cloudflare(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));

  if (options.allowNotFound && isNotFound(payload, response)) {
    return null;
  }

  if (!response.ok || payload.success === false) {
    throw apiError(payload, response);
  }

  return payload.result;
}

async function ensurePagesProject() {
  const project = await cloudflare(`/accounts/${accountId}/pages/projects/${projectName}`, {
    allowNotFound: true,
  });

  if (project) {
    console.log(`pages project ok: ${projectName}`);
    return;
  }

  await cloudflare(`/accounts/${accountId}/pages/projects`, {
    method: 'POST',
    body: {
      name: projectName,
      production_branch: productionBranch,
      build_config: {
        build_command: 'pnpm --filter @vanrot/vanrot-site build',
        destination_dir: 'apps/vanrot-site/dist',
        root_dir: '',
      },
    },
  });
  console.log(`pages project created: ${projectName}`);
}

async function ensurePagesDomain() {
  const existingDomain = await cloudflare(
    `/accounts/${accountId}/pages/projects/${projectName}/domains/${customDomain}`,
    { allowNotFound: true },
  );

  if (existingDomain) {
    console.log(`pages domain ok: ${customDomain}`);
    return;
  }

  await cloudflare(`/accounts/${accountId}/pages/projects/${projectName}/domains`, {
    method: 'POST',
    body: { name: customDomain },
  });
  console.log(`pages domain linked: ${customDomain}`);
}

async function zoneIdForDomain() {
  if (process.env.CLOUDFLARE_ZONE_ID) {
    return process.env.CLOUDFLARE_ZONE_ID;
  }

  const params = new URLSearchParams({ name: zoneName, per_page: '1' });
  const zones = await cloudflare(`/zones?${params.toString()}`);
  const zone = Array.isArray(zones) ? zones[0] : undefined;

  if (zone?.id) {
    return zone.id;
  }

  throw new Error(`Could not find Cloudflare zone ${zoneName}. Set CLOUDFLARE_ZONE_ID explicitly.`);
}

async function ensureDnsRecord() {
  const zoneId = await zoneIdForDomain();
  const params = new URLSearchParams({ name: customDomain, per_page: '100' });
  const records = await cloudflare(`/zones/${zoneId}/dns_records?${params.toString()}`);
  const conflicting = records.filter(record => record.type !== 'CNAME');

  if (conflicting.length > 0) {
    throw new Error(
      `${customDomain} already has non-CNAME DNS records. Remove or update them before linking Pages.`,
    );
  }

  const cname = records.find(record => record.type === 'CNAME');
  const body = {
    type: 'CNAME',
    name: customDomain,
    content: cnameTarget,
    ttl: 1,
    proxied: true,
  };

  if (!cname) {
    await cloudflare(`/zones/${zoneId}/dns_records`, { method: 'POST', body });
    console.log(`dns cname created: ${customDomain} -> ${cnameTarget}`);
    return;
  }

  if (cname.content === cnameTarget && cname.proxied === true) {
    console.log(`dns cname ok: ${customDomain} -> ${cnameTarget}`);
    return;
  }

  await cloudflare(`/zones/${zoneId}/dns_records/${cname.id}`, { method: 'PATCH', body });
  console.log(`dns cname updated: ${customDomain} -> ${cnameTarget}`);
}

await ensurePagesProject();
await ensurePagesDomain();
await ensureDnsRecord();
