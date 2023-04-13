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
 * Base Definition Provider of RPM Spec Plugin
 *
 * Author: Lightning Rainstorm <me@ldby.site>
 * Last Change: Apr 13, 2023
 **************************************************************************************/

import * as vscode from "vscode";

export interface DefinitionProviderHandler {
    (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<
        vscode.DefinitionLink[]
    >;
}

export interface ReferenceProviderHandler {
    (
        document: vscode.TextDocument,
        position: vscode.Position,
        refContext: vscode.ReferenceContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Location[]>;
}

/** Base interface for every definitionProvider */
export interface BaseDefinitionProvider {
    /** Provider name */
    name: string;

    /** On Document Open */
    onDocumentOpen?: (document: vscode.TextDocument) => void;

    /** Definition Provider Handler */
    defHandler?: DefinitionProviderHandler;

    /** Reference Provider Handler */
    refHandler?: ReferenceProviderHandler;
}
