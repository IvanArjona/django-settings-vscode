import * as vscode from "vscode";

export interface SettingsFile {
  name: string;
  uri: vscode.Uri;
  symbols: vscode.DocumentSymbol[];
}

export interface SettingsFiles {
  [name: string]: SettingsFile;
}

export interface Subscriber {
  refresh: () => void;
}

export interface Publisher {
  subscribe: (subscriber: Subscriber) => void;
  notifySubscribers: () => void;
}
