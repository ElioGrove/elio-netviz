# Cloudflare 部署

生产地址：<https://netvix.thus.chat/>（域名按用户指定使用 `netvix`）。

- Cloudflare 账号：Elio
- Worker：`elio-netviz`
- 仓库：`ElioGrove/elio-netviz`
- 生产分支：`main`
- 架构：Workers Static Assets，静态文件来自 `dist/`
- 配置文件：仓库根目录 `wrangler.jsonc`

## Git 自动部署配置

在 Worker 的 Settings → Build 中连接 GitHub 仓库，使用以下配置：

| 配置 | 值 |
| --- | --- |
| Git 仓库 | `ElioGrove/elio-netviz` |
| 生产分支 | `main` |
| 根目录 | `/` |
| 构建命令 | `npm test && npm run build` |
| 部署命令 | `npm run deploy` |
| 构建环境变量 | `NODE_VERSION=22` |

Cloudflare 构建环境自动安装依赖，使用提交的 `package-lock.json`。项目固定 Wrangler 版本，部署命令使用本地依赖。`wrangler.jsonc` 中的自定义域名会随部署保持一致。

完成连接后，推送 `main` 会触发构建；测试或构建失败时，不会执行部署，线上继续使用上一版本。生产部署完成后，在 Deployments 中核对提交 SHA，并访问生产域名验证。Cloudflare 原生 Git 集成不需要向 GitHub 仓库添加 Cloudflare API Token。

## 本地验证与手动部署

需要 Node.js 22 或更新版本；构建工具使用 npm。

```bash
npm ci
npm test
npm run build
npm run deploy:check
```

`deploy:check` 只检查打包，不发布。必要时使用已登录目标账号的 Wrangler 手动发布：

```bash
npx wrangler whoami
npm run deploy
```

自定义域名的 DNS 和证书由 Cloudflare Workers 管理。应用无需运行时 Secret、数据库或后端服务。纯静态请求由 Static Assets 提供；配置同时为将来可能加入的 Worker 逻辑启用日志和 traces。

## 备选：elio-hub 子目录

当前 Vite `base` 为 `./`，构建文件也支持托管到 `/apps/netviz/`。如以后改用 elio-hub 托管，将 `dist/` 的完整内容复制到 `elio-hub/apps/netviz/`，保留 `index.html`、`assets/` 和 favicon 的相对目录，访问地址使用尾部 `/`。

当前采用独立部署，更新和回滚与 elio-hub 分开管理。

## 数据与语言

- 默认简体中文，可在「设置 → 通用 → 界面语言」切换 English，语言保存在本机 localStorage。
- 项目保存在浏览器 IndexedDB，部署到 Cloudflare 不会自动获得云端保存或多端同步。
- 不同域名和浏览器的本地存储相互独立；迁移项目请先导出 JSON，再在新地址导入。
- 分享链接携带压缩项目副本，接收者可以编辑，不提供实时协作。

参考：[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)、[Workers Builds 配置](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)、[自定义域名](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)。
