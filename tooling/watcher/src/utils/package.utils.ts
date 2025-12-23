import { uniq } from "lodash";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { WatcherConfig } from "../watcher.config";

const readJsonFile = (filePath: string) => {
  return JSON.parse(readFileSync(filePath, "utf-8"));
};

export const getPackageName = (packagePath: string): string => {
  const packageJson = readJsonFile(path.join(packagePath, "package.json"));

  return packageJson.name ?? "";
};

export const getCurrentPackageCwd = () => {
  if (!process.env.INIT_CWD) {
    throw new Error("INIT_CWD environment variable is required");
  }

  return process.env.INIT_CWD;
};

export const getCurrentPackageSourceDir = (srcPath = "src") => {
  return path.resolve(getCurrentPackageCwd(), srcPath);
};

export const getCurrentPackageSourceDirs = (
  srcPaths = ["src", "cmd", "internal"],
) => {
  return srcPaths.map(getCurrentPackageSourceDir);
};

export const getDependencyPaths = (
  packagePath: string,
  config: WatcherConfig,
  results: Record<string, string> = {},
): string[] => {
  const cwd = getCurrentPackageCwd();
  const packageJson = readJsonFile(path.join(packagePath, "package.json"));
  const dependencies = Object.keys(packageJson.dependencies ?? {});
  const dependencyMap = config.dependencies ?? {};
  const skipDependencies = config.skipDependencies ?? [];

  dependencies.forEach((depName) => {
    Object.entries(dependencyMap).forEach(([depPrefix, depBasePath]) => {
      const alreadyProcessed = results[depName];
      const shouldSkip = skipDependencies.some((skipDep) =>
        depName.startsWith(skipDep),
      );

      if (!depName.startsWith(depPrefix) || alreadyProcessed || shouldSkip) {
        return;
      }

      const depDirName = depName.slice(depPrefix.length);
      const depPackagePath = path.resolve(cwd, depBasePath, depDirName);
      const depDistPath = path.join(depPackagePath, "dist");

      results[depName] = depDistPath;

      getDependencyPaths(depPackagePath, config, results);
    });
  });

  return uniq(Object.values(results));
};
