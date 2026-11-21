# Change Log

RPM Spec Plugin Change Log

## [V0.0.6] - 2026-11-21

- Added a GitHub Actions workflow that publishes the extension to the VS Code Marketplace using Trusted Publishing (OIDC), removing the need for an Azure DevOps Personal Access Token
- Upgraded `@vscode/vsce` to 4.1.1 (requires Node.js 22)
- Added `RELEASING.md` with the Marketplace publisher policy setup and release process
- Excluded development-only files (`.github`, `.claude`, `RELEASING.md`) from the packaged VSIX

## [V0.0.5] - 2026-11-21

- Rewrote the TextMate grammar with a modular, `repository`-based structure
- Added structured highlighting for `%changelog` entries (date, author, email, version)
- Added highlighting for `%package` names and `%description` options (`-n`, `-l`)
- Added support for declarative build tags from RPM 4.20+ (`BuildSystem`, `BuildOption`)
- Added rich/boolean dependency operators (`and`, `or`, `if`, `else`, `unless`, `with`, `without`) and version comparison literals (`v"1.2.3"`)
- Added architecture validation for `BuildArch`, `ExclusiveArch`, `ExcludeArch`, `%ifarch` and `%ifnarch`
- Added macro support for `%bcond_with`/`%bcond_without`, parameterized `%define`/`%global`, `%[...]` expressions, `%(...)` shell expansion and `%{...}` built-in functions
- Added highlighting for OBS comment directives and the `%dnl` macro comment
- Added highlighting for `%files` directives (`%defattr`, `%attr`, `%config`, `%license`, `%ghost`, `%exclude`, etc.) and built-in `%prep` directives (`%setup`, `%autosetup`, `%patch`, etc.)
- Added `MonetDB.spec` and `diffutils.spec` test fixtures

## [V0.0.4] - 2025-06-05

- Line-start keywords are now *case-insensitive*
- Added def-ref tracking for variables and functions defined with the `%define` keyword
- Added `language-configuration.json` to support automatic bracket matching (PR by `@kuletco`)
- Extension type changed to `Programming Languages` (PR by `@kuletco`)
- Improved syntax highlighting for macros and certain text elements
- Added support for custom code region folding in the form of `#region` and `#endregion` (suggested by `@kwk`)
- Migrate to pnpm and update dependencies

## [V0.0.2] - 2023-04-14

- Initial release version of RPM Spec Language Support

## [Unreleased] - 2023-04-11

- Initial project
