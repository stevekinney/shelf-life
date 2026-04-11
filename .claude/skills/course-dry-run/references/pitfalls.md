# Course dry-run pitfalls

Load this file before touching visual-regression baselines, CI workflow YAML, or `.husky/` scripts. These are the recurring traps the dry-run loop has hit in prior runs.

## Cross-platform visual regression baselines

Darwin-captured screenshot baselines fail on GitHub Actions Ubuntu runners because Playwright appends a `-linux` suffix. Generate Linux baselines via the Playwright Docker image:

```sh
docker run --rm -v "$PWD:/work" -w /work mcr.microsoft.com/playwright:v<current-version>-jammy bash -lc '
  cat > .env <<EOF
DATABASE_URL=file:./tmp/linux.db
ORIGIN=http://127.0.0.1:4173
BETTER_AUTH_SECRET=ci-test-secret-ci-test-secret-ci-test-secret-32chars
ENABLE_TEST_SEED=true
OPEN_LIBRARY_BASE_URL=https://openlibrary.org
EOF
  mkdir -p tmp
  npm ci --ignore-scripts
  npx drizzle-kit push --force
  npx playwright test --update-snapshots --project=setup --project=public --project=authenticated
'
```

Commit both `-darwin.png` and `-linux.png` baselines side by side. If residual pixel drift remains between the Docker image and the GitHub Actions runner image, set `maxDiffPixelRatio: 0.01` in the global `toHaveScreenshot` config. Note that running `npm ci` inside the Linux container will overwrite native extensions for macOS — you'll need to `rm -rf node_modules && npm install` on the host afterwards to restore Darwin binaries.

## Gitleaks CI step

`gitleaks/gitleaks-action@v2` does a partial scan over `<prev>^..<current>` that fails on first-push branches. Use a direct CLI invocation instead:

```yaml
- name: Install gitleaks
  run: |
    curl -sSL https://github.com/gitleaks/gitleaks/releases/download/v8.28.0/gitleaks_8.28.0_linux_x64.tar.gz \
      | tar -xz -C /tmp gitleaks
    sudo install /tmp/gitleaks /usr/local/bin/gitleaks
- name: Secret scan
  run: gitleaks dir . --redact --config .gitleaks.toml
```

## Pre-commit hook clobbering `prepare`

Running `npx husky init` will overwrite the `prepare` script in `package.json` with just `husky`. Restore `playwright install` and `svelte-kit sync` afterwards:

```json
"prepare": "husky && (playwright install || echo '') && (svelte-kit sync || echo '')"
```

## Course-prose framing

The published course should contain zero mentions of "dry run", "Third dry run validation", "current Shelf replay", or "validated Shelf repo". These are internal QA artifacts. Strip them inline as you find them.
