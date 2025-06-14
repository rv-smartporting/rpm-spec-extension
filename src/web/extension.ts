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
 * Last Change: June 5, 2025
 **************************************************************************************/

import * as CompletionProviders from "./completionProviders";
import * as DefRefProviders from "./defRefProviders";
import * as HoverProviders from "./hoverProviders";
import * as vscode from "vscode";
import { ClientLogger } from "./utils/log";

export function activate(context: vscode.ExtensionContext) {
    ClientLogger.init(context);
    CompletionProviders.init(context);
    DefRefProviders.init(context);
    HoverProviders.init(context);

    // vscode.commands.registerCommand("demo-ext.command1", async (...args) => {
    //     vscode.window.showInformationMessage("command1: " + JSON.stringify(args));
    // });

    /**
     * 普通补全
     */
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

    /**
     * 定义追踪
     */
    const definitionProvider: vscode.DefinitionProvider = {
        provideDefinition: async function (
            document: vscode.TextDocument,
            position: vscode.Position,
            token: vscode.CancellationToken
        ) {
            let result: vscode.DefinitionLink[] = [];
            for (const [providerName, provider] of DefRefProviders.providers) {
                if (!provider.defHandler) {
                    continue;
                }
                const partResult = await provider.defHandler(document, position, token);
                if (partResult) {
                    result = result.concat(partResult);
                }
            }
            return result;
        },
    };

    /**
     * 引用追踪
     */
    const referenceProvider: vscode.ReferenceProvider = {
        provideReferences: async function (
            document: vscode.TextDocument,
            position: vscode.Position,
            refContext: vscode.ReferenceContext,
            token: vscode.CancellationToken
        ) {
            let result: vscode.Location[] = [];
            for (const [providerName, provider] of DefRefProviders.providers) {
                if (!provider.refHandler) {
                    continue;
                }
                const partResult = await provider.refHandler(document, position, refContext, token);
                if (partResult) {
                    result = result.concat(partResult);
                }
            }
            return result;
        },
    };

    const hoverProviders: vscode.Disposable[] = [];
    for (const [providerName, provider] of HoverProviders.providers) {
        if (!provider.handler) {
            continue;
        }
        hoverProviders.push(
            vscode.languages.registerHoverProvider(
                { language: "rpmspec" },
                {
                    provideHover: async function (document, position, token) {
                        return provider.handler!(document, position, token);
                    },
                }
            )
        );
    }

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider({ language: "rpmspec" }, normalProvider, " "),
        vscode.languages.registerDefinitionProvider({ language: "rpmspec" }, definitionProvider),
        vscode.languages.registerReferenceProvider({ language: "rpmspec" }, referenceProvider),
        vscode.workspace.onDidOpenTextDocument((doc) => {
            if (doc.languageId === "rpmspec") {
                for (const [providerName, provider] of DefRefProviders.providers) {
                    provider.onDocumentOpen?.(doc);
                }
            }
        })
    );
    context.subscriptions.push(...hoverProviders);
}
