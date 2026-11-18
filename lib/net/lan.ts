import os from "node:os";

function addressFamily(family: string | number) {
  return family === "IPv4" || family === 4;
}

function lanRank(ip: string) {
  if (ip.startsWith("192.168.")) {
    return 0;
  }
  if (ip.startsWith("10.")) {
    return 1;
  }
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) {
    return 2;
  }
  return 3;
}

export function lanIPv4Addresses() {
  let interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]> | undefined;
  try {
    interfaces = os.networkInterfaces();
  } catch {
    return [];
  }
  const ips: string[] = [];
  for (const addrs of Object.values(interfaces)) {
    for (const addr of addrs ?? []) {
      if (addressFamily(addr.family) && !addr.internal) {
        ips.push(addr.address);
      }
    }
  }
  return ips.sort((left, right) => lanRank(left) - lanRank(right));
}

export function crowdFacingHost(
  hostHeader: string,
  lanIps = lanIPv4Addresses(),
) {
  const lastColon = hostHeader.lastIndexOf(":");
  const hostname =
    lastColon === -1 ? hostHeader : hostHeader.slice(0, lastColon);
  const port = lastColon === -1 ? undefined : hostHeader.slice(lastColon + 1);
  const isLoopback = hostname === "localhost" || hostname === "127.0.0.1";
  if (!isLoopback || lanIps.length === 0) {
    return hostHeader;
  }
  const lan = lanIps[0];
  return port ? `${lan}:${port}` : lan;
}

export function allowedDevHosts() {
  const extra = (process.env.ALLOWED_DEV_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return ["localhost", "127.0.0.1", ...lanIPv4Addresses(), ...extra];
}
