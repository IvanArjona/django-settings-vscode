import * as vscode from "vscode";
import { DjangoSettingsProvider } from "./settings-provider";
import type { SettingsSymbol, Subscriber } from "../types";
import { SYMBOL_KIND_ICONS } from "../constants";

class DjangoSettingsTreeItem extends vscode.TreeItem {
  constructor(private readonly settings: SettingsSymbol) {
    super(settings.name, vscode.TreeItemCollapsibleState.None);

    this.collapsibleState = this.getCollapsibleState();
    this.iconPath = new vscode.ThemeIcon(this.getIcon());
    vscode.commands.executeCommand("vscode.open", settings.location);
    this.command = {
      command: "vscode.open",
      title: "Open",
      arguments: [
        settings.location.uri,
        {
          selection: settings.location.range,
        },
      ],
    };
  }

  getCollapsibleState(): vscode.TreeItemCollapsibleState {
    return this.settings.children.length === 0
      ? vscode.TreeItemCollapsibleState.None
      : vscode.TreeItemCollapsibleState.Collapsed;
  }

  getIcon(): string {
    return SYMBOL_KIND_ICONS[this.settings.kind] || "symbol-varialbe";
  }
}

export class DjangoSettingsTreeDataProvider implements vscode.TreeDataProvider<SettingsSymbol>, Subscriber {
  constructor(private settingsProvider: DjangoSettingsProvider) {}

  private changeEvent = new vscode.EventEmitter<void>();

  get onDidChangeTreeData(): vscode.Event<void> {
    return this.changeEvent.event;
  }

  getTreeItem(element: SettingsSymbol): vscode.TreeItem {
    return new DjangoSettingsTreeItem(element);
  }

  getChildren(element?: SettingsSymbol): SettingsSymbol[] {
    if (element !== undefined) {
      return element.children;
    }

    return this.settingsProvider.settings;
  }

  refresh(): void {
    this.changeEvent.fire();
  }
}
