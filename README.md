# studentmap · 学生端

面向地图学课程的学生端 Web 应用：

1. **地图投影智能推荐** — 输入区域范围与地图用途，规则引擎 + 通用大模型双通道给出投影推荐；
2. **地图符号设计** — iconfont AI 获取基础素材 → Illustrator 专业设计 → 本应用规范化校验入库。

## 规格说明

需求、功能规格与架构图都在 **[spec/](spec/README.md)** 子文件夹中，先读 spec 再动代码。

## 技术文档

投影推荐规则、有效参数、d3 预览与图面整饰、符号校验、云端同步、验证结果与部署排错，汇总在单文件技术文档中（公式已预渲染，离线可读）：

- 源文件：`docs/parts/` + `docs/doc.css`
- 生成：`node docs/gen-doc.mjs`
- 产物：`public/docs/studentmap-technical.html`，部署后访问 `https://hqj00.github.io/studentmap/docs/studentmap-technical.html`

## 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 启动前端（http://localhost:5173）

# 可选：启用大模型增强推荐
copy .env.example .env   # 填入 LLM_API_KEY / LLM_BASE_URL / LLM_MODEL
npm run server           # 启动 AI 代理（http://localhost:8787）
```

不启动 AI 代理也能正常使用：投影推荐自动走内置规则引擎，符号功能完全本地运行。

## 部署上线（面向所有学生）

零成本方案：**GitHub Pages**（免费送子域名，无需买域名/备案）。

```bash
git init && git add -A && git commit -m "init"           # 首次
git remote add origin https://github.com/<用户名>/studentmap.git
git push -u origin main
npm run deploy                                            # 构建并发布到 gh-pages 分支
```

仓库 Settings → Pages → Source 选 `gh-pages`，几分钟后访问
`https://<用户名>.github.io/studentmap/`。

已做的部署就绪改造：hash 路由（任何静态托管无需回退配置）、资源相对路径（子路径可访问）、
AI 地址走 `VITE_AI_BASE_URL` 环境变量（不配则自动降级规则引擎）。详见 [spec/04 §7](spec/04-架构设计.md)。

## 目录结构

见 [spec/04-架构设计.md](spec/04-架构设计.md) §3。
