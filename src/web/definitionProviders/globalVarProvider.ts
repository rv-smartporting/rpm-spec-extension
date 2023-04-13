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

    public constructor(context: vscode.ExtensionContext) {
        this._logger = ClientLogger.getLogger(this.name);
    }

    public async handler(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        const result: vscode.DefinitionLink[] = [];
        return result;
    }
}
