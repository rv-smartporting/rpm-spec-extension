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
 * Global Variable Definition Provider of RPM Spec Plugin
 *
 * Author: Lightning Rainstorm <me@ldby.site>
 * Last Change: Apr 13, 2023
 **************************************************************************************/

import * as vscode from "vscode";
import { BaseDefinitionProvider } from "./baseProvider";
import { ClientLogger } from "../utils/log";

export class GlobalVarDefinitionProvider implements BaseDefinitionProvider {
    public name = "GlobalVarDefinitionProvider";
    private _logger: ClientLogger;
    private _cachedDefMap: Map<string, Map<string, vscode.DefinitionLink[]>>;
    private _cachedRefMap: Map<string, Map<string, vscode.Location[]>>;

    public constructor(context: vscode.ExtensionContext) {
        this._logger = ClientLogger.getLogger(this.name);
        this._cachedDefMap = new Map();
        this._cachedRefMap = new Map();
    }

    public onDocumentOpen(document: vscode.TextDocument) {
        this._buildDefMap(document);
        this._buildRefMap(document);
    }

    private _buildRefMap(document: vscode.TextDocument) {
        const docText = document.getText();
        const refMap: Map<string, vscode.Location[]> = new Map();
        const refStmtRes = docText.matchAll(/%{(?<varName>[^}]+)}+/gi);
        for (const res of refStmtRes) {
            const varName = res.groups!["varName"];
            const wordPos = document.positionAt(res.index! + res[0].indexOf(varName));

            // 忽略注释
            if (document.lineAt(wordPos.line).text.trimStart().startsWith("#")) {
                continue;
            }

            const wordRange = document.getWordRangeAtPosition(wordPos);
            if (!wordRange) {
                continue;
            }
            // 额外检查 wordRange 内对应的 word 是否与 varName 相等
            if (document.getText(wordRange) !== varName) {
                this._logger.error(
                    "refStmt wordRange word not equals to varName! word: ".concat(
                        document.getText(wordRange),
                        ", varName: ",
                        varName
                    )
                );
                continue;
            }
            const refLoc = new vscode.Location(document.uri, wordRange);
            if (refMap.has(varName)) {
                refMap.get(varName)!.push(refLoc);
            } else {
                refMap.set(varName, [refLoc]);
            }
        }
        this._cachedRefMap.set(document.uri.toString(), refMap);
        this._logger.info("Finished building reference map, count: ".concat(refMap.size.toString()));
    }

    private _buildDefMap(document: vscode.TextDocument) {
        const docText = document.getText();
        const defMap: Map<string, vscode.DefinitionLink[]> = new Map();
        const defStmtRes = docText.matchAll(/%global\s+(?<varName>\S+)\s+/gi);
        for (const res of defStmtRes) {
            const varName = res.groups!["varName"];
            const wordPos = document.positionAt(res.index! + res[0].indexOf(varName));
            const wordRange = document.getWordRangeAtPosition(wordPos);
            if (!wordRange) {
                continue;
            }
            // 额外检查 wordRange 内对应的 word 是否与 varName 相等
            if (document.getText(wordRange) !== varName) {
                this._logger.error(
                    "defStmt wordRange word not equals to varName! word: ".concat(
                        document.getText(wordRange),
                        ", varName: ",
                        varName
                    )
                );
                continue;
            }
            const defLink = <vscode.DefinitionLink>{
                targetUri: document.uri,
                targetRange: wordRange,
                targetSelectionRange: wordRange,
            };
            if (defMap.has(varName)) {
                defMap.get(varName)!.push(defLink);
            } else {
                defMap.set(varName, [defLink]);
            }
        }
        this._cachedDefMap.set(document.uri.toString(), defMap);
        this._logger.info("Finished building definition map, count: ".concat(defMap.size.toString()));
    }

    public async defHandler(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        if (!this._cachedDefMap.has(document.uri.toString())) {
            this._buildDefMap(document);
        }
        const wordMap = this._cachedDefMap.get(document.uri.toString())!;
        const word = document.getText(document.getWordRangeAtPosition(position));
        if (wordMap.has(word)) {
            return wordMap.get(word)!;
        }
        return undefined;
    }

    public async refHandler(
        document: vscode.TextDocument,
        position: vscode.Position,
        refContext: vscode.ReferenceContext,
        token: vscode.CancellationToken
    ) {
        if (!this._cachedRefMap.has(document.uri.toString())) {
            this._buildRefMap(document);
        }
        const wordMap = this._cachedRefMap.get(document.uri.toString())!;
        const word = document.getText(document.getWordRangeAtPosition(position));
        if (wordMap.has(word)) {
            return wordMap.get(word)!;
        }
        return undefined;
    }
}
