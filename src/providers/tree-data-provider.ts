import * as vscode from "vscode";
import { DjangoSettingsProvider } from "./settings";
import type { Setting, SettingsFile } from "../types";

class DjangoSettingsTreeItem extends vscode.TreeItem {
  constructor(private readonly settings: Setting | SettingsFile) {
    super(settings.key, vscode.TreeItemCollapsibleState.None);
    this.collapsibleState = this.getCollapsibleState();
  }

  isSetting(settings: any): settings is Setting {
    return "value" in settings;
  }

  getCollapsibleState(): vscode.TreeItemCollapsibleState {
    return this.isSetting(this.settings)
      ? vscode.TreeItemCollapsibleState.None
      : vscode.TreeItemCollapsibleState.Collapsed;
  }

  getChildren(): DjangoSettingsTreeItem[] {
    if (this.isSetting(this.settings)) {
      return [];
    }

    return this.settings.settings.map(
      (setting) => new DjangoSettingsTreeItem(setting),
    );
  }
}

export class DjangoSettingsTreeDataProvider
  implements vscode.TreeDataProvider<DjangoSettingsTreeItem>
{
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
    return settings.map(
      (settingFile) => new DjangoSettingsTreeItem(settingFile),
    );
  }

  refresh(): void {
    this.changeEvent.fire();
  }
}
