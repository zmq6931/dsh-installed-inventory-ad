/**
 * Installed inventory — browser half.
 *
 * Loaded by dsh-client-modules at /plugins/dsh-installed-inventory-ad/client.js and
 * executed through the vendored cordis Loader's lazy-CJS module table
 * (window.__ModuleLoader__.load).
 *
 * Registers one view tab in every conversation (`conversation.view`, right
 * after `mcp-visualizer`) and one page in Settings → Built-in plugins. Both
 * show the same panel:
 *
 *  - the bundles this profile installed — the same rows the sidebar Plugins
 *    page calls "installed" — each with the effective selection, its version
 *    and source, a switch that writes the profile selection
 *    (`pluginManager/setBundleEnabled`), and an uninstall action for the rows
 *    the manager reports as removable (`pluginManager/removeBundle`);
 *  - the skills the open conversation can invoke, read through `skills/list`,
 *    the catalog behind the composer's `/` suggestions.
 *
 * Every mutation is the plugin manager's own operation, so its outcome is
 * reported as the manager returns it: `applied`, `restart-required`,
 * `overridden`, `failed`, or `cancelled`. This plugin never edits the profile
 * itself and never runs package commands.
 *
 * No Harness Client package is imported: React comes from the browser module
 * table and every color, radius, and type size is a `--dsw-*` theme variable.
 */

window.__ModuleLoader__.load({
  id: 'dsh-installed-inventory-ad',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Locale namespace owned by this plugin. */
    const NS = 'inventory-ad';
    /** Conversation view tab slot owned by @deepseek-ai/dsh-client-ui-conversation. */
    const VIEW_SLOT = 'conversation.view';
    /** Settings tab slot contributed by @deepseek-ai/dsh-client-ui-settings-plugins. */
    const SLOT = 'settings.plugins.tab';
    /** Registration id inside both slots. */
    const TAB_ID = 'installed-inventory';
    /** Tab order: after the shipped mcp-visualizer tab (50). */
    const VIEW_ORDER = 60;
    /** Tab order in the settings section: after the shipped inventory tab (10). */
    const SETTINGS_ORDER = 90;

    /** Browser dictionaries registered into the Client locale service. */
    const DICTS = Object.freeze({
      en: Object.freeze({
        tab: 'Installed',
        title: 'Installed plugins',
        subtitle: 'The bundles this profile installed, with the live switch the plugin manager writes.',
        plugins: 'Bundles',
        skills: 'Skills',
        filter: 'Filter by name, description, or source',
        refresh: 'Refresh',
        refreshBusy: 'Refreshing…',
        enabled: 'Enabled',
        disabled: 'Disabled',
        enable: 'Enable',
        disable: 'Disable',
        uninstall: 'Uninstall',
        confirmUninstall: 'Confirm uninstall',
        cancel: 'Cancel',
        pending: 'Working…',
        loading: 'Reading the profile…',
        loadedNone: 'This profile installs no plugin bundle.',
        filterEmpty: 'Nothing matches this filter.',
        loadFailed: 'Could not read the installed plugins',
        unavailable: 'This deployment exposes no plugin management.',
        notRemovable: 'Kept by the installation',
        readOnly: 'Managed elsewhere',
        sourceProfile: 'profile',
        sourceInstallation: 'shipped',
        sourceMissing: 'files missing',
        skillsNone: 'This conversation has no skill.',
        skillsEmpty: 'No skill matches this filter.',
        skillsNoSession: 'Open a conversation first: the skill catalog is read from a session.',
        skillsUnavailable: 'This deployment exposes no skill catalog.',
        skillsFailed: 'The skill catalog could not be read',
        fromSession: 'Read from session',
        modelAndUser: 'Model + user',
        modelOnly: 'Model only',
        userOnly: 'User only',
        hidden: 'Hidden',
        changeApplied: 'Applied',
        changeRestart: 'Saved — takes effect after a restart',
        changeOverridden: 'Saved, but a higher configuration layer overrides it',
        changeFailed: 'The plugin manager rejected the change',
        changeCancelled: 'Cancelled',
      }),
      zh: Object.freeze({
        tab: '已安装',
        title: '已安装的插件',
        subtitle: '当前 profile 安装的插件包，开关直接写入插件管理器的选择。',
        plugins: '插件包',
        skills: '技能',
        filter: '按名称、描述或来源筛选',
        refresh: '刷新',
        refreshBusy: '刷新中…',
        enabled: '已启用',
        disabled: '已禁用',
        enable: '启用',
        disable: '禁用',
        uninstall: '卸载',
        confirmUninstall: '确认卸载',
        cancel: '取消',
        pending: '处理中…',
        loading: '正在读取 profile…',
        loadedNone: '当前 profile 没有安装插件包。',
        filterEmpty: '没有符合筛选条件的条目。',
        loadFailed: '无法读取已安装插件',
        unavailable: '当前部署没有提供插件管理能力。',
        notRemovable: '由安装保留，不可卸载',
        readOnly: '在别处管理',
        sourceProfile: 'profile',
        sourceInstallation: '内置',
        sourceMissing: '文件缺失',
        skillsNone: '当前会话没有可用技能。',
        skillsEmpty: '没有符合筛选条件的技能。',
        skillsNoSession: '请先打开一个会话：技能目录来自会话。',
        skillsUnavailable: '当前部署没有提供技能目录。',
        skillsFailed: '无法读取技能目录',
        fromSession: '读取自会话',
        modelAndUser: '模型 + 用户',
        modelOnly: '仅模型',
        userOnly: '仅用户',
        hidden: '隐藏',
        changeApplied: '已生效',
        changeRestart: '已保存，重启后生效',
        changeOverridden: '已保存，但被更高优先级配置覆盖',
        changeFailed: '插件管理器拒绝了这次变更',
        changeCancelled: '已取消',
      }),
    });

    /** Row and control styles; host theme tokens only, plugin-prefixed selectors. */
    const CSS = [
      '.dsh-inv{display:flex;flex-direction:column;gap:18px;padding:2px 2px 12px;color:var(--dsw-alias-label-primary,inherit);font-family:var(--dsw-font-family,inherit);}',
      '.dsh-inv-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;}',
      '.dsh-inv-heading{display:flex;flex-direction:column;gap:4px;min-width:0;}',
      '.dsh-inv-title{margin:0;font-size:var(--dsw-font-m-18-font-size,17px);font-weight:var(--dsw-font-m-18-font-weight,600);line-height:var(--dsw-font-m-18-line-height,1.4);}',
      '.dsh-inv-subtitle{margin:0;font-size:var(--dsw-font-xs-13-font-size,12.5px);line-height:1.5;color:var(--dsw-alias-label-secondary,inherit);}',
      '.dsh-inv-btn{flex:none;height:28px;padding:0 12px;border-radius:var(--dsw-radius-md,8px);border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.32));background:transparent;color:var(--dsw-alias-label-primary,inherit);font:inherit;font-size:12px;line-height:1;cursor:pointer;white-space:nowrap;}',
      '.dsh-inv-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));}',
      '.dsh-inv-btn:disabled{opacity:.55;cursor:default;}',
      '.dsh-inv-btn:focus-visible{outline:none;border-color:var(--dsw-alias-brand-primary,#4d6bfe);box-shadow:0 0 0 2px var(--dsw-focus-ring-color,rgba(77,107,254,.28));}',
      '.dsh-inv-btn--danger{color:var(--dsw-alias-state-error-primary,#e03131);border-color:var(--dsw-alias-state-error-secondary,rgba(224,49,49,.5));}',
      '.dsh-inv-btn--danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger,rgba(224,49,49,.12));}',
      '.dsh-inv-search{width:100%;box-sizing:border-box;height:32px;padding:0 10px;border-radius:var(--dsw-radius-md,8px);border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.32));background:var(--dsw-alias-bg-base,transparent);color:var(--dsw-alias-label-primary,inherit);font:inherit;font-size:13px;}',
      '.dsh-inv-search::placeholder{color:var(--dsw-alias-label-tertiary,#8b8f96);}',
      '.dsh-inv-search:focus-visible{outline:none;border-color:var(--dsw-alias-brand-primary,#4d6bfe);box-shadow:0 0 0 2px var(--dsw-focus-ring-color,rgba(77,107,254,.28));}',
      '.dsh-inv-section{display:flex;flex-direction:column;gap:8px;}',
      '.dsh-inv-section-head{display:flex;align-items:baseline;gap:8px;}',
      '.dsh-inv-section-title{margin:0;font-size:var(--dsw-font-s-strong-14-font-size,13px);font-weight:var(--dsw-font-s-strong-14-font-weight,600);}',
      '.dsh-inv-count{font-size:11.5px;color:var(--dsw-alias-label-tertiary,#8b8f96);font-variant-numeric:tabular-nums;}',
      '.dsh-inv-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;}',
      '.dsh-inv-row{display:flex;align-items:flex-start;gap:12px;padding:9px 12px;border-radius:var(--dsw-radius-md,8px);border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.18));background:var(--dsw-alias-bg-layer-1,transparent);}',
      '.dsh-inv-row-main{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 auto;}',
      '.dsh-inv-row-title{font-size:var(--dsw-font-s-14-font-size,13px);font-weight:var(--dsw-font-s-strong-14-font-weight,600);line-height:1.45;word-break:break-word;}',
      '.dsh-inv-row-desc{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary,inherit);word-break:break-word;}',
      '.dsh-inv-row-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:11px;color:var(--dsw-alias-label-tertiary,#8b8f96);}',
      '.dsh-inv-path{margin:0;font-size:11px;line-height:1.45;color:var(--dsw-alias-label-tertiary,#8b8f96);word-break:break-all;}',
      '.dsh-inv-note{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary,inherit);}',
      '.dsh-inv-note--err{color:var(--dsw-alias-state-error-primary,#e03131);}',
      '.dsh-inv-note--warn{color:var(--dsw-alias-state-warn-primary,#f08c00);}',
      '.dsh-inv-note--ok{color:var(--dsw-alias-state-success-primary,#2f9e44);}',
      '.dsh-inv-diag{margin:0;font-family:var(--dsw-font-markdown-code-font-family,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:10.5px;line-height:1.5;color:var(--dsw-alias-label-tertiary,#8b8f96);word-break:break-all;}',
      '.dsh-inv-diag--bad{color:var(--dsw-alias-state-error-primary,#e03131);}',
      '.dsh-inv-row-controls{flex:none;display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end;}',
      '.dsh-inv-switch{position:relative;flex:none;width:34px;height:20px;padding:0;border:0;border-radius:999px;background:var(--dsw-alias-border-l3,rgba(127,127,127,.45));cursor:pointer;transition:background .15s ease;}',
      '.dsh-inv-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary,#4d6bfe);}',
      '.dsh-inv-switch:disabled{opacity:.5;cursor:default;}',
      '.dsh-inv-switch:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-focus-ring-color,rgba(77,107,254,.35));}',
      '.dsh-inv-switch-thumb{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-switch-thumb,#fff);transition:transform .15s ease;}',
      '.dsh-inv-switch[aria-checked="true"] .dsh-inv-switch-thumb{transform:translateX(14px);}',
      '.dsh-inv-chip{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:var(--dsw-radius-xs,4px);background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.14));color:var(--dsw-alias-label-secondary,inherit);font-size:11px;line-height:18px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;}',
      '.dsh-inv-chip--ok{color:var(--dsw-alias-state-success-primary,#2f9e44);}',
      '.dsh-inv-chip--warn{color:var(--dsw-alias-state-warn-primary,#f08c00);}',
      '.dsh-inv-chip--err{color:var(--dsw-alias-state-error-primary,#e03131);}',
      '.dsh-inv-chip--off{color:var(--dsw-alias-label-tertiary,#8b8f96);}',
      '.dsh-inv-mono{font-family:var(--dsw-font-markdown-code-font-family,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11.5px;}',
      '.dsh-inv-skeleton{height:44px;border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-skeleton,rgba(127,127,127,.12));}',
    ].join('');

    /**
     * Conversation-view shell copied from the shipped Statistics view: the view
     * area has no padding of its own, the docked composer overlays it, so the
     * panel reserves the composer height and owns its scroll region.
     */
    const VIEW_ROOT = Object.freeze({
      boxSizing: 'border-box',
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      paddingBottom: 'calc(var(--dsh-composer-height, 152px) + 8px)',
    });

    const VIEW_SCROLL = Object.freeze({
      boxSizing: 'border-box',
      flex: 1,
      height: '100%',
      minHeight: 0,
      overflowY: 'auto',
      padding: '0 20px 16px',
    });

    const VIEW_INNER = Object.freeze({ width: '100%', maxWidth: 760, margin: '0 auto', paddingTop: 12 });

    /** Read a message off an unknown thrown value. */
    function messageOf(error) {
      if (error instanceof Error) return error.message;
      return String(error);
    }

    /** Reject a read that never settles, so a stuck RPC becomes a visible failure. */
    function withTimeout(promise, ms, label) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(label + ' timed out after ' + ms + 'ms')), ms);
        promise.then(
          (value) => {
            clearTimeout(timer);
            resolve(value);
          },
          (error) => {
            clearTimeout(timer);
            reject(error);
          },
        );
      });
    }

    /** Contain a panel crash: a throwing child would blank the whole slot entry. */
    class PanelBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { error: undefined };
      }

      static getDerivedStateFromError(error) {
        return { error };
      }

      componentDidCatch(error, info) {
        console.error('[inventory-ad] panel crashed', error, info);
      }

      render() {
        if (this.state.error !== undefined) {
          return h(
            'div',
            { className: 'dsh-inv' },
            h('p', { className: 'dsh-inv-note dsh-inv-note--err' }, 'inventory-ad crashed: ' + messageOf(this.state.error)),
          );
        }
        return this.props.children;
      }
    }

    /** Wrap one slot component so a render failure stays readable. */
    function guarded(Component) {
      function Guarded(props) {
        return h(PanelBoundary, null, h(Component, props));
      }
      return Guarded;
    }

    /** Drop the npm scope, leaving the row-sized package name. */
    function shortName(moduleName) {
      if (typeof moduleName !== 'string' || moduleName.length === 0) return '';
      const slash = moduleName.indexOf('/');
      return moduleName.startsWith('@') && slash !== -1 ? moduleName.slice(slash + 1) : moduleName;
    }

    /** Resolve a localized package text value to one string in the active locale. */
    function textOf(value, resolveText) {
      if (typeof value === 'string') return value;
      if (value === null || typeof value !== 'object') return undefined;
      if (typeof resolveText === 'function') {
        try {
          const resolved = resolveText(value);
          if (typeof resolved === 'string' && resolved.length > 0) return resolved;
        } catch (error) {
          console.error('[inventory-ad] resolveText failed', error);
        }
      }
      return undefined;
    }

    /** Normalize one profile bundle row. */
    function bundleRow(bundle, resolveText) {
      const source = bundle !== null && typeof bundle === 'object' ? bundle : {};
      const meta = source.meta !== null && typeof source.meta === 'object' ? source.meta : {};
      const name = typeof source.name === 'string' ? source.name : String(source.name);
      return {
        name,
        title: textOf(meta.title, resolveText) || shortName(name) || name,
        description: textOf(meta.description, resolveText) || (typeof source.description === 'string' ? source.description : undefined),
        version: typeof source.version === 'string' ? source.version : undefined,
        source: typeof source.source === 'string' ? source.source : undefined,
        availability: typeof source.availability === 'string' ? source.availability : 'profile',
        enabled: source.enabled === true,
        removable: source.removable === true,
        readOnly: source.readOnlyReason !== undefined && source.readOnlyReason !== null,
        installed: source.installed === true,
      };
    }

    /** One skill row, normalized from a `skills/list` summary. */
    function skillRow(skill) {
      const source = skill !== null && typeof skill === 'object' ? skill : {};
      const invocation = source.invocation !== null && typeof source.invocation === 'object' ? source.invocation : {};
      const name = typeof source.name === 'string' ? source.name : String(source.name);
      return {
        key: name,
        name,
        description: typeof source.description === 'string' ? source.description : '',
        source: typeof source.source === 'string' ? source.source : '',
        provider: typeof source.provider === 'string' ? source.provider : '',
        path: typeof source.path === 'string' ? source.path : '',
        modelInvocable: invocation.modelInvocable !== false,
        userInvocable: invocation.userInvocable !== false,
      };
    }

    /** Invocation policy label for one skill. */
    function invocationKey(row) {
      if (row.modelInvocable && row.userInvocable) return 'modelAndUser';
      if (row.modelInvocable) return 'modelOnly';
      if (row.userInvocable) return 'userOnly';
      return 'hidden';
    }

    /** Whether any of the parts contains the lowercased needle. */
    function matches(needle, parts) {
      if (needle.length === 0) return true;
      for (const part of parts) {
        if (typeof part === 'string' && part.length > 0 && part.toLowerCase().includes(needle)) return true;
      }
      return false;
    }

    /** Map one ChangeResult onto the sentence and tone the row shows. */
    function describeChange(result, t) {
      if (result === null || typeof result !== 'object') return { text: t('changeApplied'), tone: 'ok' };
      const errorText = result.error !== null && typeof result.error === 'object' && typeof result.error.message === 'string' ? ': ' + result.error.message : '';
      switch (result.application) {
        case 'applied':
          return { text: t('changeApplied'), tone: 'ok' };
        case 'restart-required':
          return { text: t('changeRestart'), tone: 'warn' };
        case 'overridden':
          return { text: t('changeOverridden'), tone: 'warn' };
        case 'failed':
          return { text: t('changeFailed') + errorText, tone: 'error' };
        case 'cancelled':
          return { text: t('changeCancelled'), tone: 'warn' };
        default:
          return { text: String(result.application === undefined ? '?' : result.application) + errorText, tone: 'warn' };
      }
    }

    /** Section heading with its filtered and total counts. */
    function sectionHead(title, shown, total) {
      return h(
        'div',
        { className: 'dsh-inv-section-head' },
        h('h3', { className: 'dsh-inv-section-title' }, title),
        h('span', { className: 'dsh-inv-count' }, String(shown) + ' / ' + String(total)),
      );
    }

    /** One installed-bundle row: identity, live selection, switch, uninstall. */
    function BundleListItem(props) {
      const { row, t, pending, notice, confirming, onToggle, onUninstall, onConfirm, onCancel } = props;
      const enabled = row.enabled;
      const toggleDisabled = pending || row.readOnly;
      const availabilityKey = row.availability === 'installation' ? 'sourceInstallation' : row.availability === 'missing' ? 'sourceMissing' : 'sourceProfile';
      return h(
        'li',
        { className: 'dsh-inv-row' },
        h(
          'div',
          { className: 'dsh-inv-row-main' },
          h('div', { className: 'dsh-inv-row-title' }, row.title),
          row.description === undefined ? null : h('p', { className: 'dsh-inv-row-desc' }, row.description),
          h(
            'div',
            { className: 'dsh-inv-row-meta' },
            h('span', { className: 'dsh-inv-mono' }, row.name),
            row.version === undefined ? null : h('span', { className: 'dsh-inv-chip' }, 'v' + row.version),
            h('span', { className: 'dsh-inv-chip' }, t(availabilityKey)),
            enabled
              ? h('span', { className: 'dsh-inv-chip dsh-inv-chip--ok' }, t('enabled'))
              : h('span', { className: 'dsh-inv-chip dsh-inv-chip--off' }, t('disabled')),
          ),
          notice === undefined ? null : h('p', { className: 'dsh-inv-note dsh-inv-note--' + notice.tone }, notice.text),
        ),
        h(
          'div',
          { className: 'dsh-inv-row-controls' },
          pending ? h('span', { className: 'dsh-inv-note' }, t('pending')) : null,
          h(
            'button',
            {
              type: 'button',
              className: 'dsh-inv-switch',
              role: 'switch',
              'aria-checked': enabled ? 'true' : 'false',
              'aria-label': row.title + ': ' + (enabled ? t('enabled') : t('disabled')),
              title: row.readOnly ? t('readOnly') : enabled ? t('disable') : t('enable'),
              disabled: toggleDisabled,
              onClick: () => onToggle(row, !enabled),
            },
            h('span', { className: 'dsh-inv-switch-thumb' }),
          ),
          row.removable
            ? confirming
              ? h(
                  'span',
                  { className: 'dsh-inv-row-controls' },
                  h('button', { type: 'button', className: 'dsh-inv-btn dsh-inv-btn--danger', onClick: () => onConfirm(row) }, t('confirmUninstall')),
                  h('button', { type: 'button', className: 'dsh-inv-btn', onClick: onCancel }, t('cancel')),
                )
              : h('button', { type: 'button', className: 'dsh-inv-btn', disabled: pending, onClick: () => onUninstall(row) }, t('uninstall'))
            : h('span', { className: 'dsh-inv-chip dsh-inv-chip--off' }, t('notRemovable')),
        ),
      );
    }

    /** One skill row. */
    function skillListItem(row, t) {
      return h(
        'li',
        { key: row.key, className: 'dsh-inv-row' },
        h(
          'div',
          { className: 'dsh-inv-row-main' },
          h('div', { className: 'dsh-inv-row-title dsh-inv-mono' }, '/' + row.name),
          row.description.length === 0 ? null : h('p', { className: 'dsh-inv-row-desc' }, row.description),
          row.path.length === 0 ? null : h('p', { className: 'dsh-inv-path' }, row.path),
        ),
        h(
          'div',
          { className: 'dsh-inv-row-controls' },
          row.source.length === 0 ? null : h('span', { className: 'dsh-inv-chip' }, row.source),
          row.provider.length === 0 ? null : h('span', { className: 'dsh-inv-chip' }, row.provider),
          h('span', { className: 'dsh-inv-chip ' + (row.modelInvocable ? 'dsh-inv-chip--ok' : 'dsh-inv-chip--warn') }, t(invocationKey(row))),
        ),
      );
    }

    /**
     * The panel: installed bundles with their manager-backed controls, then the
     * skill catalog. One filter narrows both lists.
     * @param props - slot props carrying the injected operations, `t`, and the diagnostics probe.
     * @returns the panel element tree.
     */
    function InventoryPanel(props) {
      const t = typeof props.t === 'function' ? props.t : (key) => key;
      const resolveText = props.resolveText;
      const readBundles = props.readBundles;
      const loadSkills = props.loadSkills;

      const [phase, setPhase] = React.useState('loading');
      const [bundles, setBundles] = React.useState([]);
      const [managed, setManaged] = React.useState(true);
      const [failure, setFailure] = React.useState(undefined);
      const [notices, setNotices] = React.useState({});
      const [pendingName, setPendingName] = React.useState(undefined);
      const [confirmingName, setConfirmingName] = React.useState(undefined);
      const [skillState, setSkillState] = React.useState({ status: 'loading' });
      const [query, setQuery] = React.useState('');
      const [revision, setRevision] = React.useState(0);
      const [busy, setBusy] = React.useState(true);
      const mounted = React.useRef(true);

      React.useEffect(() => {
        mounted.current = true;
        return () => {
          mounted.current = false;
        };
      }, []);

      const refresh = React.useCallback(() => setRevision((value) => value + 1), []);

      React.useEffect(() => {
        let disposed = false;
        const live = () => mounted.current && !disposed;
        setBusy(true);

        Promise.resolve()
          .then(() => withTimeout(readBundles(), 20000, 'pluginManager/listBundles'))
          .then((result) => {
            if (!live()) return;
            const rows = result !== null && typeof result === 'object' && Array.isArray(result.bundles) ? result.bundles : [];
            setManaged(result === null || typeof result !== 'object' ? true : result.managed !== false);
            setBundles(rows.map((entry) => bundleRow(entry, resolveText)));
            setFailure(undefined);
            setPhase('ready');
          })
          .catch((error) => {
            if (!live()) return;
            setBundles([]);
            setFailure(messageOf(error));
            setPhase('ready');
          })
          .then(() => {
            if (live()) setBusy(false);
          });

        Promise.resolve()
          .then(() => withTimeout(loadSkills(), 15000, 'skills/list'))
          .then((result) => {
            if (!live()) return;
            if (result !== null && typeof result === 'object' && result.status === 'ready') {
              const rows = Array.isArray(result.skills) ? result.skills.map(skillRow) : [];
              rows.sort((left, right) => left.name.localeCompare(right.name));
              setSkillState({ status: 'ready', skills: rows, sessionId: result.sessionId });
              return;
            }
            setSkillState({
              status: result !== null && typeof result === 'object' ? result.status : 'unavailable',
              message: result !== null && typeof result === 'object' ? result.message : undefined,
            });
          })
          .catch((error) => {
            if (!live()) return;
            setSkillState({ status: 'failed', message: messageOf(error) });
          });

        return () => {
          disposed = true;
        };
      }, [readBundles, loadSkills, resolveText, revision]);

      /** Record one operation's sentence next to its row. */
      const note = (name, value) => {
        if (!mounted.current) return;
        setNotices((current) => {
          const next = Object.assign({}, current);
          if (value === undefined) delete next[name];
          else next[name] = value;
          return next;
        });
      };

      const onToggle = (row, nextEnabled) => {
        if (pendingName !== undefined) return;
        setPendingName(row.name);
        note(row.name, undefined);
        Promise.resolve()
          .then(() => withTimeout(props.setBundleEnabled(row.name, nextEnabled), 60000, 'pluginManager/setBundleEnabled'))
          .then((result) => {
            note(row.name, describeChange(result, t));
            // The selection is persisted even when the runtime needs a restart,
            // so re-read the profile instead of assuming the new state locally.
            return refresh();
          })
          .catch((error) => {
            note(row.name, { text: messageOf(error), tone: 'error' });
          })
          .then(() => {
            if (mounted.current) setPendingName(undefined);
          });
      };

      const onConfirmUninstall = (row) => {
        if (pendingName !== undefined) return;
        setConfirmingName(undefined);
        setPendingName(row.name);
        note(row.name, undefined);
        Promise.resolve()
          .then(() => withTimeout(props.removeBundle(row.name), 180000, 'pluginManager/removeBundle'))
          .then((result) => {
            note(row.name, describeChange(result, t));
            return refresh();
          })
          .catch((error) => {
            note(row.name, { text: messageOf(error), tone: 'error' });
          })
          .then(() => {
            if (mounted.current) setPendingName(undefined);
          });
      };

      const needle = query.trim().toLowerCase();
      const installed = bundles.filter((row) => row.installed !== false);
      const shownBundles = installed.filter((row) => matches(needle, [row.title, row.name, row.description, row.source]));
      const skills = skillState.status === 'ready' && Array.isArray(skillState.skills) ? skillState.skills : [];
      const shownSkills = skills.filter((row) => matches(needle, [row.name, row.description, row.source, row.provider, row.path]));

      const bundleNotice = (() => {
        if (failure !== undefined) return { text: t('loadFailed') + ': ' + failure, tone: 'error' };
        if (!managed) return { text: t('unavailable'), tone: 'warn' };
        return undefined;
      })();

      const skillNotice = (() => {
        if (skillState.status === 'no-session') return { text: t('skillsNoSession'), tone: 'info' };
        if (skillState.status === 'unavailable') return { text: t('skillsUnavailable'), tone: 'info' };
        if (skillState.status === 'failed') return { text: t('skillsFailed') + (skillState.message === undefined ? '' : ': ' + skillState.message), tone: 'error' };
        return undefined;
      })();

      const diagInfo = (() => {
        try {
          return typeof props.diagnostics === 'function' ? props.diagnostics() : undefined;
        } catch (error) {
          return { error: messageOf(error) };
        }
      })();
      const diagText = describeDiagnostics(diagInfo, installed.length, skills.length, skillState, busy);
      const diagBad = failure !== undefined || diagText.indexOf('MISSING') !== -1 || !managed;

      const bundleSection = h(
        'section',
        { className: 'dsh-inv-section', 'aria-label': t('plugins') },
        sectionHead(t('plugins'), shownBundles.length, installed.length),
        bundleNotice === undefined
          ? null
          : h('p', { className: 'dsh-inv-note dsh-inv-note--' + bundleNotice.tone }, bundleNotice.text),
        busy && installed.length === 0
          ? h('div', { className: 'dsh-inv-skeleton', 'aria-hidden': 'true' })
          : shownBundles.length === 0
            ? h('p', { className: 'dsh-inv-note' }, installed.length === 0 ? t('loadedNone') : t('filterEmpty'))
            : h(
                'ul',
                { className: 'dsh-inv-list' },
                shownBundles.map((row) =>
                  h(BundleListItem, {
                    key: row.name,
                    row,
                    t,
                    pending: pendingName === row.name,
                    notice: notices[row.name],
                    confirming: confirmingName === row.name,
                    onToggle,
                    onUninstall: (target) => setConfirmingName(target.name),
                    onConfirm: onConfirmUninstall,
                    onCancel: () => setConfirmingName(undefined),
                  }),
                ),
              ),
      );

      const skillSection = h(
        'section',
        { className: 'dsh-inv-section', 'aria-label': t('skills') },
        sectionHead(t('skills'), shownSkills.length, skills.length),
        skillNotice === undefined
          ? null
          : h('p', { className: 'dsh-inv-note dsh-inv-note--' + skillNotice.tone }, skillNotice.text),
        skillState.status === 'loading'
          ? h('div', { className: 'dsh-inv-skeleton', 'aria-hidden': 'true' })
          : skillState.status === 'ready' && shownSkills.length === 0
            ? h('p', { className: 'dsh-inv-note' }, skills.length === 0 ? t('skillsNone') : t('skillsEmpty'))
            : skillState.status === 'ready'
              ? h('ul', { className: 'dsh-inv-list' }, shownSkills.map((row) => skillListItem(row, t)))
              : null,
        skillState.status === 'ready' && typeof skillState.sessionId === 'string'
          ? h('p', { className: 'dsh-inv-note' }, t('fromSession') + ' · ' + skillState.sessionId)
          : null,
      );

      return h(
        'div',
        { className: 'dsh-inv' },
        h(
          'div',
          { className: 'dsh-inv-head' },
          h(
            'div',
            { className: 'dsh-inv-heading' },
            h('h2', { className: 'dsh-inv-title' }, t('title')),
            h('p', { className: 'dsh-inv-subtitle' }, t('subtitle')),
          ),
          h(
            'div',
            { className: 'dsh-inv-row-controls' },
            busy
              ? h('button', { type: 'button', className: 'dsh-inv-btn', disabled: true }, t('refreshBusy'))
              : h('button', { type: 'button', className: 'dsh-inv-btn', onClick: refresh }, t('refresh')),
          ),
        ),
        h('input', {
          type: 'search',
          className: 'dsh-inv-search',
          value: query,
          placeholder: t('filter'),
          'aria-label': t('filter'),
          onChange: (event) => setQuery(event.target.value),
        }),
        phase === 'loading' && installed.length === 0 ? h('p', { className: 'dsh-inv-note' }, t('loading')) : null,
        bundleSection,
        skillSection,
        h('p', { className: diagBad ? 'dsh-inv-diag dsh-inv-diag--bad' : 'dsh-inv-diag' }, diagText),
      );
    }

    /** One-line state for the panel footer. */
    function describeDiagnostics(info, bundleCount, skillCount, skillState, busy) {
      const parts = [];
      if (info === undefined || info === null) {
        parts.push('diagnostics=unavailable');
      } else {
        parts.push('pluginManager=' + (info.hasManager ? 'yes' : 'MISSING'));
        parts.push('pluginInventory=' + (info.hasInventory ? 'yes' : 'MISSING'));
        parts.push('skillsRemote=' + (info.hasSkills ? 'yes' : 'MISSING'));
        parts.push('sessions=' + (info.hasSessions ? 'yes' : 'MISSING'));
        if (typeof info.remoteKeys === 'string' && info.remoteKeys.length > 0) parts.push('remoteKeys=[' + info.remoteKeys + ']');
        if (info.error !== undefined) parts.push('error=' + info.error);
      }
      parts.push('bundles=' + bundleCount);
      parts.push('skillRows=' + skillCount);
      parts.push('skillStatus=' + (skillState !== null && typeof skillState === 'object' && typeof skillState.status === 'string' ? skillState.status : '?'));
      parts.push('busy=' + (busy ? 'yes' : 'no'));
      return parts.join(' · ');
    }

    /**
     * Conversation-view body: the same panel inside the view shell that keeps
     * the docked composer clear and gives the list its own scroll region.
     * @param props - slot props carrying the injected operations and `t`.
     * @returns the view element tree.
     */
    function InventoryView(props) {
      const label = typeof props.t === 'function' ? props.t('title') : 'installed-inventory';
      return h(
        'div',
        { style: VIEW_ROOT, 'data-conversation-composer-overlay': '' },
        h('div', { style: VIEW_SCROLL, role: 'region', 'aria-label': label }, h('div', { style: VIEW_INNER }, h(InventoryPanel, props))),
      );
    }

    /**
     * Required Client services: the slot and locale registries, the session
     * directory, and the two Remote namespaces the plugin manager page itself
     * injects. The skill catalog is resolved per call, so a deployment without
     * it still shows the bundle list.
     */
    const inject = ['slots', 'locale', 'remote', 'remote.pluginManager', 'remote.pluginInventory', 'sessions'];

    /**
     * Client plugin body: register dictionaries and styles, then contribute the
     * view tab and the settings page.
     * @param ctx - client cordis context.
     */
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { en: DICTS.en, zh: DICTS.zh }), 'inventory-ad: dictionaries');

      ctx.effect(() => {
        const tag = document.createElement('style');
        tag.dataset.plugin = 'dsh-installed-inventory-ad';
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => {
          tag.remove();
        };
      }, 'inventory-ad: styles');

      const t = ctx.locale.bind(NS);

      /**
       * Resolve one Remote namespace, preferring the Cordis service the shipped
       * pages inject and falling back to the carrier property.
       * @param name - namespace name after `remote.`.
       * @returns the namespace object, or undefined.
       */
      const namespaceOf = (name) => {
        try {
          const service = typeof ctx.get === 'function' ? ctx.get('remote.' + name) : undefined;
          if (service !== undefined && service !== null) return service;
        } catch (error) {
          console.error('[inventory-ad] service lookup failed for remote.' + name, error);
        }
        try {
          const direct = ctx.remote === undefined || ctx.remote === null ? undefined : ctx.remote[name];
          if (direct !== undefined && direct !== null) return direct;
        } catch (error) {
          console.error('[inventory-ad] carrier lookup failed for remote.' + name, error);
        }
        return undefined;
      };

      /** Call one Remote method and unwrap its `{ ok, value }` envelope. */
      const callRemote = async (namespaceName, method, args, label) => {
        const namespace = namespaceOf(namespaceName);
        if (namespace === undefined || typeof namespace[method] !== 'function') {
          throw new Error(label + ' is not available in this deployment');
        }
        const result = await namespace[method](...(args || []));
        if (result === undefined || result === null || result.ok !== true) {
          const error = result === undefined || result === null ? undefined : result.error;
          const detail = error === undefined ? 'unknown failure' : String(error.code === undefined ? '' : error.code) + ' ' + String(error.message === undefined ? '' : error.message);
          throw new Error(label + ': ' + detail.trim());
        }
        return result.value;
      };

      /** Read the installed bundles and whether this Host manages a profile at all. */
      const readBundles = async () => {
        const inventory = await callRemote('pluginInventory', 'list', [], 'pluginInventory/list');
        if (inventory !== null && typeof inventory === 'object' && inventory.managementAvailable === false) {
          return { managed: false, bundles: [] };
        }
        const rows = await callRemote('pluginManager', 'listBundles', [], 'pluginManager/listBundles');
        const bundles = Array.isArray(rows) ? rows : [];
        // Only the profile's own dependencies: shipped and catalog-only bundles
        // belong to the installation, not to what this user installed.
        return { managed: true, bundles: bundles.filter((bundle) => bundle !== null && typeof bundle === 'object' && bundle.installed === true) };
      };

      /** Write the profile selection for one bundle. */
      const setBundleEnabled = (name, enabled) => callRemote('pluginManager', 'setBundleEnabled', [name, enabled], 'pluginManager/setBundleEnabled');

      /** Remove one bundle from the profile. */
      const removeBundle = (name) => callRemote('pluginManager', 'removeBundle', [name], 'pluginManager/removeBundle');

      /** Pick a retained session whose preset owns the catalog the reader sees. */
      const pickSessionId = () => {
        try {
          const sessions = ctx.sessions;
          const list = sessions === undefined ? undefined : sessions.list;
          if (list === undefined || typeof list.getSnapshot !== 'function') return undefined;
          const snapshot = list.getSnapshot();
          const byId = snapshot === undefined || snapshot === null ? undefined : snapshot.byId;
          if (byId === undefined || byId === null || typeof byId !== 'object') return undefined;
          const rows = Object.entries(byId);
          if (rows.length === 0) return undefined;
          let fallback;
          for (const [id, row] of rows) {
            if (fallback === undefined) fallback = id;
            const retained = row === null || row === undefined ? undefined : row.retainedBy;
            if (retained === undefined || retained === null) continue;
            if ((retained.mainView || 0) > 0) return id;
          }
          return fallback;
        } catch (error) {
          console.error('[inventory-ad] session lookup failed', error);
          return undefined;
        }
      };

      /** Read the skill catalog of one session. */
      const loadSkills = async () => {
        const namespace = namespaceOf('skills');
        if (namespace === undefined || typeof namespace.list !== 'function') return { status: 'unavailable' };
        const sessionId = pickSessionId();
        if (sessionId === undefined) return { status: 'no-session' };
        const result = await namespace.list({ sessionId });
        if (result === undefined || result === null || result.ok !== true) {
          const error = result === undefined || result === null ? undefined : result.error;
          return {
            status: 'failed',
            sessionId,
            message: error === undefined ? 'unknown failure' : String(error.code) + ': ' + String(error.message),
          };
        }
        const value = result.value === null || result.value === undefined ? {} : result.value;
        return { status: 'ready', sessionId, skills: Array.isArray(value.skills) ? value.skills : [] };
      };

      const resolveText = (text) => (typeof ctx.locale.resolveText === 'function' ? ctx.locale.resolveText(text) : undefined);

      /** Which capabilities this client actually exposes right now. */
      const diagnostics = () => {
        let remoteKeys = '';
        try {
          const carrier = ctx.remote;
          if (carrier !== undefined && carrier !== null) {
            remoteKeys = Object.keys(carrier).filter((key) => /plugin|skill|session/i.test(key)).join(',');
          }
        } catch (error) {
          remoteKeys = 'unreadable';
        }
        const has = (name, method) => {
          const namespace = namespaceOf(name);
          return namespace !== undefined && (method === undefined || typeof namespace[method] === 'function');
        };
        return {
          hasManager: has('pluginManager', 'listBundles'),
          hasInventory: has('pluginInventory', 'list'),
          hasSkills: has('skills', 'list'),
          hasSessions: !!(ctx.sessions && ctx.sessions.list),
          remoteKeys,
        };
      };

      const injected = () => ({ readBundles, setBundleEnabled, removeBundle, loadSkills, resolveText, diagnostics });

      // ① Conversation view tab, right after the derived view tabs: Chat |
      // Trajectory | Statistics | mcp-visualizer | Installed.
      try {
        ctx.slots.inject(VIEW_SLOT, () =>
          ctx.slots.register(
            { name: VIEW_SLOT, id: TAB_ID, order: VIEW_ORDER, label: () => t('tab'), locale: NS, inject: injected },
            guarded(InventoryView),
          ),
        );
      } catch (error) {
        console.error('[inventory-ad] view tab registration failed', error);
      }

      // ② The same panel as a page in the Built-in plugins settings section.
      try {
        ctx.slots.inject(SLOT, () =>
          ctx.slots.register(
            { name: SLOT, id: TAB_ID, order: SETTINGS_ORDER, label: () => t('tab'), locale: NS, inject: injected },
            guarded(InventoryPanel),
          ),
        );
      } catch (error) {
        console.error('[inventory-ad] settings tab registration failed', error);
      }
    }

    return { inject, apply };
  },
});
