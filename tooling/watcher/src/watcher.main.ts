import chokidar from 'chokidar';
import { debounce } from 'lodash';
import { getCurrentPackageCwd, getCurrentPackageSourceDirs, getDependencyPaths } from './utils/package.utils';
import { getWatcherConfig } from './watcher.config';
import { build, start, stopAllProcesses } from './watcher.processes';

const cwd = getCurrentPackageCwd();
const config = getWatcherConfig();

const paths = {
  source: getCurrentPackageSourceDirs(),
  dependencies: getDependencyPaths(cwd, config),
};

const watchers = {
  source: chokidar.watch(paths.source, { ignoreInitial: true }),
  dependencies: chokidar.watch(paths.dependencies, { ignoreInitial: true }),
};

const closeWatchers = async () => {
  await Promise.all(Object.values(watchers).map((w) => w.close()));
};

const withPathFilter = (event: () => any) => async (_: string, path: string) => {
  const ignored = config.ext.every((ext) => !path.endsWith(`.${ext}`));

  if (ignored) {
    return;
  }

  await event();
};

const events = {
  onReady: async () => {
    await start(config);
  },

  onExit: async () => {
    await closeWatchers();
    await stopAllProcesses();

    process.exit(0);
  },

  onSourceChange: withPathFilter(
    debounce(async () => {
      if (config.disableEvents?.sourceChange) {
        return;
      }

      const buildSucceeded = await build(config);

      if (!buildSucceeded) {
        return;
      }

      await start(config);
    }, config.delay)
  ),

  onDependencyChange: withPathFilter(
    debounce(async () => {
      if (config.disableEvents?.dependencyChange) {
        return;
      }

      const buildSucceeded = config.rebuildOnDependencyChange ? await build(config) : true;

      if (!buildSucceeded) {
        return;
      }

      await start(config);
    }, config.delay)
  ),
};

watchers.source.on('ready', events.onReady);
watchers.source.on('all', events.onSourceChange);
watchers.dependencies.on('all', events.onDependencyChange);

process.on('SIGINT', events.onExit);
process.on('SIGTERM', events.onExit);
