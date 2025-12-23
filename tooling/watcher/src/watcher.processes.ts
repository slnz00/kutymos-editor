import chalk from 'chalk';
import type { ChildProcess } from 'child_process';
import { getCurrentPackageCwd } from './utils/package.utils';
import { killProcess, run, waitUntilFinished } from './utils/process.utils';
import { WatcherConfig } from './watcher.config';

const state = {
  processes: {
    build: null as ChildProcess | null,
    start: null as ChildProcess | null,
  },
  inProgress: false,
};

type ProcessType = keyof (typeof state)['processes'];

const stopProcess = async (type: ProcessType) => {
  const process = state.processes[type];

  if (!process) {
    return;
  }

  process.removeAllListeners();
  process.stdout?.removeAllListeners();
  process.stderr?.removeAllListeners();

  await killProcess(process.pid);

  state.processes[type] = null;
};

const withGuard =
  <T = void>(type: ProcessType, exec: (config: WatcherConfig) => Promise<T>) =>
  async (config: WatcherConfig) => {
    if (state.inProgress) {
      return;
    }

    state.inProgress = true;

    try {
      await stopProcess(type);

      return await exec(config);
    } catch (error) {
      console.error(chalk.red(`Failed to execute ${type}:`, error));
    } finally {
      state.inProgress = false;
    }
  };

export const build = withGuard('build', async (config) => {
  const cwd = getCurrentPackageCwd();

  await stopProcess('start');

  state.processes.build = run(config.exec.build, cwd);

  const code = await waitUntilFinished(state.processes.build);
  const success = [null, 0].includes(code);

  if (!success) {
    console.log(chalk.red(`\nWatcher: build failed (${code}), waiting for changes before restart...\n`));
  }

  return success;
});

export const start = withGuard('start', async (config) => {
  if (!config.exec.start) {
    return;
  }

  const cwd = getCurrentPackageCwd();

  state.processes.start = run(config.exec.start, cwd);

  state.processes.start.on('exit', (code) => {
    if (code === 0) {
      console.log(chalk.blue(`\nWatcher: clean exit, waiting for changes before restart...\n`));
    } else {
      console.log(chalk.red(`\nWatcher: crashed - waiting for changes before restart...\n`));
    }
  });
});

export const stopAllProcesses = async () =>
  Promise.all(Object.keys(state).map((type) => stopProcess(type as ProcessType)));
