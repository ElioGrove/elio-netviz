# Netviz

Netviz is a browser-based app for designing and animating network architectures visually.

Add components like servers, proxies, and databases to a canvas, connect them to map data flow, then build animated request paths for presentations and recordings.

<img src="/.github/screenshot.png" alt="Netviz animation editor showing a load-balanced request flow"/>

> [!IMPORTANT]  
> This project was entirely created using AI, but the application has been thoroughly tested.
> 
> This project was built primarily for my personal use, so I will not be merging pull requests or adding new features unless I need them myself. If you want to make changes or add features, feel free to fork this repository.

## Features

- Drag and drop blocks or insert production templates
- Connect blocks with edges
- Build and tune custom request-flow animations
- Preview animations with optional camera follow
- Inspector panel to edit selected items
- Custom blocks with your own icons
- Duplicate blocks
- Undo and redo
- Simplified Chinese by default, with English available in Settings → General → Interface language
- Dark and light theme
- Export to image
- Local save with IndexedDB, no server needed

## 中文与部署

默认使用简体中文，可在「设置 → 通用 → 界面语言」切换到 English；语言偏好自动保存在本机，项目内容不会随语言切换改写。

使用 npm 安装和构建：

```bash
npm ci
npm run dev
# Production output: dist/
npm run build
```

线上地址：[netvix.thus.chat](https://netvix.thus.chat/)。使用 Cloudflare Workers Static Assets 托管，生产分支为 `main`。详细配置见 [部署说明](docs/deployment.md)。

## Requirements

- Node.js 22 or newer
- npm (use the committed `package-lock.json`)

## Local development

Install dependencies:

```bash
npm ci
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:8888 in your browser.

## Build

Create a production build in `dist/`:

```bash
npm run build
```

Preview the build locally:

```bash
npm run preview
```

## Deploy

### Option 1: Any static host
1. Run `npm run build`
2. The `dist/` folder is a plain static site. Upload it to any static host, that's it.

### Option 2: Coolify
1. Add a new resource in Coolify → "Docker Compose Empty."
2. Paste the contents of the `coolify.yaml` from the repo into the input field.
3. Click "Deploy!"

## License

MIT. See [LICENSE](./LICENSE).
