# EXMirror Aidoku 图源

Aidoku 图源 ID：`zh.exmirror`

## 验证与打包

请先确保以下工具可在命令行中直接调用：

- `cargo`
- `aidoku`
- `aidoku-test-runner`

建议使用可正常链接 Rust 构建脚本的本机 Rust 工具链，并安装 `wasm32-unknown-unknown` target。

从仓库根目录运行：

```powershell
Set-Location .\sources\zh.exmirror
cargo test
cargo check --target wasm32-unknown-unknown

Set-Location ..\..
aidoku package .\sources\zh.exmirror
aidoku verify .\sources\zh.exmirror\package.aix
aidoku build -o .\mui\public\aidoku -n EXMirror .\sources\zh.exmirror\package.aix
```

部署用图源列表产物位于：

- `mui\public\aidoku\index.min.json`
- `mui\public\aidoku\sources\zh.exmirror-v1.aix`

`sources\zh.exmirror\package.aix` 是本地打包输出，不应提交。

## 在 Aidoku 中安装

直接导入 `.aix` 可以手动安装图源，但 Aidoku 会提示该外部图源缺少图源列表配置，无法自动更新。这是直接导入 `.aix` 时的预期行为。

需要自动更新时，应在 Aidoku 中添加图源列表 URL：

```text
https://ex.elysia.rip/aidoku/index.min.json
```

添加图源列表后，从 Aidoku 的图源列表页面安装 `EXMirror`。以后提升 `source.json` 中的版本号并重新生成图源列表后，Aidoku 才能通过该 URL 检查更新。

本地局域网测试可使用：

```powershell
aidoku serve .\sources\zh.exmirror\package.aix
```

然后在 Aidoku 中添加命令输出的 `index.min.json` 地址。
