import * as vscode from "vscode";
import { DjangoSettingsTreeDataProvider } from "./providers/tree-data-provider";
import { DjangoSettingsProvider } from "./providers/settings-provider";
import { DjangoSettingsCompletionProvider } from "./providers/completion-provider";
import { PYTHON_DOCUMENT_SELECTOR } from "./constants";

const settingsProvider = new DjangoSettingsProvider();

export async function activate(context: vscode.ExtensionContext) {
  await initSleep();

  // Initialize the settings provider
  await settingsProvider.setup();

  // Register the refresh command
  const refreshCommand = vscode.commands.registerCommand("django-settings.refresh", async () => {
    await settingsProvider.refreshAll();
  });
  context.subscriptions.push(refreshCommand);

  // Register the tree view
  const treeDataProvider = new DjangoSettingsTreeDataProvider(settingsProvider);
  vscode.window.registerTreeDataProvider("django-settings.list", treeDataProvider);

  // Register completion provider
  const completionProvider = new DjangoSettingsCompletionProvider(settingsProvider);
  vscode.languages.registerCompletionItemProvider(PYTHON_DOCUMENT_SELECTOR, completionProvider, ".");

  // Subscribe to changes in the settings provider
  settingsProvider.subscribe(treeDataProvider);
  settingsProvider.subscribe(completionProvider);
}

// This method is called when your extension is deactivated
export async function deactivate() {
  await settingsProvider.deactivate();
}

async function initSleep(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 5000));
}
