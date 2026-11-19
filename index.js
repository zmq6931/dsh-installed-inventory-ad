/**
 * Installed inventory — node half.
 *
 * The empty apply exists so the bundle holds a Loader row; the browser half
 * (`./client`) owns the Settings tab and is discovered from the package.json
 * `dsh.client` declaration. Both lists it shows are read through Remotes the
 * Host already serves: `pluginInventory/list` for the Loader composition and
 * `skills/list` for the catalog of the session the reader has open, so this
 * package registers no Host capability of its own.
 */

/** Host plugin body — no host-side behavior for this surface plugin. */
export function apply() {}
