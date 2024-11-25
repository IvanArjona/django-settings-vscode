import * as vscode from "vscode";

export interface SettingsFile {
  name: string;
  file: vscode.Uri;
  symbols: vscode.DocumentSymbol[];
}
