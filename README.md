# 陇韵匠心 · 云游甘肃

甘肃省文旅数字服务平台，集**非遗文化展示、景点导览、美食推荐、文创电商、旅游攻略**于一体，助力地方文旅资源的数字化传播与产业化变现。

🌐 **线上地址**：https://gansu-culture.xyz

## 项目构成

| 端 | 技术栈 | 说明 |
|----|--------|------|
| 微信小程序 | uni-app（Vue 3 + UTS） | 23 个页面，HBuilderX 编译 |
| Web 网站 | Vue 3 + Vite + vue-router | SPA（Hash 路由） |
| 管理后台 | 原生 HTML / CSS / JS | 内容运营 + 订单管理 |
| 后端服务 | Node.js + Express + MongoDB | RESTful API，18 个路由模块、14 个数据模型 |

## 核心功能

- **内容浏览**：景点 / 非遗 / 美食 / 文创 / 攻略 五大板块
- **地图导览**：甘肃全景地图 + 城市资源列表
- **全局搜索**：跨类别关键词检索
- **收藏管理**：景点 / 非遗 / 美食 / 攻略 一键收藏
- **文创商城**：在线下单 + 微信支付 + 订单管理
- **管理后台**：内容 CRUD、订单管理、用户管理、站点设置

## 数据模型

14 个数据模型：Spot（景点）、Culture（非遗）、Food（美食）、Product（文创）、Guide（攻略）、Event（活动）、Banner（轮播图）、City（城市）、QuickEntry（快捷入口）、Order（订单）、Favorite（收藏）、User（用户）、Admin（管理员）、Setting（站点设置）。

资源 ID 分段约定：1–99 非遗、100–199 景点、200–299 美食、300–399 文创、400+ 攻略。

## 目录结构

```
├── gansu-backend/     # 后端（Express + Mongoose）
│   ├── routes/        # 18 个路由模块
│   ├── models/        # 14 个数据模型
│   ├── middleware/    # JWT 认证中间件
│   ├── config/        # jwt / db / qiniu 配置
│   └── admin/         # 管理后台静态页面
├── gansu-web/         # Web 前端（Vue 3 + Vite）
│   └── src/           # 10 个页面 + 11 个组件
├── uni app/非遗 支付宝云/   # 微信小程序（uni-app）
│   ├── pages/         # 23 个页面（.uvue）
│   ├── utils/         # API 客户端、身份模块
│   └── static/        # 图标 / 地图 / logo
└── 项目交接文档.md     # 项目交接说明
```

## 快速开始

### 后端

```bash
cd gansu-backend
npm install
cp .env.example .env   # 按需配置环境变量
npm start
```

### Web 前端

```bash
cd gansu-web
npm install
npm run dev
```

### 微信小程序

使用 HBuilderX 打开 `uni app/非遗 支付宝云/`，配置 AppID 后编译运行。

## 安全说明

- `.env`、商户证书（`*.pem` / `*.p12`）等敏感文件**不纳入版本库**，已在 `.gitignore` 中排除。
- 提交的代码中，密钥、客服联系方式等敏感信息均已替换为占位符。
