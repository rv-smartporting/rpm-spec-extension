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
 * Client Entry Point of RPM Spec Plugin
 *
 * Author: Lightning Rainstorm <me@ldby.site>
 * Last Change: Apr 12, 2023
 **************************************************************************************/

import * as CompletionProviders from "./completionProviders";
import * as DefinitionProviders from "./definitionProviders";
import * as vscode from "vscode";
import { ClientLogger } from "./utils/log";

export function activate(context: vscode.ExtensionContext) {
    ClientLogger.init(context);
    CompletionProviders.init(context);

    vscode.commands.registerCommand("demo-ext.command1", async (...args) => {
        vscode.window.showInformationMessage("command1: " + JSON.stringify(args));
    });

    const inlineProvider: vscode.InlineCompletionItemProvider = {
        provideInlineCompletionItems: async function (document, position, completionContext, token) {
            const result: vscode.InlineCompletionList = {
                items: [],
                commands: [],
            };

            for (const [providerName, provider] of CompletionProviders.providers) {
                if (!provider.inlineHandler) {
                    continue;
                }
                const partResult = await provider.inlineHandler(document, position, completionContext, token);
                if (partResult) {
                    result.items = result.items.concat(partResult.items);
                    if (partResult.commands) {
                        result.commands = result.commands!.concat(partResult.commands);
                    }
                }
            }

            if (result.items.length > 0) {
                result.commands!.push({
                    command: "demo-ext.command1",
                    title: "My Inline Completion Demo Command",
                    arguments: [1, 2],
                });
            }
            return result;
        },

        handleDidShowCompletionItem(completionItem: vscode.InlineCompletionItem): void {
            console.log("handleDidShowCompletionItem");
        },

        /**
         * Is called when an inline completion item was accepted partially.
         * @param completionItem
         * @param acceptedLength The length of the substring of the inline completion that was accepted already.
         */
        handleDidPartiallyAcceptCompletionItem(
            completionItem: vscode.InlineCompletionItem,
            acceptedLength: number
        ): void {
            console.log("handleDidPartiallyAcceptCompletionItem");
        },
    };

    const normalProvider: vscode.CompletionItemProvider = {
        provideCompletionItems: async function (
            document: vscode.TextDocument,
            position: vscode.Position,
            token: vscode.CancellationToken,
            completionContext: vscode.CompletionContext
        ) {
            let result: vscode.CompletionItem[] = [];
            for (const [providerName, provider] of CompletionProviders.providers) {
                if (!provider.normalHandler) {
                    continue;
                }
                const partResult = await provider.normalHandler(document, position, token, completionContext);
                if (partResult) {
                    result = result.concat(partResult);
                }
            }
            return result;
        },
    };

    const definitionProvider: vscode.DefinitionProvider = {
        provideDefinition: async function (
            document: vscode.TextDocument,
            position: vscode.Position,
            token: vscode.CancellationToken
        ) {
            let result: vscode.DefinitionLink[] = [];
            for (const [providerName, provider] of DefinitionProviders.providers) {
                if (!provider.handler) {
                    continue;
                }
                const partResult = await provider.handler(document, position, token);
                if (partResult) {
                    result = result.concat(partResult);
                }
            }
            return result;
        },
    };
    // vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, inlineProvider);
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider({ pattern: "**" }, normalProvider, " "),
        vscode.languages.registerDefinitionProvider({ pattern: "**" }, definitionProvider)
    );
}
