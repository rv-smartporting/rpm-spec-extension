/***************************************************************************************
 * Copyright (c) 2023 TCSE-ISCAS. All rights reserved.
 * RPM Spec Plugin is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 *
 * IfArch Macro Completion Provider of RPM Spec Plugin
 *
 * Author: Lightning Rainstorm <me@ldby.site>
 * Last Change: Apr 12, 2023
 **************************************************************************************/

import * as fs from "fs";
import * as vscode from "vscode";
import { BaseCompletionProvider } from "./baseProvider";
import { ClientLogger } from "../utils/log";

export class IfArchProvider implements BaseCompletionProvider {
    public name = "IfArchProvider";
    private _logger: ClientLogger;

    private _cachedInlineItems: vscode.InlineCompletionItem[] = [];
    private _cachedNormalItems: vscode.CompletionItem[] = [];
    private _cachedKeys: Set<string> = new Set();

    public constructor(context: vscode.ExtensionContext) {
        this._logger = ClientLogger.getLogger(this.name);

        this._logger.info("Loading rpm spec tmLanguage file...");
        const specLangJsonPath = vscode.Uri.joinPath(context.extensionUri, "resource/rpmspec.tmLanguage.json");
        const specLangJson = JSON.parse(fs.readFileSync(specLangJsonPath.fsPath, { encoding: "utf-8" }));
        let archValues: string = specLangJson.repository.archValues.match;
        let archShortcuts: string = specLangJson.repository.archShortcuts.match;
        archValues = archValues.substring(3, archValues.length - 3);
        archShortcuts = archShortcuts.substring(4, archShortcuts.length - 3);
        for (const archValue of archValues.split("|")) {
            if (this._cachedKeys.has(archValue)) {
                continue;
            }
            this._cachedKeys.add(archValue);
            this._cachedInlineItems.push(new vscode.InlineCompletionItem(archValue));
            this._cachedNormalItems.push(new vscode.CompletionItem(archValue, vscode.CompletionItemKind.Class));
        }
        for (const archShortcutInner of archShortcuts.split("|")) {
            const archShortcut = "%{".concat(archShortcutInner, "}");
            if (this._cachedKeys.has(archShortcut)) {
                continue;
            }
            this._cachedKeys.add(archShortcut);
            this._cachedInlineItems.push(new vscode.InlineCompletionItem(archShortcut));
            this._cachedNormalItems.push(new vscode.CompletionItem(archShortcut, vscode.CompletionItemKind.Constant));
        }
        this._logger.info("Loaded ".concat(this._cachedInlineItems.length.toString(), " completion items"));
    }

    public async inlineHandler(
        document: vscode.TextDocument,
        position: vscode.Position,
        completionContext: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ) {
        const result: vscode.InlineCompletionList = {
            items: this._cachedInlineItems,
            commands: [],
        };
        const lineText = document.lineAt(position.line).text;
        if (
            lineText.trimStart().startsWith("%ifarch") &&
            position.character > 0 &&
            lineText.at(position.character - 1) === " "
        ) {
            for (const item of result.items) {
                item.range = new vscode.Range(position.line, position.character, position.line, position.character);
            }
        }
        return result;
    }

    public async normalHandler(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        completionContext: vscode.CompletionContext
    ) {
        const lineText = document.lineAt(position.line).text;
        if (
            lineText.trimStart().startsWith("%ifarch") &&
            position.character > 0 &&
            lineText.at(position.character - 1) === " "
        ) {
            return this._cachedNormalItems;
        }
        return undefined;
    }
}
