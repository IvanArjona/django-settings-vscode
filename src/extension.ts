import * as vscode from "vscode";
import { DjangoSettingsTreeDataProvider } from "./providers/tree-data-provider";
import { DjangoSettingsProvider } from "./providers/settings";

export async function activate(context: vscode.ExtensionContext) {
  await initSleep();
  const settingsProvider = new DjangoSettingsProvider();
  await settingsProvider.sync();

  const treeDataProvider = new DjangoSettingsTreeDataProvider(settingsProvider);
  vscode.window.registerTreeDataProvider(
    "django-settings.list",
    treeDataProvider,
  );
}

// This method is called when your extension is deactivated
export async function deactivate() {}

async function initSleep(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 5000));
}
