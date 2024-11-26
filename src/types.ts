import * as vscode from "vscode";

export interface Subscriber {
  refresh: () => void;
}

export interface Publisher {
  subscribe: (subscriber: Subscriber) => void;
  notifySubscribers: () => void;
}

export interface SettingsSymbol {
  name: string;
  containerName: string;
  detail: string;
  kind: vscode.SymbolKind;
  location: vscode.Location;
  children: SettingsSymbol[];
}
