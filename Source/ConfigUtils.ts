import * as vscode from "vscode";

/**
 * Gets a configuration value from VS Code workspace settings.
 * This is a type-safe wrapper around vscode.workspace.getConfiguration().get().
 */
export function getConfigValue<T>(
  configSection: string,
  key: string,
  defaultValue: T
): T {
  return vscode.workspace.getConfiguration(configSection).get<T>(key, defaultValue);
}
