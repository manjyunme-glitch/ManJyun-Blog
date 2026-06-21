# ManJyun Blog

ManJyun Blog is a self-hosted single-author blog for Markdown writing, media-heavy long-form posts, and NAS-friendly Docker deployment.

## Local Development

```powershell
npm install
npm run dev
```

Open `http://localhost:4482`. The first visit to `/admin` redirects to the installation wizard.

## Docker

On this Windows host, use the real Docker CLI:

```powershell
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose up --build
```

The production container stores all runtime data under `/app/data`. On QNAP/Portainer the compose file maps it to:

```text
/share/DockerData/ManJyun-Blog
```

## Admin Features

- First-run admin setup with password and TOTP 2FA.
- Draft, published, and scheduled posts.
- Markdown editor with Ghost-inspired cards for images, galleries, audio, video, bookmarks, HTML, code, and Markdown sections.
- Media library stored on disk.
- Theme switching between installed code themes.
- Read-only GitHub update check.

