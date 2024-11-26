import * as vscode from "vscode";
import { DjangoSettingsProvider } from "./settings-provider";

export class DjangoSettingsDefinitionProvider implements vscode.DefinitionProvider {
  constructor(private settingsProvider: DjangoSettingsProvider) {}

  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Definition | vscode.DefinitionLink[]> {
    const range = document.getWordRangeAtPosition(position, /settings\.\w+/);
    if (!range) {
      return undefined;
    }

    const name = document.getText(range).split(".")[1];
    const symbols = this.settingsProvider.get(name);

    if (symbols instanceof Array) {
      return symbols.map((s) => s.location);
    }
    return symbols?.location;
  }
}
