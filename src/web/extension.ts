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
 * Last Change: Apr 11, 2023
 **************************************************************************************/

import * as vscode from "vscode";
import { ClientLogger } from "./utils/log";
import { Providers } from "./completionProviders";

export function activate(context: vscode.ExtensionContext) {
    ClientLogger.init(context);

    vscode.commands.registerCommand("demo-ext.command1", async (...args) => {
        vscode.window.showInformationMessage("command1: " + JSON.stringify(args));
    });

    const provider: vscode.InlineCompletionItemProvider = {
        async provideInlineCompletionItems(document, position, context, token) {
            const result: vscode.InlineCompletionList = {
                items: [],
                commands: [],
            };

            Providers.forEach(async (provider, providerName) => {
                const partResult = await provider.handle(document, position, context, token);
                if (partResult) {
                    result.items.concat(partResult.items);
                    if (partResult.commands) {
                        result.commands!.concat(partResult.commands);
                    }
                }
            });

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
         * @param acceptedLength The length of the substring of the inline completion that was accepted already.
         */
        handleDidPartiallyAcceptCompletionItem(
            completionItem: vscode.InlineCompletionItem,
            acceptedLength: number
        ): void {
            console.log("handleDidPartiallyAcceptCompletionItem");
        },
    };
    vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);
}
