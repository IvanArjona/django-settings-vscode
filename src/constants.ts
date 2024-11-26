import * as vscode from "vscode";

export const ALLOWED_SYMBOLS: vscode.SymbolKind[] = [
  vscode.SymbolKind.File,
  vscode.SymbolKind.Method,
  vscode.SymbolKind.Field,
  vscode.SymbolKind.Enum,
  vscode.SymbolKind.Function,
  vscode.SymbolKind.Variable,
  vscode.SymbolKind.Constant,
  vscode.SymbolKind.Array,
  vscode.SymbolKind.Object,
];

export const SYMBOL_KIND_ICONS: Partial<{ [key in vscode.SymbolKind]: string }> = {
  [vscode.SymbolKind.File]: "file",
  [vscode.SymbolKind.Method]: "method",
  [vscode.SymbolKind.Field]: "field",
  [vscode.SymbolKind.Enum]: "enum",
  [vscode.SymbolKind.Function]: "function",
  [vscode.SymbolKind.Variable]: "variable",
  [vscode.SymbolKind.Constant]: "constant",
  [vscode.SymbolKind.Array]: "array",
  [vscode.SymbolKind.Object]: "object",
};

export const PYTHON_DOCUMENT_SELECTOR: vscode.DocumentSelector = { language: "python", scheme: "file" };
