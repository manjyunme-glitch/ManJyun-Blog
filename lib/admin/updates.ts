import { execSync } from "node:child_process";
import packageJson from "@/package.json";

export type UpdateStatus = {
  owner: string;
  repo: string;
  currentVersion: string;
  currentCommit: string;
  latestRelease?: {
    tag: string;
    name: string;
    url: string;
    publishedAt: string;
  };
  latestCommit?: {
    sha: string;
    url: string;
    message: string;
    date: string;
  };
  checkedAt: string;
  ok: boolean;
  message: string;
};

export async function checkGithubUpdates(): Promise<UpdateStatus> {
  const owner = process.env.GITHUB_OWNER || "manjyunme-glitch";
  const repo = process.env.GITHUB_REPO || "ManJyun-Blog";
  const checkedAt = new Date().toISOString();
  const currentVersion = packageJson.version;
  const currentCommit = process.env.GIT_COMMIT || readLocalCommit();
  const base: UpdateStatus = {
    owner,
    repo,
    currentVersion,
    currentCommit,
    checkedAt,
    ok: false,
    message: "尚未检查"
  };

  try {
    const [release, commit] = await Promise.all([
      githubFetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`),
      githubFetch(`https://api.github.com/repos/${owner}/${repo}/commits/main`)
    ]);

    return {
      ...base,
      latestRelease: release?.tag_name
        ? {
            tag: release.tag_name,
            name: release.name || release.tag_name,
            url: release.html_url,
            publishedAt: release.published_at
          }
        : undefined,
      latestCommit: commit?.sha
        ? {
            sha: commit.sha,
            url: commit.html_url,
            message: commit.commit?.message || "",
            date: commit.commit?.committer?.date || ""
          }
        : undefined,
      ok: true,
      message: "GitHub 更新检查完成。容器不会自动更新，请在 Portainer 中拉取并重新部署。"
    };
  } catch (error) {
    return {
      ...base,
      ok: false,
      message: error instanceof Error ? error.message : "GitHub 更新检查失败"
    };
  }
}

async function githubFetch(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "ManJyun-Blog"
      },
      cache: "no-store"
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}: ${response.statusText}`);
    }
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

function readLocalCommit() {
  try {
    return execSync("git rev-parse --short HEAD", {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8"
    }).trim();
  } catch {
    return "unknown";
  }
}

