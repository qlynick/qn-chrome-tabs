# Contributing

**English** | [简体中文](./CONTRIBUTING.zh-CN.md)

Thanks for helping improve Qn Chrome Tabs.

## Before you start

- Search existing issues before opening a new one.
- Use the bug report form for reproducible defects and the feature request form
  for proposed behavior.
- Keep each issue or pull request focused on one change.
- Do not open a public issue for a security vulnerability. Follow
  [the security policy](./SECURITY.md) instead.

## Development

Requirements:

- Node.js supported by the current Vite release
- npm
- Bun only when working on the documentation app

Install dependencies and start the interactive demo:

```bash
npm install
npm run dev
```

The component source is in `src/`, and the interactive demo is in `demo/`.

## Validate a change

Run the package build:

```bash
npm run build
```

For visual or interaction changes, also verify the relevant behavior in the
interactive demo. This repository does not currently have an automated test
suite, so describe the manual checks you performed in the pull request.

If you changed the documentation app, run:

```bash
cd docs
bun install
bun run build
```

## Pull requests

In the pull request description:

- Explain the problem and the chosen solution.
- Link the related issue when one exists.
- List the commands and manual scenarios used for verification.
- Include before-and-after screenshots or a short recording for visual changes.

Do not change the package version or generated release notes unless the pull
request is specifically preparing a release.
