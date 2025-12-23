import { ChildProcess, spawn } from 'child_process';
import treeKill from 'tree-kill';

export const killProcess = async (pid: number | undefined) =>
  new Promise<void>((resolve) => {
    if (!pid) {
      return resolve();
    }

    treeKill(pid, 'SIGKILL', (error) => {
      if (error) {
        console.error(`Failed to kill process with PID (${pid}):`, error);
      }

      resolve();
    });
  });

export const waitUntilFinished = async (proc: ChildProcess): Promise<number | null> => {
  return new Promise((resolve) => {
    proc.on('exit', (code) => {
      resolve(code);
    });
  });
};

export const run = (command: string, cwd: string) => {
  const [executable, ...args] = command.split(' ').filter(Boolean);

  const proc = spawn(executable!, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  proc.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  proc.stderr.on('data', (data) => {
    // Skip pnpm return error logs:
    if (data.toString().includes('ELIFECYCLE')) {
      return;
    }

    process.stdout.write(data);
  });

  return proc;
};
