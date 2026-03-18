# 企业管理系统前端

## 项目概述

基于原生 HTML、CSS、JavaScript 的企业管理系统前端项目，包含六个业务子系统。适合 4 人小团队协作开发。

---

## 目录结构

```
web/
├── index.html                    # 项目入口（重定向到登录页）
├── package.json                  # 项目配置
├── README.md                     # 项目文档
│
└── src/
    ├── assets/                   # 静态资源
    │   ├── css/                  # 样式文件
    │   │   ├── main.css          # 样式入口文件（@import 所有样式）
    │   │   ├── base/             # 基础样式
    │   │   │   ├── reset.css     # CSS 重置
    │   │   │   ├── variables.css # CSS 变量（颜色、字体、间距等）
    │   │   │   └── typography.css# 排版样式
    │   │   ├── components/       # 组件样式
    │   │   │   ├── header.css    # 顶部导航栏
    │   │   │   ├── sidebar.css   # 侧边栏
    │   │   │   ├── button.css    # 按钮组件
    │   │   │   ├── form.css      # 表单组件
    │   │   │   ├── table.css     # 表格组件
    │   │   │   ├── card.css      # 卡片组件
    │   │   │   └── modal.css     # 弹窗组件
    │   │   └── pages/            # 页面样式
    │   │       ├── login.css     # 登录页
    │   │       ├── production.css # 生产管理
    │   │       ├── sales.css     # 销售管理
    │   │       ├── equipment.css # 设备管理
    │   │       ├── purchase.css  # 采购管理
    │   │       ├── warehouse.css # 仓储管理
    │   │       └── employee.css  # 员工管理
    │   │
    │   ├── js/                   # JavaScript 文件
    │   │   ├── main.js           # JS 入口文件
    │   │   ├── utils/            # 工具函数
    │   │   │   ├── dom.js        # DOM 操作工具
    │   │   │   ├── storage.js    # 本地存储工具
    │   │   │   ├── format.js     # 数据格式化
    │   │   │   └── validate.js   # 表单验证
    │   │   └── modules/          # 业务模块
    │   │       ├── auth.js       # 登录认证
    │   │       ├── navigation.js # 导航切换
    │   │       ├── production.js # 生产管理
    │   │       ├── sales.js      # 销售管理
    │   │       ├── equipment.js  # 设备管理
    │   │       ├── purchase.js   # 采购管理
    │   │       ├── warehouse.js  # 仓储管理
    │   │       └── employee.js   # 员工管理
    │   │
    │   └── images/                # 图片资源（待创建）
    │
    ├── components/                # 公共 HTML 组件
    │   ├── header.html            # 顶部导航栏
    │   ├── sidebar.html           # 侧边栏菜单
    │   └── footer.html            # 页脚
    │
    ├── pages/                     # 页面文件
    │   ├── login.html             # 登录页
    │   ├── dashboard.html         # 仪表盘/首页
    │   │
    │   ├── production/            # 生产管理子系统
    │   │   ├── index.html         # 生产管理首页
    │   │   ├── plan.html          # 生产计划管理
    │   │   ├── scheduling.html    # 生产任务排产
    │   │   ├── material.html      # 物料需求计划
    │   │   ├── inventory.html     # 库存管理
    │   │   ├── order.html         # 生产订单管理
    │   │   └── quality.html       # 质量管理
    │   │
    │   ├── sales/                 # 销售管理子系统
    │   │   ├── index.html         # 销售管理首页
    │   │   ├── customer.html      # 客户信息管理
    │   │   ├── report.html        # 销售数据报表
    │   │   ├── order.html         # 销售订单管理
    │   │   ├── pricing.html       # 产品定价和促销
    │   │   └── team.html          # 销售团队管理
    │   │
    │   ├── equipment/             # 设备管理子系统
    │   │   ├── index.html         # 设备管理首页
    │   │   ├── monitor.html       # 设备状态监控
    │   │   ├── maintenance.html   # 设备维护计划
    │   │   ├── fault.html         # 设备故障记录
    │   │   └── info.html          # 设备信息管理
    │   │
    │   ├── purchase/              # 采购管理子系统
    │   │   ├── index.html         # 采购管理首页
    │   │   ├── supplier.html      # 供应商信息管理
    │   │   ├── process.html       # 采购流程管理
    │   │   ├── tracking.html      # 采购订单跟踪
    │   │   └── analysis.html      # 采购数据分析
    │   │
    │   ├── warehouse/             # 仓储管理子系统
    │   │   ├── index.html         # 仓储管理首页
    │   │   ├── operation.html     # 仓储基本操作
    │   │   ├── layout.html        # 仓库布局和货位
    │   │   ├── warning.html       # 库存预警和盘点
    │   │   └── transport.html     # 运输计划和跟踪
    │   │
    │   └── employee/              # 员工管理子系统
    │   │       ├── index.html         # 员工管理首页
    │   │       ├── info.html          # 员工信息管理
    │   │       ├── recruitment.html   # 招聘和培训管理
    │   │       ├── attendance.html    # 考勤和薪资管理
    │   │       └── performance.html   # 员工绩效评估
    │
    └── data/                      # 模拟数据
        ├── production.js          # 生产管理数据
        ├── sales.js               # 销售管理数据
        ├── equipment.js           # 设备管理数据
        ├── purchase.js            # 采购管理数据
        ├── warehouse.js           # 仓储管理数据
        └── employee.js            # 员工管理数据
```

---

## 团队分工建议

### 成员 A - 基础架构 & 公共组件
负责项目基础架构和公共组件开发。

**负责文件：**
| 文件 | 说明 |
|------|------|
| `src/assets/css/base/reset.css` | CSS 重置样式，统一浏览器默认样式 |
| `src/assets/css/base/variables.css` | CSS 变量定义（主色、辅色、字体、间距、阴影等） |
| `src/assets/css/base/typography.css` | 全局排版样式（标题、段落、列表） |
| `src/assets/css/main.css` | 样式入口文件，@import 所有样式模块 |
| `src/assets/js/main.js` | JS 入口文件，初始化应用 |
| `src/assets/js/utils/dom.js` | DOM 操作工具函数（选择器、事件绑定、元素创建） |
| `src/assets/js/utils/storage.js` | 本地存储工具（localStorage/sessionStorage 封装） |
| `src/assets/js/utils/format.js` | 数据格式化（日期、数字、金额格式化） |
| `src/assets/js/utils/validate.js` | 表单验证工具（必填、邮箱、手机号验证） |
| `src/components/header.html` | 顶部导航栏组件 |
| `src/components/sidebar.html` | 侧边栏菜单组件 |
| `src/components/footer.html` | 页脚组件 |
| `src/assets/css/components/header.css` | 顶部导航栏样式 |
| `src/assets/css/components/sidebar.css` | 侧边栏样式 |
| `src/assets/css/components/button.css` | 按钮组件样式（主要、次要、危险等状态） |
| `src/assets/css/components/form.css` | 表单组件样式（输入框、下拉框、复选框） |
| `src/assets/css/components/table.css` | 表格组件样式（斑马纹、悬停、排序图标） |
| `src/assets/css/components/card.css` | 卡片组件样式 |
| `src/assets/css/components/modal.css` | 弹窗组件样式（遮罩、动画、关闭按钮） |
| `src/assets/js/modules/auth.js` | 登录认证逻辑（表单验证、登录状态管理） |
| `src/assets/js/modules/navigation.js` | 导航切换逻辑（菜单点击、子系统集成） |
| `src/pages/login.html` | 登录页面 |
| `src/pages/dashboard.html` | 仪表盘/首页 |
| `src/assets/css/pages/login.css` | 登录页样式 |

---

### 成员 B - 生产管理 & 销售管理
负责生产管理和销售管理两个子系统。

**负责文件：**
| 文件 | 说明 |
|------|------|
| `src/pages/production/index.html` | 生产管理首页，展示子系统概览 |
| `src/pages/production/plan.html` | 生产计划管理页面（计划列表、新增、编辑） |
| `src/pages/production/scheduling.html` | 生产任务排产页面（甘特图、任务分配） |
| `src/pages/production/material.html` | 物料需求计划页面（物料清单、需求计算） |
| `src/pages/production/inventory.html` | 库存管理页面（库存查询、预警设置） |
| `src/pages/production/order.html` | 生产订单管理页面（订单列表、状态跟踪） |
| `src/pages/production/quality.html` | 质量管理页面（质检记录、合格率统计） |
| `src/assets/css/pages/production.css` | 生产管理所有页面样式 |
| `src/assets/js/modules/production.js` | 生产管理交互逻辑 |
| `src/data/production.js` | 生产管理模拟数据 |
| `src/pages/sales/index.html` | 销售管理首页 |
| `src/pages/sales/customer.html` | 客户信息管理页面（客户列表、详情、编辑） |
| `src/pages/sales/report.html` | 销售数据报表页面（图表展示、数据筛选） |
| `src/pages/sales/order.html` | 销售订单管理页面（订单流程、状态管理） |
| `src/pages/sales/pricing.html` | 产品定价和促销页面（价格管理、促销活动） |
| `src/pages/sales/team.html` | 销售团队管理页面（团队架构、任务分配） |
| `src/assets/css/pages/sales.css` | 销售管理所有页面样式 |
| `src/assets/js/modules/sales.js` | 销售管理交互逻辑 |
| `src/data/sales.js` | 销售管理模拟数据 |

---

### 成员 C - 设备管理 & 采购管理
负责设备管理和采购管理两个子系统。

**负责文件：**
| 文件 | 说明 |
|------|------|
| `src/pages/equipment/index.html` | 设备管理首页 |
| `src/pages/equipment/monitor.html` | 设备状态监控页面（实时状态、参数展示、告警提示） |
| `src/pages/equipment/maintenance.html` | 设备维护计划页面（维护周期、计划安排） |
| `src/pages/equipment/fault.html` | 设备故障记录页面（故障上报、处理流程、统计分析） |
| `src/pages/equipment/info.html` | 设备信息管理页面（设备档案、备件库存） |
| `src/assets/css/pages/equipment.css` | 设备管理所有页面样式 |
| `src/assets/js/modules/equipment.js` | 设备管理交互逻辑 |
| `src/data/equipment.js` | 设备管理模拟数据 |
| `src/pages/purchase/index.html` | 采购管理首页 |
| `src/pages/purchase/supplier.html` | 供应商信息管理页面（供应商档案、评估评级） |
| `src/pages/purchase/process.html` | 采购流程管理页面（询价、比价、审批流程） |
| `src/pages/purchase/tracking.html` | 采购订单跟踪页面（订单状态、物流信息） |
| `src/pages/purchase/analysis.html` | 采购数据分析页面（成本分析、供应商绩效） |
| `src/assets/css/pages/purchase.css` | 采购管理所有页面样式 |
| `src/assets/js/modules/purchase.js` | 采购管理交互逻辑 |
| `src/data/purchase.js` | 采购管理模拟数据 |

---

### 成员 D - 仓储管理 & 员工管理
负责仓储管理和员工管理两个子系统。

**负责文件：**
| 文件 | 说明 |
|------|------|
| `src/pages/warehouse/index.html` | 仓储管理首页 |
| `src/pages/warehouse/operation.html` | 仓储基本操作页面（入库、出库、调拨、退货） |
| `src/pages/warehouse/layout.html` | 仓库布局和货位页面（仓库可视化、货位管理） |
| `src/pages/warehouse/warning.html` | 库存预警和盘点页面（预警设置、盘点任务） |
| `src/pages/warehouse/transport.html` | 运输计划和跟踪页面（运输调度、路线规划） |
| `src/assets/css/pages/warehouse.css` | 仓储管理所有页面样式 |
| `src/assets/js/modules/warehouse.js` | 仓储管理交互逻辑 |
| `src/data/warehouse.js` | 仓储管理模拟数据 |
| `src/pages/employee/index.html` | 员工管理首页 |
| `src/pages/employee/info.html` | 员工信息管理页面（员工档案、入职离职） |
| `src/pages/employee/recruitment.html` | 招聘和培训页面（招聘流程、培训计划） |
| `src/pages/employee/attendance.html` | 考勤和薪资页面（考勤记录、薪资核算） |
| `src/pages/employee/performance.html` | 员工绩效评估页面（考核指标、评估结果） |
| `src/assets/css/pages/employee.css` | 员工管理所有页面样式 |
| `src/assets/js/modules/employee.js` | 员工管理交互逻辑 |
| `src/data/employee.js` | 员工管理模拟数据 |

---

## 文件内容规范

### CSS 文件

#### `src/assets/css/base/variables.css`
定义全局 CSS 变量，所有样式统一引用。
```css
/* 示例结构 */
:root {
  /* 主题色 */
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-danger: #f5222d;
  
  /* 文字颜色 */
  --color-text-primary: #333;
  --color-text-secondary: #666;
  --color-text-disabled: #ccc;
  
  /* 背景色 */
  --color-bg: #f5f5f5;
  --color-bg-white: #fff;
  
  /* 边框 */
  --border-color: #e8e8e8;
  --border-radius: 4px;
  
  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* 字体 */
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  
  /* 阴影 */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.12);
}
```

#### `src/assets/css/main.css`
样式入口文件，按顺序引入所有样式。
```css
/* 1. 基础样式 */
@import './base/reset.css';
@import './base/variables.css';
@import './base/typography.css';

/* 2. 组件样式 */
@import './components/header.css';
@import './components/sidebar.css';
@import './components/button.css';
@import './components/form.css';
@import './components/table.css';
@import './components/card.css';
@import './components/modal.css';

/* 3. 页面样式 */
@import './pages/login.css';
@import './pages/production.css';
@import './pages/sales.css';
@import './pages/equipment.css';
@import './pages/purchase.css';
@import './pages/warehouse.css';
@import './pages/employee.css';
```

---

### JavaScript 文件

#### `src/assets/js/utils/dom.js`
DOM 操作工具函数。
```javascript
/* 应包含的功能 */
// 选择器
function $(selector) {}
function $$(selector) {}

// 元素创建
function createElement(tag, className, innerHTML) {}

// 事件绑定
function on(element, event, handler) {}
function delegate(parent, selector, event, handler) {}

// 类名操作
function addClass(element, className) {}
function removeClass(element, className) {}
function hasClass(element, className) {}
function toggleClass(element, className) {}

// 显示隐藏
function show(element) {}
function hide(element) {}
function toggle(element) {}
```

#### `src/assets/js/utils/storage.js`
本地存储工具。
```javascript
/* 应包含的功能 */
const storage = {
  // localStorage
  set(key, value) {},
  get(key) {},
  remove(key) {},
  clear() {},
  
  // sessionStorage
  session: {
    set(key, value) {},
    get(key) {},
    remove(key) {},
    clear() {}
  }
};
```

#### `src/assets/js/utils/format.js`
数据格式化工具。
```javascript
/* 应包含的功能 */
// 日期格式化
function formatDate(date, pattern) {}

// 数字格式化
function formatNumber(num, decimals) {}

// 金额格式化
function formatMoney(amount, currency) {}

// 百分比格式化
function formatPercent(value) {}
```

#### `src/assets/js/utils/validate.js`
表单验证工具。
```javascript
/* 应包含的功能 */
const validators = {
  // 必填
  required(value, message) {},
  
  // 邮箱
  email(value, message) {},
  
  // 手机号
  phone(value, message) {},
  
  // 长度范围
  length(value, min, max, message) {},
  
  // 数字范围
  range(value, min, max, message) {}
};

// 验证表单
function validateForm(formData, rules) {}
```

#### `src/assets/js/main.js`
JS 入口文件。
```javascript
/* 应包含的功能 */
// 1. 导入所有模块
// 2. 初始化应用
// 3. 绑定全局事件
// 4. 启动路由
```

---

### 模拟数据文件

#### `src/data/production.js`
```javascript
/* 应包含的数据结构 */
const productionData = {
  // 生产计划列表
  plans: [
    { id, name, startDate, endDate, status, products: [] }
  ],
  
  // 生产任务
  tasks: [
    { id, planId, productName, quantity, progress, assignee, deadline }
  ],
  
  // 物料需求
  materials: [
    { id, name, spec, unit, required, stock, shortage }
  ],
  
  // 生产订单
  orders: [
    { id, customer, product, quantity, status, createDate, deliveryDate }
  ],
  
  // 质检记录
  qualityRecords: [
    { id, orderId, inspector, date, result, defects }
  ]
};
```

---

### HTML 页面模板

每个页面应包含：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题 - 企业管理系统</title>
  <!-- 引入主样式 -->
  <link rel="stylesheet" href="../../assets/css/main.css">
  <!-- 引入页面专属样式（如有） -->
</head>
<body>
  <!-- 引入公共组件 -->
  <!-- 页面内容 -->
  <!-- 引入JS文件 -->
  <script src="../../assets/js/main.js"></script>
  <script src="../../assets/js/modules/xxx.js"></script>
</body>
</html>
```

---

## 开发规范

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| CSS 类名 | 小写 + 连字符 | `.login-container`, `.btn-primary` |
| CSS 变量 | 小写 + 连字符 | `--color-primary`, `--font-size-base` |
| JS 变量 | 小驼峰 | `let userName = ''` |
| JS 常量 | 大写 + 下划线 | `const MAX_COUNT = 100` |
| JS 函数 | 小驼峰 | `function getUserInfo() {}` |
| HTML 文件 | 小写 + 连字符 | `user-info.html` |
| 图片文件 | 小写 + 连字符 | `logo-main.png` |

### CSS 编写规范

1. **使用 CSS 变量**：颜色、间距等统一使用 `variables.css` 中定义的变量
2. **避免深层嵌套**：选择器层级不超过 3 层
3. **移动端优先**：先写移动端样式，再用 `@media` 扩展桌面端

### JavaScript 编写规范

1. **使用严格模式**：文件顶部添加 `'use strict';`
2. **避免全局变量**：使用 IIFE 或模块模式
3. **添加注释**：函数说明、参数说明、关键逻辑注释
4. **错误处理**：try-catch 包裹可能出错的代码

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
style: 样式调整
refactor: 代码重构
docs: 文档更新
test: 测试相关
chore: 构建/工具变动
```

---

## 技术栈

- **HTML5**：语义化标签
- **CSS3**：Flexbox、Grid、CSS 变量、媒体查询
- **JavaScript**：ES6+ 语法
- **开发服务器**：http-server

---

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:8080`

---

## 协作流程

1. **拉取最新代码**
   ```bash
   git pull origin main
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/production-plan
   ```

3. **开发并提交**
   ```bash
   git add .
   git commit -m "feat: 完成生产计划管理页面"
   git push origin feature/production-plan
   ```

4. **创建 Pull Request**：在 GitHub/GitLab 上创建 PR，等待代码审查

5. **合并代码**：审查通过后合并到 main 分支

---

## 注意事项

1. 所有样式必须使用 CSS 变量，禁止硬编码颜色值
2. 所有页面必须引入 `main.css`，禁止单独引入组件样式
3. 模拟数据使用 JS 对象定义，导出后供模块使用
4. 修改公共组件需通知所有成员
5. 提交前确保代码无语法错误
