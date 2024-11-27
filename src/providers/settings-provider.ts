import * as vscode from "vscode";
const path = require("path");

import type { Publisher, SettingsSymbol, Subscriber } from "../types";
import { ALLOWED_SYMBOLS } from "../constants";

export class DjangoSettingsProvider implements Publisher {
  #settings: SettingsSymbol[] = [];
  #settingsMap: Map<string, SettingsSymbol[]> = new Map();
  #subscribers: Subscriber[] = [];
  #watchers: vscode.FileSystemWatcher[] = [];

  get settings(): SettingsSymbol[] {
    return this.#settings;
  }

  get(name: string): SettingsSymbol | SettingsSymbol[] | undefined {
    const symbols = this.#settingsMap.get(name);
    if (symbols === undefined) {
      return undefined;
    }
    return symbols.length === 1 ? symbols[0] : symbols;
  }

  async refresh(uri: vscode.Uri): Promise<void> {
    const documentSymbols = await this.getSymbolsFromFile(uri);
    const name = path.basename(uri.fsPath);
    if (!documentSymbols.length) {
      return;
    }
    const fileRange = new vscode.Range(0, 0, 0, 0);
    const fileSymbol: SettingsSymbol = {
      name: name,
      containerName: "",
      detail: "",
      kind: vscode.SymbolKind.File,
      location: new vscode.Location(uri, fileRange),
      children: documentSymbols,
    };
    fileSymbol.children = documentSymbols;

    await this.removeSettingsFile(name, false);
    this.#settings.push(fileSymbol);
    await this.setSettingsMap();
    this.notifySubscribers();
  }

  async setSettingsMap(): Promise<void> {
    const settingsMap = new Map<string, SettingsSymbol[]>();

    for (const setting of this.#settings) {
      for (const child of setting.children) {
        const symbols = settingsMap.get(child.name) || [];
        settingsMap.set(child.name, [...symbols, child]);
      }
    }

    this.#settingsMap = settingsMap;
  }

  async removeSettingsFile(name: string, notify: boolean = true): Promise<void> {
    this.#settings = this.#settings.filter((setting) => setting.name !== name);

    if (notify) {
      this.notifySubscribers();
    }
  }

  public async refreshAll(): Promise<void> {
    const refreshPromises = this.#settings.map((symbol) => this.refresh(symbol.location.uri));
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
      watcher.onDidDelete(
        async (eventUri: vscode.Uri) => await this.removeSettingsFile(path.basename(eventUri.fsPath)),
      );

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

  async getSymbolsFromFile(uri: vscode.Uri): Promise<SettingsSymbol[]> {
    const symbols = await vscode.commands.executeCommand<SettingsSymbol[]>(
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
