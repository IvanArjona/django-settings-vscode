import * as vscode from "vscode";

export const ALLOWED_SYMBOLS: vscode.SymbolKind[] = [
  vscode.SymbolKind.Method,
  vscode.SymbolKind.Field,
  vscode.SymbolKind.Enum,
  vscode.SymbolKind.Function,
  vscode.SymbolKind.Variable,
  vscode.SymbolKind.Constant,
  vscode.SymbolKind.Array,
  vscode.SymbolKind.Object,
];
