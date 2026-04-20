# 企业管理系统前端

## 项目概述

这是一个基于原生 HTML、CSS、JavaScript 的企业管理系统前端项目。项目采用静态多页面架构，包含前台展示页、登录/注册、后台仪表盘，以及生产、销售、设备、采购、仓储、员工六个业务子系统。

当前版本不依赖后端服务，业务数据通过 `src/data/*.js` 初始化，并由 `localStorage` 在浏览器中保存，适合课程展示、原型演示和前端结构学习。

---

## 当前能力

- 前台落地页：产品展示、创始团队、合作伙伴、技术展示等内容。
- 用户入口：登录页、注册页和登录态校验。
- 后台首页：仪表盘与公共后台框架。
- 六个业务域：生产管理、销售管理、设备管理、采购管理、仓储管理、员工管理。
- 无后端业务闭环：种子数据初始化、本地状态保存、刷新后恢复。
- 响应式适配：移动端侧边栏、遮罩关闭、表格卡片化和工具栏适配。
- 工程化启动：通过 npm 启动本地静态服务器。
- 静态部署配置：提供 Cloudflare Pages 所需的 `wrangler.toml`。

---

## 目录结构

```text
web/
├── index.html                 # 项目入口，重定向到前台落地页
├── package.json               # npm 脚本与依赖配置
├── package-lock.json          # 依赖锁定文件
├── start.js                   # 自动查找可用端口并启动本地服务器
├── wrangler.toml              # Cloudflare Pages 配置
├── README.md                  # 项目说明
├── docs/                      # 项目文档
│   ├── DEV_STANDARDS.md       # 开发规范
│   ├── CSS_JS_SPEC.md         # CSS/JS 文件内容规范
│   ├── JS_ARCHITECTURE.md     # JavaScript 架构说明
│   ├── COMPLETE_GUIDE.md      # 完整学习指南
│   └── guide/                 # 分章节学习文档
│
└── src/
    ├── assets/
    │   ├── css/
    │   │   ├── main.css       # 样式入口，通过 @import 汇总全局样式
    │   │   ├── base/          # 变量、重置、排版、动画
    │   │   ├── components/    # 按钮、表格、表单、侧边栏等组件样式
    │   │   └── pages/         # 各页面/业务域样式
    │   │
    │   ├── js/
    │   │   ├── main.js        # JS 启动编排入口
    │   │   ├── core/          # 路由、鉴权、公共组件加载、导航、业务脚本加载
    │   │   ├── pages/         # landing、login、register、dashboard 页面控制器
    │   │   ├── shared/        # 跨业务域状态与视图工具
    │   │   ├── systems/       # 六个业务域真实实现
    │   │   └── utils/         # DOM、存储、格式化、校验等基础工具
    │   │
    │   └── images/            # Logo、首页图片、合作伙伴图标等静态资源
    │
    ├── components/            # header、sidebar、footer 公共 HTML 组件
    │
    ├── data/                  # 六个业务域的模拟数据种子
    │
    └── pages/
        ├── landing.html       # 前台落地页
        ├── login.html         # 登录页
        ├── register.html      # 注册页
        ├── dashboard.html     # 后台仪表盘
        ├── production/        # 生产管理页面
        ├── sales/             # 销售管理页面
        ├── equipment/         # 设备管理页面
        ├── purchase/          # 采购管理页面
        ├── warehouse/         # 仓储管理页面
        └── employee/          # 员工管理页面
```

---

## 技术栈

- **HTML5**：静态多页面结构，语义化标签。
- **CSS3**：CSS 变量、Flexbox、Grid、媒体查询和响应式布局。
- **JavaScript ES6+**：经典脚本模式，不使用打包器和模块化编译。
- **本地服务器**：`http-server`。
- **部署目标**：Cloudflare Pages 静态站点。

---

## JavaScript 架构

项目没有使用大型前端框架，而是通过统一运行时组织静态多页面：

- `main.js`：启动编排入口，负责初始化运行时，不承载具体业务逻辑。
- `core/router.js`：识别当前页面所属模块、资源根路径和页面类型。
- `core/shell.js`：动态加载 header、sidebar、footer 等公共组件。
- `core/module-loader.js`：按顺序加载 `shared`、`data` 和当前业务域 `systems` 脚本。
- `core/auth.js`：维护登录态和页面访问守卫。
- `shared/state.js`：封装无后端状态容器，将业务数据保存到 `localStorage`。
- `shared/view.js`：封装统计卡片、表格空状态、关键词过滤、确认删除、表单采集等视图工具。
- `systems/<domain>/store.js`：维护单个业务域的本地状态。
- `systems/<domain>/actions.js`：封装新增、删除、状态变更等业务写操作。
- `systems/<domain>/renderers.js`：维护状态徽章、统计字段和展示映射。
- `systems/<domain>/pages.js`：绑定具体页面事件并刷新 DOM。

业务系统统一暴露为 `window.productionSystem`、`window.salesSystem` 等 `window.xxxSystem` 全局对象，由 `core/module-loader.js` 直接调用 `init()`。

> 历史 `src/assets/js/modules/` 兼容门面已经废弃。新增业务逻辑请直接放入 `systems/<domain>/`。

---

## 数据与状态

项目当前没有后端服务，业务演示流程在浏览器内完成：

- `src/data/*.js` 提供六个业务子系统的初始种子数据。
- `src/assets/js/shared/state.js` 负责从种子数据初始化业务状态。
- 业务数据写入 `localStorage`，页面刷新后优先读取本地状态。
- 登录态写入 `sessionStorage`，由 `core/auth.js` 维护。
- 如需恢复初始演示数据，可在浏览器开发者工具中清空当前站点的 `localStorage` 和 `sessionStorage`。

---

## 快速开始

> 本项目源码位于 `web/` 子目录，请先进入该目录执行命令。

### 1. 进入项目目录

```bash
cd web
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

推荐使用自动端口模式：

```bash
npm run dev
```

`npm run dev` 会从 `3000` 开始查找可用端口，并在终端输出实际访问地址，例如：

```text
http://localhost:3000
```

如果需要固定使用 `8080` 端口，可以运行：

```bash
npm start
```

然后访问：

```text
http://localhost:8080
```

---

## 提交前检查

```powershell
Get-ChildItem src/assets/js,src/data -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
git diff --check
rg "export |import " src/assets/js
```

检查目标：

- 所有 JS 文件通过 `node --check` 语法检查。
- 经典 `<script>` 架构中不出现 `export/import`。
- 提交内容不包含 `node_modules/`、临时审计目录、IDE 配置或压缩包。
- `src/assets/js/modules/` 不应重新出现。
- 修改公共组件后，同步检查 header、sidebar、footer 的加载路径。

---

## 开发约定

1. 所有页面统一引入 `src/assets/css/main.css`，不要单独绕开样式入口。
2. 公共颜色、间距、字体等样式优先使用 `base/variables.css` 中的 CSS 变量。
3. 新增后台页面按现有页面模板引入 `main.js`，公共组件由 `core/shell.js` 自动装配。
4. 新增业务域时按 `store/actions/renderers/pages` 拆分职责。
5. 业务数据优先放入 `src/data/<domain>.js`，由 `shared/state.js` 接入。
6. 页面级交互放入 `src/assets/js/pages/`，业务域交互放入 `src/assets/js/systems/<domain>/`。
7. 修改动态加载链路时，同步检查 `core/router.js` 和 `core/module-loader.js`。

---

## 更多文档

- [开发规范](docs/DEV_STANDARDS.md)
- [文件内容规范](docs/CSS_JS_SPEC.md)
- [JavaScript 架构说明](docs/JS_ARCHITECTURE.md)
- [完整学习指南](docs/COMPLETE_GUIDE.md)
- [Git 命令大全](docs/GIT_GUIDE.md)
- [整体分析报告与 4 人团队开发策略](docs/ARCHITECTURE_TEAM_STRATEGY.md)
- [分章节学习文档](docs/guide/README.md)

---

## 更新日志

### 2026-04 - 完整后台页面、数据闭环与文档同步

- 补齐登录、注册、仪表盘和六个业务域后台页面。
- 新增 `src/data/*.js`，支持无后端业务演示。
- 使用 `shared/state.js` 和 `shared/view.js` 统一跨业务域状态与视图工具。
- 统一业务系统入口为 `window.xxxSystem`，废弃历史 `modules/` 兼容门面。
- 增加 npm 本地启动脚本和 Cloudflare Pages 配置。
- 修正 README 中过期的目录结构与端口说明。

### 2026-03 - 移动端响应式适配

- 新增汉堡菜单按钮，支持移动端侧边栏切换。
- 新增 `mobile-nav.js`，处理侧边栏抽屉、遮罩和 ESC 关闭交互。
- 表格支持移动端卡片视图。
- 工具栏、搜索框、统计卡片等后台元素适配移动端布局。
- Logo 尺寸和后台导航体验优化。
