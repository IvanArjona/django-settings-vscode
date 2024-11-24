import * as vscode from "vscode";

export interface Setting {
  key: string;
  value: string;
}

export interface SettingsFile {
  key: string;
  file: vscode.Uri;
  settings: Setting[];
}
