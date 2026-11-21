# Releasing

The extension is published to the VS Code Marketplace from GitHub Actions using
[Trusted Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#trusted-publishing).
No Azure DevOps Personal Access Token is stored in the repository.

The workflow is [`.github/workflows/publish.yml`](.github/workflows/publish.yml).
It requires `@vscode/vsce` >= 4 and Node.js 22.

## One-time Marketplace setup

1. Open the publisher management page:
   <https://marketplace.visualstudio.com/manage/publishers/RVSmartPorting>
2. Under **Trusted Publishing**, add a policy with:
   - **Repository owner**: `rv-smartporting`
   - **Repository name**: `rpm-spec-extension`
   - **Workflow file**: `publish.yml`
   - **Environment**: leave empty
3. Save the policy.

> If the policy specifies an environment, add `environment: <name>` to the
> `publish` job in `publish.yml`, otherwise the token exchange is rejected.
>
> For private repositories, a new policy stays active for 48 hours. Run the
> publish workflow once in that window to activate it permanently.

The workflow requests a GitHub OIDC token (`permissions: id-token: write`); the
Marketplace exchanges it for a credential that expires after 15 minutes. There
is no PAT fallback: if the exchange fails, the publish step fails.

> Azure DevOps global PATs are retired on **December 1, 2026**, so publishing
> with `VSCE_PAT` will stop working.

## Publishing a new version

1. Update `version` in `package.json` and add an entry to `CHANGELOG.md`.
2. Commit and push a matching tag:

   ```bash
   git commit -am "release: vX.Y.Z"
   git push origin master
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

3. The `Publish` workflow starts automatically for the tag:
   - verifies that the tag matches `package.json`,
   - installs dependencies and builds the VSIX,
   - uploads the VSIX as a workflow artifact,
   - publishes it to the Marketplace with `vsce publish --oidc`.

Tags whose version contains a hyphen (for example `v0.1.0-beta`) are published
as pre-release versions.

To retry a failed run or publish an existing tag, open
**Actions → Publish → Run workflow** and enter the tag name.

## Local packaging

```bash
pnpm install
pnpm run vscode:package
```

The resulting `rpm-spec-ext-<version>.vsix` can be installed manually, but
publishing is intentionally restricted to the publish workflow.
