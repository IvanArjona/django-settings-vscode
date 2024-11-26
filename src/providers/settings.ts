import * as vscode from "vscode";
const path = require("path");

import type { Publisher, SettingsFiles, Subscriber } from "../types";
import { ALLOWED_SYMBOLS } from "../constants";

export class DjangoSettingsProvider implements Publisher {
  #settings: SettingsFiles = {};
  #subscribers: Subscriber[] = [];
  #watchers: vscode.FileSystemWatcher[] = [];

  get settings(): SettingsFiles {
    return this.#settings;
  }

  async refresh(uri: vscode.Uri): Promise<void> {
    try {
      const documentSymbols = await this.getSymbolsFromFile(uri);
      const name = path.basename(uri.fsPath);
      if (!documentSymbols.length) {
        return;
      }
      this.settings[name] = { name, uri, symbols: documentSymbols };
      this.notifySubscribers();
    } catch (error) {
      console.error(error);
    }
  }

  async removeSettingsFile(uri: vscode.Uri): Promise<void> {
    const name = path.basename(uri.fsPath);
    delete this.#settings[name];
    this.notifySubscribers();
  }

  public async refreshAll(): Promise<void> {
    const refreshPromises = Object.values(this.#settings).map(({ uri }) => this.refresh(uri));
    await Promise.all(refreshPromises);
  }

  public async setup(): Promise<void> {
    const projectRoot = await this.getProjectRoot();
    const workspaceFolders = vscode.workspace.workspaceFolders || [];

    for (const folder of workspaceFolders) {
      const uri = folder.uri;
      const relativePath = path.join(uri.fsPath, projectRoot);
      const globPattern = new vscode.RelativePattern(relativePath, "**/settings{.py,/**/*.py}");

      const watcher = vscode.workspace.createFileSystemWatcher(globPattern);
      watcher.onDidChange(async (eventUri: vscode.Uri) => await this.refresh(eventUri));
      watcher.onDidCreate(async (eventUri: vscode.Uri) => await this.refresh(eventUri));
      watcher.onDidDelete(async (eventUri: vscode.Uri) => await this.removeSettingsFile(eventUri));

      const files = await vscode.workspace.findFiles(globPattern);
      const refreshPromises = files.map((file) => this.refresh(file));
      await Promise.all(refreshPromises);
    }
  }

  async getProjectRoot(): Promise<string> {
    const config = vscode.workspace.getConfiguration("django-settings");
    const projectRoot = config.get<string>("projectRoot", "");
    return projectRoot;
  }

  async getSymbolsFromFile(uri: vscode.Uri): Promise<vscode.DocumentSymbol[]> {
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      "vscode.executeDocumentSymbolProvider",
      uri,
    );

    if (!symbols) {
      return [];
    }
    return symbols.filter((symbol) => ALLOWED_SYMBOLS.includes(symbol.kind));
  }

  subscribe(subscriber: Subscriber): void {
    this.#subscribers.push(subscriber);
    this.notifySubscribers();
  }

  notifySubscribers(): void {
    this.#subscribers.forEach((subscriber) => subscriber.refresh());
  }

  async deactivate(): Promise<void> {
    const disposePromises = this.#watchers.map((watcher) => watcher.dispose());
    await Promise.all(disposePromises);
  }
}
