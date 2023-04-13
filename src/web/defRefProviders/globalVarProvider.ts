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
 * Global Variable Definition / Reference Provider of RPM Spec Plugin
 *
 * Author: Lightning Rainstorm <me@ldby.site>
 * Last Change: Apr 13, 2023
 **************************************************************************************/

import * as vscode from "vscode";
import { BaseDefRefProvider } from "./baseProvider";
import { ClientLogger } from "../utils/log";

/** 全局变量定义/使用追踪 */
export class GlobalVarDefRefProvider implements BaseDefRefProvider {
    public name = "GlobalVarDefinitionProvider";
    private _logger: ClientLogger;
    private static _instance?: GlobalVarDefRefProvider;

    /** 定义索引缓存 */
    private _cachedDefMap: Map<string, Map<string, vscode.DefinitionLink[]>>;

    /** 定义常量值缓存 */
    private _cachedDefConstMap: Map<string, Map<string, Set<string>>>;

    /** 使用索引缓存 */
    private _cachedRefMap: Map<string, Map<string, vscode.Location[]>>;

    /**
     * 单例构造方法
     *
     * @param context 插件上下文
     */
    private constructor(context: vscode.ExtensionContext) {
        this._logger = ClientLogger.getLogger(this.name);
        this._cachedDefMap = new Map();
        this._cachedDefConstMap = new Map();
        this._cachedRefMap = new Map();

        // 对启动时已打开的文档，触发一次定义/引用追踪器的文档被打开方法
        for (const doc of vscode.workspace.textDocuments) {
            if (doc.languageId === "rpmspec") {
                this.onDocumentOpen(doc);
            }
        }
    }

    /**
     * 获取单例
     *
     * @param context 插件 Context
     * @returns
     */
    public static getInstance(context?: vscode.ExtensionContext) {
        if (!GlobalVarDefRefProvider._instance) {
            if (!context) {
                throw new TypeError("GlobalVarDefinitionProvider instance has not been created");
            }
            GlobalVarDefRefProvider._instance = new GlobalVarDefRefProvider(context);
        }
        return GlobalVarDefRefProvider._instance;
    }

    /**
     * 打开文件时构建定义-使用索引
     *
     * @param document TextDocument
     */
    public onDocumentOpen(document: vscode.TextDocument) {
        this._buildDefMap(document);
        this._buildRefMap(document);
    }

    /**
     * 构建使用索引
     *
     * @param document TextDocument
     */
    private _buildRefMap(document: vscode.TextDocument) {
        const docText = document.getText();
        const refMap: Map<string, vscode.Location[]> = new Map();
        const refStmtRes = docText.matchAll(/%{(?<varName>[^}]+)}/gi);
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

    /**
     * 构建定义索引
     *
     * @param document TextDocument
     */
    private _buildDefMap(document: vscode.TextDocument) {
        const docText = document.getText();
        const defMap: Map<string, vscode.DefinitionLink[]> = new Map();
        const defConstMap: Map<string, Set<string>> = new Map();
        const defStmtRes = docText.matchAll(/%global\s+(?<varName>\S+)\s+(?<value>.*)/gi);
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

            // 构建常量值缓存表
            const value = res.groups!["value"];
            if (value.match(/^([\w.\s]+)$/)) {
                let valueSet = defConstMap.get(varName);
                if (!valueSet) {
                    valueSet = new Set<string>([value]);
                    defConstMap.set(varName, valueSet);
                }
                valueSet.add(value);
            }
        }
        this._cachedDefMap.set(document.uri.toString(), defMap);
        this._cachedDefConstMap.set(document.uri.toString(), defConstMap);
        this._logger.info(
            "Finished building definition map, count: ".concat(
                defMap.size.toString(),
                ", constMapCount: ",
                defConstMap.size.toString()
            )
        );
    }

    /**
     * 定义追踪响应
     *
     * @param document TextDocument
     * @param position 源码位置
     * @param token Token 状态
     * @returns 定义追踪结果
     */
    public async defHandler(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        if (!this._cachedDefMap.has(document.uri.toString())) {
            this._buildDefMap(document);
        }
        const wordMap = this._cachedDefMap.get(document.uri.toString())!;
        const word = document.getText(document.getWordRangeAtPosition(position));
        if (wordMap.has(word)) {
            const links = wordMap.get(word)!;
            for (const link of links) {
                const targetDocument = await vscode.workspace.openTextDocument(link.targetUri);
                if (targetDocument.getText(link.targetRange) !== word) {
                    // 目标 range 已不是该单词，说明文档可能发生修改，重建索引表
                    this._buildDefMap(targetDocument);
                    return undefined;
                }
            }
            return wordMap.get(word)!;
        }
        return undefined;
    }

    /**
     * 使用追踪响应
     *
     * @param document TextDocument
     * @param position 源码位置
     * @param refContext 使用上下文
     * @param token Token 状态
     * @returns 使用追踪结果
     */
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
            const links = wordMap.get(word)!;
            for (const link of links) {
                const targetDocument = await vscode.workspace.openTextDocument(link.uri);
                if (targetDocument.getText(link.range) !== word) {
                    // 目标 range 已不是该单词，说明文档可能发生修改，重建索引表
                    this._buildRefMap(targetDocument);
                    return undefined;
                }
            }
            return links;
        }
        return undefined;
    }

    /**
     * 获取某个全局变量定义中的常量值
     *
     * @param document TextDocument
     * @param varName 变量名
     * @returns 常量值列表（若没有，返回 undefined）
     */
    public getDefConstValues(document: vscode.TextDocument, varName: string): string[] | undefined {
        if (!this._cachedDefConstMap.has(document.uri.toString())) {
            this._buildDefMap(document);
        }
        const defConstMap = this._cachedDefConstMap.get(document.uri.toString())!;

        if (defConstMap.has(varName)) {
            const values = [...defConstMap.get(varName)!.values()];
            return values.sort();
        }
        return undefined;
    }
}
