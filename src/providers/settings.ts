import * as vscode from "vscode";
const path = require("path");

import type { Setting, SettingsFile } from "../types";

export class DjangoSettingsProvider {
  #settings: SettingsFile[] = [];

  public async sync(): Promise<void> {
    const settingsFiles = await this.getSettingsFiles();
    const settings: SettingsFile[] = [];

    for (const file of settingsFiles) {
      const fileSettings = await this.getSettingsFromFile(file);
      const fileName = path.basename(file.fsPath);
      settings.push({ key: fileName, file, settings: fileSettings });
    }

    this.#settings = settings;
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

  async getSettingsFromFile(uri: vscode.Uri): Promise<Setting[]> {
    const document = await vscode.workspace.openTextDocument(uri);
    const text = document.getText();
    const settings: Setting[] = [];

    const regex = /([A-Z_]+)\s*=\s*['"](.*)['"]/g;
    let match;
    while ((match = regex.exec(text))) {
      const key = match[1];
      const value = match[2];
      settings.push({ key, value });
    }

    return settings;
  }
}
