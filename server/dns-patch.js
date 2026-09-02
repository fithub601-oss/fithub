/**
 * FITHUB - DNS Patch
 * On Windows machines where Node's DNS is broken (this dev machine),
 * delegate resolution to PowerShell which works correctly.
 * On Linux/Render (production), Node DNS works fine, so this is a no-op.
 * Must be required before mongoose/express are loaded.
 */
const { execSync } = require('child_process');
const dns = require('dns');
const isWindows = process.platform === 'win32';

if (!isWindows) {
  console.log('[DNS-PATCH] Non-Windows platform - using native Node DNS (no patch needed)');
  module.exports = { enabled: false };
  return;
}

// Cache resolved results
const cache = { srv: {}, txt: {}, a: {}, cname: {} };

function psResolveSRV(hostname) {
  if (cache.srv[hostname]) return cache.srv[hostname];
  try {
    const raw = execSync(
      `powershell -NoProfile -Command "Resolve-DnsName '${hostname}' -Type SRV -DnsOnly | Select-Object NameTarget,Port | ConvertTo-Json"`,
      { encoding: 'utf8', timeout: 10000 }
    );
    let records = JSON.parse(raw.trim());
    if (!Array.isArray(records)) records = [records];
    const result = records.map(r => ({
      name: r.NameTarget,
      port: r.Port,
      priority: r.Priority || 0,
      weight: r.Weight || 0
    }));
    cache.srv[hostname] = result;
    return result;
  } catch (e) {
    throw new Error(`SRV resolution failed for ${hostname}: ${e.message}`);
  }
}

function psResolveTXT(hostname) {
  if (cache.txt[hostname]) return cache.txt[hostname];
  try {
    const raw = execSync(
      `powershell -NoProfile -Command "Resolve-DnsName '${hostname}' -Type TXT -DnsOnly | Select-Object -ExpandProperty Strings | ConvertTo-Json"`,
      { encoding: 'utf8', timeout: 10000 }
    );
    let records = JSON.parse(raw.trim());
    if (!Array.isArray(records)) records = [records];
    cache.txt[hostname] = records;
    return records;
  } catch (e) {
    throw new Error(`TXT resolution failed for ${hostname}: ${e.message}`);
  }
}

function psResolveA(hostname) {
  if (cache.a[hostname]) return cache.a[hostname];
  try {
    const raw = execSync(
      `powershell -NoProfile -Command "Resolve-DnsName '${hostname}' -Type A -DnsOnly | Where-Object { $_.IPAddress } | Select-Object -ExpandProperty IPAddress | ConvertTo-Json"`,
      { encoding: 'utf8', timeout: 10000 }
    );
    let records = JSON.parse(raw.trim());
    if (!Array.isArray(records)) records = [records];
    cache.a[hostname] = records;
    return records;
  } catch (e) {
    return [];
  }
}

function psResolveCNAME(hostname) {
  try {
    const raw = execSync(
      `powershell -NoProfile -Command "Resolve-DnsName '${hostname}' -Type CNAME -DnsOnly | Select-Object NameHost | ConvertTo-Json"`,
      { encoding: 'utf8', timeout: 10000 }
    );
    let records = JSON.parse(raw.trim());
    if (!Array.isArray(records)) records = [records];
    return records.map(r => r.NameHost);
  } catch (e) {
    return [];
  }
}

// Monkey-patch dns.resolveSrv
const origResolveSrv = dns.resolveSrv;
dns.resolveSrv = function patchedResolveSrv(hostname, callback) {
  try {
    const records = psResolveSRV(hostname);
    callback(null, records);
  } catch (e) {
    callback(e);
  }
};

// Monkey-patch dns.resolveTxt
const origResolveTxt = dns.resolveTxt;
dns.resolveTxt = function patchedResolveTxt(hostname, callback) {
  try {
    const records = psResolveTXT(hostname);
    callback(null, records.map(r => [r]));
  } catch (e) {
    callback(e);
  }
};

// Monkey-patch dns.resolve4
const origResolve4 = dns.resolve4;
dns.resolve4 = function patchedResolve4(hostname, callback) {
  const records = psResolveA(hostname);
  if (records.length > 0) {
    callback(null, records);
  } else {
    origResolve4.call(dns, hostname, callback);
  }
};

// Monkey-patch dns.resolveCname
const origResolveCname = dns.resolveCname;
dns.resolveCname = function patchedResolveCname(hostname, callback) {
  const records = psResolveCNAME(hostname);
  if (records.length > 0) {
    callback(null, records);
  } else {
    origResolveCname.call(dns, hostname, callback);
  }
};

// Also patch dns/promises (used by MongoDB driver internally)
const dnsPromises = require('dns/promises');

dnsPromises.resolveSrv = async function patchedResolveSrvPS(hostname) {
  return psResolveSRV(hostname);
};

dnsPromises.resolveTxt = async function patchedResolveTxtPS(hostname) {
  const records = psResolveTXT(hostname);
  return records.map(r => [r]);
};

dnsPromises.resolve4 = async function patchedResolve4PS(hostname) {
  const records = psResolveA(hostname);
  if (records.length > 0) return records;
  return origResolve4.call(dns, hostname);
};

dnsPromises.resolveCname = async function patchedResolveCnamePS(hostname) {
  const records = psResolveCNAME(hostname);
  if (records.length > 0) return records;
  return origResolveCname.call(dns, hostname);
};

// Also patch the underlying Resolver class used by the driver
const origResolverProto = dnsPromises.Resolver.prototype;
if (!origResolverProto._patched) {
  const origResolverResolveSrv = origResolverProto.resolveSrv;
  origResolverProto.resolveSrv = function(hostname) {
    return psResolveSRV(hostname);
  };
  const origResolverResolveTxt = origResolverProto.resolveTxt;
  origResolverProto.resolveTxt = function(hostname) {
    const records = psResolveTXT(hostname);
    return records.map(r => [r]);
  };
  origResolverProto._patched = true;
}

console.log('[DNS-PATCH] PowerShell DNS resolver active - Node DNS bypass enabled');
module.exports = { enabled: true, cache, psResolveSRV, psResolveTXT, psResolveA };
