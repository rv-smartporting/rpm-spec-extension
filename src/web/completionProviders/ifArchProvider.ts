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
 * Last Change: June 5, 2025
 **************************************************************************************/

import * as vscode from "vscode";
import { BaseCompletionProvider } from "./baseProvider";
import { ClientLogger } from "../utils/log";

export class IfArchProvider implements BaseCompletionProvider {
    public name = "IfArchProvider";
    private _logger: ClientLogger;
    private static _instance?: IfArchProvider;

    /** Inline 补全条目缓存表 */
    private _cachedInlineItems: vscode.InlineCompletionItem[] = [];

    /** 普通补全条目缓存表 */
    private _cachedNormalItems: vscode.CompletionItem[] = [];

    /** 补全条目键名集合 */
    private _cachedKeys: Set<string> = new Set();

    /**
     * 单例构造方法
     *
     * @param context 插件上下文
     */
    private constructor(context: vscode.ExtensionContext) {
        this._logger = ClientLogger.getLogger(this.name);

        // 通过 tmLanguage 加载 archValues 和 archShortcuts 名称列表
        // 将列表值作为自动补全提示结果
        this._logger.info("Loading rpm spec tmLanguage file...");
        const specLangJsonPath = vscode.Uri.joinPath(context.extensionUri, "resource/rpmspec.tmLanguage.json");
        vscode.workspace.fs.readFile(specLangJsonPath).then((jsonContent) => {
            const specLangJson = JSON.parse(new TextDecoder().decode(jsonContent));
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
                this._cachedNormalItems.push(
                    new vscode.CompletionItem(archShortcut, vscode.CompletionItemKind.Constant)
                );
            }
            this._logger.info("Loaded ".concat(this._cachedInlineItems.length.toString(), " completion items"));
        });
    }

    /**
     * 获取单例
     *
     * @param context 插件 Context
     * @returns
     */
    public static getInstance(context?: vscode.ExtensionContext) {
        if (!IfArchProvider._instance) {
            if (!context) {
                throw new TypeError("IfArchProvider instance has not been created");
            }
            IfArchProvider._instance = new IfArchProvider(context);
        }
        return IfArchProvider._instance;
    }

    /**
     * 普通补全响应
     *
     * @param document TextDocument
     * @param position 源码位置
     * @param token Token 状态
     * @param completionContext 普通补全上下文
     * @returns 普通补全结果
     */
    public async normalHandler(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        completionContext: vscode.CompletionContext
    ) {
        const lineText = document.lineAt(position.line).text;
        if (
            (lineText.trimStart().startsWith("%ifarch") || lineText.trimStart().startsWith("%ifnarch")) &&
            position.character > 0 &&
            lineText.at(position.character - 1) === " "
        ) {
            return this._cachedNormalItems;
        }
        return undefined;
    }
}
