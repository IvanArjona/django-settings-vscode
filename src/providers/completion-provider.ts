import * as vscode from "vscode";
import { DjangoSettingsProvider } from "./settings-provider";
import type { SettingsSymbol, Subscriber } from "../types";

export class DjangoSettingsCompletionProvider implements vscode.CompletionItemProvider, Subscriber {
  #completionItems: vscode.CompletionItem[] = [];

  constructor(private settingsProvider: DjangoSettingsProvider) {}

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext,
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);
    if (!linePrefix.endsWith("settings.")) {
      return undefined;
    }
    return this.#completionItems;
  }

  private getCompletionItems(symbols: SettingsSymbol[]): vscode.CompletionItem[] {
    const completionItems: vscode.CompletionItem[] = [];

    for (const symbol of symbols) {
      if (symbol.kind !== vscode.SymbolKind.File) {
        const completionItem = new vscode.CompletionItem(symbol.name, vscode.CompletionItemKind.Variable);
        completionItem.detail = symbol.detail;
        completionItems.push(completionItem);
      }
      completionItems.push(...this.getCompletionItems(symbol.children));
    }

    return completionItems;
  }

  private filterDuplicates(completionItems: vscode.CompletionItem[]): vscode.CompletionItem[] {
    const included = new Set<string | vscode.CompletionItemLabel>();
    return completionItems.filter((item) => {
      if (included.has(item.label)) {
        return false;
      }
      included.add(item.label);
      return true;
    });
  }

  refresh(): void {
    const completionItems = this.getCompletionItems(this.settingsProvider.settings);
    this.#completionItems = this.filterDuplicates(completionItems);
  }
}
