# EXMirror API Aidoku Source

Aidoku source ID: `zh.exmirror.api`

This source only uses EXMirror JSON endpoints for list pages:

- `/api/i`
- `/api/popular`
- `/api/watched`
- `/api/favorites`

Details, page lists, and images still reuse the existing EXMirror API chain:

- `/api/g/{gid}/{token}`
- `/api/s/{page_token}/{gallery_id}`

The API list endpoints require a complete ExHentai login cookie set. Manually provide `ipb_member_id`, `ipb_pass_hash`, `igneous`, and `sk`. Pasting the full cookie string into any one cookie field is also supported.

## Build And Verify

Run from the repository root:

```powershell
Set-Location .\sources\zh.exmirror-api
cargo test
cargo check --target wasm32-unknown-unknown

Set-Location ..\..
aidoku package .\sources\zh.exmirror-api
aidoku verify .\sources\zh.exmirror-api\package.aix
```

Deployment artifacts are expected at:

- `mui\public\aidoku\index.min.json`
- `mui\public\aidoku\sources\zh.exmirror-api-v3.aix`

`sources\zh.exmirror-api\package.aix` is local build output and should not be committed.
