import * as vscode from "vscode";

export interface SettingsFile {
  name: string;
  file: vscode.Uri;
  symbols: vscode.DocumentSymbol[];
}

export interface Subscriber {
  refresh: () => void;
}

export interface Publisher {
  subscribe: (subscriber: Subscriber) => void;
  notifySubscribers: () => void;
}
