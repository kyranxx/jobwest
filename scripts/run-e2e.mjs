import { spawn } from "node:child_process";
import net from "node:net";
import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const isWindows = process.platform === "win32";
const baseUrl = process.env.CYPRESS_BASE_URL || await getAvailableBaseUrl();
const parsedBaseUrl = new URL(baseUrl);
const appHost = parsedBaseUrl.hostname;
const appPort = parsedBaseUrl.port || (parsedBaseUrl.protocol === "https:" ? "443" : "80");
const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const cypressBin = fileURLToPath(new URL("../node_modules/cypress/bin/cypress", import.meta.url));
const cypressArgs = [cypressBin, "run", "--config", `baseUrl=${baseUrl}`, ...process.argv.slice(2)];
const nextDistDir = ".next";
const typeCacheFiles = [".tsbuildinfo", "tsconfig.tsbuildinfo"];
const e2eEnv = { ...process.env, VERCEL_ENV: "preview", JOBWEST_ALLOW_DEMO_JOBS: "1" };

async function isPortAvailable(host, port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.listen(Number(port), host, () => {
      server.close(() => resolve(true));
    });
  });
}

async function tcpServerResponds(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port: Number(port) });

    socket.setTimeout(2000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function getAvailableBaseUrl() {
  const host = "127.0.0.1";

  for (let port = 3100; port <= 3110; port += 1) {
    if (await isPortAvailable(host, port)) {
      return `http://${host}:${port}`;
    }
  }

  throw new Error("Could not find an available local port for Cypress between 3100 and 3110");
}

async function serverResponds(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (response.status >= 500) return false;

    const html = await response.text();
    return html.includes("JobWest") || html.includes('data-cy="job-portal"');
  } catch {
    return false;
  }
}

async function serverIsReady(url) {
  const parsedUrl = new URL(url);
  const host = parsedUrl.hostname;
  const port = parsedUrl.port || (parsedUrl.protocol === "https:" ? "443" : "80");

  return (await tcpServerResponds(host, port)) && (await serverResponds(url));
}

async function waitForServer(url, timeoutMs = 60000) {
  const startedAt = Date.now();
  let successfulChecks = 0;
  const requiredSuccessfulChecks = 5;

  while (Date.now() - startedAt < timeoutMs) {
    if (await serverIsReady(url)) {
      successfulChecks += 1;
      if (successfulChecks >= requiredSuccessfulChecks) return;
    } else {
      successfulChecks = 0;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      ...options,
    });

    child.on("exit", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

async function stopProcessTree(child) {
  if (!child || child.exitCode !== null) return;

  if (isWindows) {
    await run("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    return;
  }

  child.kill("SIGTERM");
}

let appServer;
const hadServer = await serverResponds(baseUrl);

try {
  if (!hadServer) {
    await rm(nextDistDir, { recursive: true, force: true });
    await Promise.all(typeCacheFiles.map((file) => rm(file, { force: true })));

    const buildExitCode = await run(process.execPath, [nextBin, "build"], {
      env: e2eEnv,
    });

    if (buildExitCode !== 0) {
      throw new Error("Next production build failed before Cypress run");
    }

    appServer = spawn(process.execPath, [nextBin, "start", "-H", appHost, "-p", appPort], {
      stdio: "inherit",
      shell: false,
      env: { ...e2eEnv, HOSTNAME: appHost, PORT: appPort },
    });
  }

  await waitForServer(baseUrl);
  const exitCode = await run(process.execPath, cypressArgs, {
    env: { ...e2eEnv, CYPRESS_BASE_URL: baseUrl },
  });
  process.exitCode = exitCode;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await stopProcessTree(appServer);
}
