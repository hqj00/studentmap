# 学生端 · 地图投影与地图符号设计 — 规格说明（Spec）

> 项目代号：**studentmap**。本文档目录是学生端的规格说明书（spec）集合，
> 按「需求 → 功能 → 架构」的阅读顺序组织，架构图与流程图源文件见 [diagrams/](diagrams/)。

## 一、项目概述

面向地图学课程的学生端 Web 应用，包含两大核心功能：

| # | 功能 | 一句话说明 |
|---|------|-----------|
| 1 | **地图投影智能推荐** | 在通用大模型辅助下，学生输入**区域范围**与**地图用途**，系统给出投影方案推荐（含投影参数、变形性质、推荐理由），并支持投影预览 |
| 2 | **地图符号设计** | 以 **iconfont 网站 AI** 生成基础地图符号素材，导入 **Adobe Illustrator** 进行专业化设计，再导回本应用完成规范化校验、入库与配图应用 |

## 二、文档导航

| 文档 | 内容 | 读者 |
|------|------|------|
| [01-需求规格说明书.md](01-需求规格说明书.md) | 项目背景、用户角色、功能性/非功能性需求、验收标准 | 全体 |
| [02-功能规格-地图投影智能推荐.md](02-功能规格-地图投影智能推荐.md) | 投影推荐的输入输出、规则引擎、大模型接入、预览方案、用例 | 开发/测试 |
| [03-功能规格-地图符号设计.md](03-功能规格-地图符号设计.md) | 符号设计五步法工作流、SVG 入库规范、符号库结构、用例 | 开发/测试 |
| [05-功能规格-智能符号设计.md](05-功能规格-智能符号设计.md) | 智能符号设计（描述→搜索→直接入库）、数据源决策（Iconify / iconfont）、用例 | 开发/测试 |
| [04-架构设计.md](04-架构设计.md) | 总体架构、技术选型、模块设计、数据流、部署与演进 | 开发 |

## 三、图件清单（diagrams/）

| 图 | 源文件 | 渲染产物 |
|----|------|------|
| 系统架构图 | [diagrams/system-architecture.mmd](diagrams/system-architecture.mmd) | [SVG](diagrams/system-architecture.svg) |
| 投影推荐流程图 | [diagrams/projection-recommend-flow.mmd](diagrams/projection-recommend-flow.mmd) | [SVG](diagrams/projection-recommend-flow.svg) |
| 符号设计流程图 | [diagrams/symbol-design-flow.mmd](diagrams/symbol-design-flow.mmd) | [SVG](diagrams/symbol-design-flow.svg) |

图件使用 [Mermaid](https://mermaid.js.org/) 编写，GitHub / VS Code（装 Mermaid 插件）/ Typora 可直接渲染 `.mmd`；
本机已用本地 Edge 渲染导出 SVG。修改图后重新导出（避免重复下载 Chromium，使用 puppeteer 配置指向 Edge）：

```bash
set PUPPETEER_SKIP_DOWNLOAD=1
npx @mermaid-js/mermaid-cli -p spec/diagrams/puppeteer-config.json -i spec/diagrams/<图名>.mmd -o spec/diagrams/<图名>.svg -b white
```

## 四、术语表

| 术语 | 含义 |
|------|------|
| 地图投影 | 将地球椭球面经纬度坐标转换到平面的数学方法 |
| 等角投影（正形） | 保持角度与局部形状不变，如墨卡托、兰伯特等角圆锥 |
| 等积投影 | 保持面积比例不变，如阿尔伯斯等积圆锥、摩尔魏特 |
| 等距投影 | 沿特定方向保持距离不变，如方位等距、等距圆柱 |
| 中央经线 / 标准纬线 | 投影的关键参数，决定变形最小的位置 |
| 高斯-克吕格投影 | 横轴等角切椭圆柱投影，我国大比例尺地形图标准投影 |
| 视觉变量 | 符号设计的六个基本量：形状、尺寸、方向、色相、明度、密度（纹理） |
| 点状/线状/面状符号 | 地图符号按几何形态的三大分类 |
| GB/T 20257 | 《国家基本比例尺地形图图式》系列国家标准 |

## 五、规格变更约定

- 任何功能变更先改 spec 再改代码；spec 与实现不一致时以最新评审后的 spec 为准。
- 图件修改只改 `.mmd` 源文件并重新导出，不手改图片。
