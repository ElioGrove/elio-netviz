# 静态部署

Netviz 是 React + Vite 单页应用，`npm run build` 生成的 `dist/` 可以直接作为静态网站发布。无需 Node.js 运行服务、数据库、Secret 或后端 API。Node.js 20 及以上用于构建。

```bash
npm ci
npm run build
```

当前 Vite `base` 为 `./`，资源路径相对入口文件，既支持域名根目录，也支持 `/apps/netviz/` 子目录。分享项目使用 URL hash，不依赖服务端路由。

## 建议：独立部署到 Cloudflare，在 elio-hub 添加入口

新建站点可使用 Cloudflare Workers Static Assets 托管 `dist/`，域名可选 `netviz.thus.chat`。独立仓库构建和发布，更新、回滚与 elio-hub 分开管理；elio-hub 只需添加应用入口。

也可使用 Cloudflare Pages：构建命令 `npm ci && npm run build`，输出目录 `dist`，生产分支选择实际发布分支。现有 elio-hub 已使用 Pages，无需为接入 Netviz 迁移主站。

构建产物全部是静态文件，Cloudflare 提供商特定配置不影响本地使用。

## 备选：托管到 elio-hub 的 apps 目录

将 `dist/` 的**内容**复制到 `elio-hub/apps/netviz/`，保留 `index.html`、`assets/`、favicon 等文件的相对目录。发布 elio-hub 后，访问：

```text
https://hub.thus.chat/apps/netviz/
```

使用带尾部 `/` 的地址，确保相对路径解析正确。无需把 React 源码或 node_modules 放进 elio-hub。以后每次更新 Netviz，重新构建并替换该目录中的完整产物，再发布 elio-hub。

这种方式适合低频更新，且希望少维护一个站点的情况；频繁迭代时推荐独立部署，避免手工同步构建文件。

## 数据与语言

- 简体中文为默认界面，可在「设置 → 通用 → 界面语言」切换到 English，选择保存在本机 localStorage。
- 项目保存在浏览器 IndexedDB，不会因部署到 Cloudflare 自动获得账号、云端保存或多端同步。
- 切换域名或浏览器后，本地存储相互独立；迁移项目请先导出 JSON，再在新地址导入。
- 分享链接在 URL 中携带压缩项目副本，接收者可以编辑，不是实时协作。

参考：[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)、[Pages 构建配置](https://developers.cloudflare.com/pages/configuration/build-configuration/)、[Vite 公共基础路径](https://vite.dev/guide/build.html#public-base-path)。
