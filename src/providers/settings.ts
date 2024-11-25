import * as vscode from "vscode";
const path = require("path");

import type { Publisher, SettingsFile, Subscriber } from "../types";
import { ALLOWED_SYMBOLS } from "../constants";

export class DjangoSettingsProvider implements Publisher {
  #symbols: vscode.DocumentSymbol[] = [];
  #settings: SettingsFile[] = [];
  #subscribers: Subscriber[] = [];

  public async refresh(): Promise<void> {
    const settingsFiles = await this.getSettingsFiles();
    const settings: SettingsFile[] = [];
    const symbols: vscode.DocumentSymbol[] = [];

    for (const file of settingsFiles) {
      const documentSymbols = await this.getSymbolsFromFile(file);
      const name = path.basename(file.fsPath);
      if (!documentSymbols.length) {
        continue;
      }
      symbols.push(...documentSymbols);
      settings.push({ file, name, symbols: documentSymbols });
    }

    this.#symbols = symbols;
    this.#settings = settings;
    this.notifySubscribers();
  }

  get symbols(): vscode.DocumentSymbol[] {
    return this.#symbols;
  }

  get settings(): SettingsFile[] {
    return this.#settings;
  }

  async getProjectRoot(): Promise<string> {
    const config = vscode.workspace.getConfiguration("django-settings");
    const projectRoot = config.get<string>("projectRoot", "");
    return projectRoot;
  }

  async getSettingsFiles(): Promise<vscode.Uri[]> {
    const projectRoot = await this.getProjectRoot();
    const workspaceFolders = vscode.workspace.workspaceFolders || [];
    const settingsFiles: vscode.Uri[] = [];

    for (const folder of workspaceFolders) {
      const workspacePath = folder.uri.fsPath;
      const relativePath = path.join(workspacePath, projectRoot);
      const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(relativePath, "**/settings{.py,/**/*.py}"),
      );
      settingsFiles.push(...files);
    }

    return settingsFiles;
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
}
