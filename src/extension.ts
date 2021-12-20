import { registerTreeViews } from './tree-view-providers/tree-view-registration';
import { registerCommands } from './commands/commands-registration';
import { globalState } from './services/global-state';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { accountService } from './services/account.service';
import { beginListenConfigurationChangeEvent } from './services/check-workspace';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    globalState.extensionContext = context;
    accountService.setIsAuthorizedToContext();
    context.subscriptions.push(accountService);

    registerCommands();
    registerTreeViews();
    beginListenConfigurationChangeEvent();
}

// this method is called when your extension is deactivated
export function deactivate() {}
