import * as vscode from "vscode";
import { DjangoSettingsProvider } from "./settings";
import type { SettingsFile, Subscriber } from "../types";

class DjangoSettingsTreeItem extends vscode.TreeItem {
  constructor(private readonly settings: vscode.DocumentSymbol | SettingsFile) {
    super(settings.name, vscode.TreeItemCollapsibleState.None);
    this.collapsibleState = this.getCollapsibleState();
  }

  isSymbol(settings: any): settings is vscode.DocumentSymbol {
    return "kind" in settings;
  }

  getCollapsibleState(): vscode.TreeItemCollapsibleState {
    return this.isSymbol(this.settings)
      ? vscode.TreeItemCollapsibleState.None
      : vscode.TreeItemCollapsibleState.Collapsed;
  }

  getChildren(): DjangoSettingsTreeItem[] {
    if (this.isSymbol(this.settings)) {
      return [];
    }

    return this.settings.symbols.map((symbol) => new DjangoSettingsTreeItem(symbol));
  }
}

export class DjangoSettingsTreeDataProvider implements vscode.TreeDataProvider<DjangoSettingsTreeItem>, Subscriber {
  constructor(private settingsProvider: DjangoSettingsProvider) {}

  private changeEvent = new vscode.EventEmitter<void>();

  get onDidChangeTreeData(): vscode.Event<void> {
    return this.changeEvent.event;
  }

  getTreeItem(element: DjangoSettingsTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DjangoSettingsTreeItem): DjangoSettingsTreeItem[] {
    if (element !== undefined) {
      return element.getChildren();
    }

    const settings = this.settingsProvider.settings;
    return Object.keys(settings).map((settingFile) => new DjangoSettingsTreeItem(settings[settingFile]));
  }

  refresh(): void {
    this.changeEvent.fire();
  }
}
