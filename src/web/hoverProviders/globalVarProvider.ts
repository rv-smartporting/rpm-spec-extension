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
 * Global Variable Hover Provider of RPM Spec Plugin
 *
 * Author: Lightning Rainstorm <me@ldby.site>
 * Last Change: Apr 13, 2023
 **************************************************************************************/

import * as vscode from "vscode";
import { BaseHoverProvider } from "./baseProvider";
import { ClientLogger } from "../utils/log";
import { GlobalVarDefRefProvider } from "../defRefProviders/globalVarProvider";

/** 全局变量定义/使用追踪 */
export class GlobalVarHoverProvider implements BaseHoverProvider {
    public name = "GlobalVarHoverProvider";
    private _logger: ClientLogger;
    private static _instance?: GlobalVarHoverProvider;

    /** 定义/使用解析器对象 */
    private _defRefProvider: GlobalVarDefRefProvider;

    /**
     * 单例构造方法
     *
     * @param context 插件上下文
     */
    private constructor(context: vscode.ExtensionContext) {
        this._logger = ClientLogger.getLogger(this.name);
        this._defRefProvider = GlobalVarDefRefProvider.getInstance(context);
    }

    /**
     * 获取单例
     *
     * @param context 插件 Context
     * @returns
     */
    public static getInstance(context?: vscode.ExtensionContext) {
        if (!GlobalVarHoverProvider._instance) {
            if (!context) {
                throw new TypeError("GlobalVarHoverProvider instance has not been created");
            }
            GlobalVarHoverProvider._instance = new GlobalVarHoverProvider(context);
        }
        return GlobalVarHoverProvider._instance;
    }

    /**
     * 全局变量定义常量值提示
     *
     * @param document TextDocument
     * @param wordRange 当前提示词范围
     * @returns 生成的 Hover，若未生成返回 undefined
     */
    private _handleGlobalVar(document: vscode.TextDocument, wordRange: vscode.Range) {
        const word = document.getText(wordRange);

        // 比较 word 之前是否以 %{ 开头，之后是否以 } 结尾，以确定是否为全局变量引用
        const refStmtPrefixRange = new vscode.Range(
            new vscode.Position(wordRange.start.line, 0),
            new vscode.Position(wordRange.start.line, wordRange.start.character)
        );
        const refStmtSuffixRange = new vscode.Range(
            new vscode.Position(wordRange.end.line, wordRange.end.character),
            new vscode.Position(wordRange.end.line, Infinity)
        );
        if (
            (!document.getText(refStmtPrefixRange).trimEnd().endsWith("%{") ||
                !document.getText(refStmtSuffixRange).trimStart().startsWith("}")) &&
            !document.getText(refStmtPrefixRange).trimEnd().endsWith("%global")
        ) {
            return undefined;
        }

        // 获取全局变量定义时的常量值列表并显示
        const defConstValues = this._defRefProvider.getDefConstValues(document, word);
        if (defConstValues && defConstValues.length > 0) {
            let tips = "```yaml\n";
            if (defConstValues.length > 1) {
                tips += word.concat(":\n  - ");
                tips += defConstValues.join("\n  - ");
            } else {
                tips += word.concat(": ", defConstValues[0]);
            }
            tips += "\n```";
            return new vscode.Hover(tips, wordRange);
        }
        return undefined;
    }

    private _handlePreambleTags(tag: string) {
        switch (tag) {
            case "Name":
                return "The Name tag contains the proper name of the package. Names must not include whitespace and may include a hyphen ‘-‘ (unlike version and release tags). Names should not include any numeric operators (‘<’, ‘>’,’=’) as future versions of rpm may need to reserve characters other than ‘-‘.";
            case "Version":
                return (
                    "Version of the packaged content, typically software.\n\n" +
                    "The version string consists of alphanumeric characters, which can optionally be segmented with the separators ., _ and +, plus ~ and ^ (see below).\n\n" +
                    "Tilde (\\~) can be used to force sorting lower than base (1.1\\~201601 < 1.1). \n\n" +
                    "Caret (^) can be used to force sorting higher than base (1.1^201601 > 1.1). \n\n" +
                    "These are useful for handling pre- and post-release versions, such as 1.0\\~rc1 and 2.0^a."
                );
            case "Release":
                return (
                    "Package release, used for distinguishing between different builds of the same software version.\n" +
                    "See [Version](https://rpm-software-management.github.io/rpm/manual/spec.html#version) for allowed characters and modifiers."
                );
            default:
                return undefined;
        }
    }

    private _handleKeywords(document: vscode.TextDocument, wordRange: vscode.Range) {
        const word = document.getText(wordRange);

        if (wordRange.start.character === 0) {
            // 处理首行关键字（如 Name、Version、Summary 等）
            const res = this._handlePreambleTags(word);
            if (res) {
                let tips = "### ".concat(word, "\n\n");
                tips += res;
                return new vscode.Hover(tips, wordRange);
            }
        }
        return undefined;
    }

    /**
     * Hover 响应
     *
     * @param document TextDocument
     * @param position 源码位置
     * @param token Token 状态
     * @returns 定义追踪结果
     */
    public async handler(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return undefined;
        }
        const word = document.getText(wordRange);

        let res: vscode.Hover | undefined = undefined;
        res = this._handleGlobalVar(document, wordRange);
        if (!res) res = this._handleKeywords(document, wordRange);
        return res;
    }
}
