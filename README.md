# dsh-installed-inventory-ad

Installed inventory for DeepSeek Harness: the plugin bundles **you** installed, with the
plugin manager's own enable switch and uninstall action, plus the skills the open
conversation can invoke.

## Install

```sh
# from npm
dsh plugin --profile desktop add dsh-installed-inventory-ad

# or straight from GitHub
dsh plugin --profile desktop add github:zmq6931/dsh-installed-inventory-ad
```

Restart DSH after installing. Requires a profile-backed Host (the desktop app, or `dsh web`
with a profile); without one the panel says so and lists nothing.

## Where it appears

- **Every conversation's view tab row**, right after `mcp-visualizer`:
  `Chat | Trajectory | Statistics | mcp-visualizer | Installed`.
- **Settings → Built-in plugins → Installed**, the same panel for reading without a
  conversation.

## The bundle list

Rows come from `pluginManager/listBundles`, filtered to `installed` — the profile's own
dependencies, i.e. exactly what the sidebar Plugins page shows as installed. Each row shows
the package's localized title and description, its name, version, availability (`profile`,
`shipped`, `files missing`), and the effective selection.

- **Switch** — calls `setBundleEnabled(name, enabled)`, so the persisted selection goes
  through the plugin manager, not through hand-edited profile files. A bundle the manager
  reports as read-only renders a disabled switch.
- **Uninstall** — appears only where the manager reports `removable`. It asks for a second
  click, then calls `removeBundle(name)`.
- **Outcome** — the manager's `ChangeResult.application` is reported verbatim under the row:
  `Applied`, `Saved — takes effect after a restart`, `Saved, but a higher configuration layer
  overrides it`, `The plugin manager rejected the change` (with its message), or `Cancelled`.
  The list is re-read after every mutation, so the switch reflects the persisted profile
  rather than an optimistic guess.

Shipped and catalog-only bundles are deliberately excluded: they are the installation's, not
something you installed, and the built-in page already covers them.

## The skill list

The open conversation's catalog, read through `skills/list` — the same Remote behind the
composer's `/` suggestions — with the discovery source, provider, instruction-file path, and
invocation policy (`Model + user`, `Model only`, `User only`, `Hidden`).

## Using it

- One filter box narrows both lists by name, description, module, source, or path.
- **Refresh** re-reads the profile and the catalog.
- A small diagnostics line at the bottom reports which Remotes resolved and what the last
  read returned; it turns red when something is missing. It exists so a broken deployment
  reports itself instead of showing an empty panel.

## Limits

- Management requires a profile-backed Host: without one the panel says so and lists nothing.
- A change that `restart-required` reports is persisted but not live; restart the app to
  apply it.
- Uninstall is the manager's removal of the profile dependency — it does not touch packages
  the installation ships.
- Read access only to what the Remotes expose; this plugin never edits profile files and
  never runs package commands itself.

## License

MIT © Andy Zhu
