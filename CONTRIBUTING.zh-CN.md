# 参与贡献

[English](./CONTRIBUTING.md) | **简体中文**

感谢你帮助改进 Qn Chrome Tabs。

## 开始之前

- 新建 Issue 前先搜索是否已有相同问题。
- 可复现的缺陷使用 Bug 报告表单；新行为建议使用功能建议表单。
- 每个 Issue 或 Pull Request 只聚焦一项改动。
- 不要通过公开 Issue 报告安全漏洞，请遵循[安全策略](./SECURITY.zh-CN.md)。

## 本地开发

环境要求：

- 当前 Vite 版本支持的 Node.js
- npm
- 仅在开发文档站时需要 Bun

安装依赖并启动交互式 Demo：

```bash
npm install
npm run dev
```

组件源码位于 `src/`，交互式 Demo 位于 `demo/`。

## 验证改动

执行组件构建：

```bash
npm run build
```

涉及视觉或交互的改动还需要在交互式 Demo 中验证相关行为。仓库目前没有自动化
测试套件，因此请在 Pull Request 中说明完成了哪些手动检查。

修改文档站后执行：

```bash
cd docs
bun install
bun run build
```

## Pull Request

请在 Pull Request 描述中：

- 说明问题和采用的解决方案。
- 如果存在相关 Issue，请添加链接。
- 列出验证命令和手动验证场景。
- 视觉改动需提供修改前后的截图或简短录屏。

除非 Pull Request 专门用于准备版本发布，否则不要修改包版本或生成发布说明。
