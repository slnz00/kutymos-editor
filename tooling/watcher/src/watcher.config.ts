import { getCurrentPackageCwd, getPackageName } from "./utils/package.utils";

type BasePath = string;
type PackagePrefix = string;
type PackageName = string;

export type DependencyMap = Record<PackagePrefix, BasePath>;

export interface WatcherConfig {
  exec: {
    build: string;
    start?: string;
  };
  disableEvents?: {
    sourceChange?: boolean;
    dependencyChange?: boolean;
  };
  ext: string[];
  delay: number;
  dependencies?: DependencyMap;
  skipDependencies?: string[];
  rebuildOnDependencyChange?: boolean;
}

type PackageOverrides = Record<PackageName, Partial<WatcherConfig>>;

const configs: Record<
  string,
  WatcherConfig & { overrides?: PackageOverrides }
> = {
  "@apps": {
    exec: {
      build: "pnpm build:dev",
      start: "pnpm start:dev",
    },
    dependencies: {
      "@packages/": "../../packages/",
    },
    ext: ["ts", "js"],
    delay: 500,
    overrides: {
      "@apps/editor": {
        disableEvents: {
          sourceChange: true,
        },
      },
    },
  },
  "@packages": {
    exec: {
      build: "pnpm build:dev",
    },
    ext: ["ts", "json"],
    delay: 500,
  },
};

export const getWatcherConfig = (): WatcherConfig => {
  const cwd = getCurrentPackageCwd();
  const packageName = getPackageName(cwd);

  const type = Object.keys(configs).find((prefix) =>
    packageName.startsWith(prefix),
  );

  if (!type) {
    throw new Error(`Watcher config does not exist for: ${packageName}`);
  }

  const baseConfig = configs[type]!;
  const overrides = baseConfig.overrides?.[packageName] ?? {};

  return {
    ...baseConfig,
    ...overrides,
  };
};
