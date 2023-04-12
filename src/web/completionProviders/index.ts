/***************************************************************************************
 * Copyright (c) 2023 TCSE-ISCAS. All rights reserved.
 * RVPortingTool is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 *
 * Completion Provider of RPM Spec Plugin
 *
 * Author: Lightning Rainstorm <me@ldby.site>
 * Last Change: Apr 12, 2023
 **************************************************************************************/

import * as vscode from "vscode";
import { BaseCompletionProvider } from "./baseProvider";
import { IfArchProvider } from "./ifArchProvider";

export const providers: Map<string, BaseCompletionProvider> = new Map();

export function init(context: vscode.ExtensionContext) {
    providers.set(IfArchProvider.name, new IfArchProvider(context));
    return providers;
}
