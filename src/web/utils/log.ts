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
 * Logger of RPM Spec Plugin
 *
 * Author: Lightning Rainstorm <me@ldby.site>
 * Last Change: Apr 11, 2023
 **************************************************************************************/

import * as vscode from "vscode";

/** Log levels */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface LogData {
    category: string;
    level: LogLevel;
    message: any;
}

export class ClientLogger {
    private static cachedLoggers: Map<string, ClientLogger>;
    private static defaultLevel: LogLevel;
    private static outputChannelName: string;
    private static outputChannel: vscode.OutputChannel;

    // private log4jsLogger: log4js.Logger;
    private category: string;
    private logLevel: LogLevel;

    /**
     * Constructor of Logger
     *
     * @param category Category name
     */
    private constructor(category: string, level?: LogLevel) {
        // Set default level if not initialized
        if (ClientLogger.defaultLevel === undefined) {
            ClientLogger.defaultLevel = "info";
        }

        // Create output channel if not initialized
        if (ClientLogger.outputChannel === undefined) {
            const channelName = ClientLogger.outputChannelName ? ClientLogger.outputChannelName : "Logs: Extension";
            ClientLogger.outputChannel = vscode.window.createOutputChannel(channelName);
        }

        this.category = category;
        this.logLevel = level ? level : ClientLogger.defaultLevel;
    }

    /**
     * Initialize Client Logger
     *
     * This method should be called in activate() method of the extension.
     *
     * @param context VSCode Extension Context
     */
    public static init(context: vscode.ExtensionContext): ClientLogger {
        // Get and convert extension logLevel configuration
        let extIdentifier = context.extension.id;
        extIdentifier = extIdentifier.substring(extIdentifier.lastIndexOf(".") + 1);
        const logLevel: string | undefined = vscode.workspace.getConfiguration(extIdentifier).get("logLevel");
        this.defaultLevel = "info";
        if (logLevel === "verbose") {
            this.defaultLevel = "trace";
        }

        // Initialize log4js configuration
        if (context !== undefined) {
            const logFileUri = context.logUri;
        }

        // Initialize output channel
        ClientLogger.outputChannelName = `Logs: ${context.extension.id}`;
        ClientLogger.outputChannel = vscode.window.createOutputChannel(ClientLogger.outputChannelName);

        // Initialize and return root logger
        return ClientLogger.getLogger("main");
    }

    /**
     * Get logger with category name
     *
     * @param category Category name, undefined means main
     */
    public static getLogger(category?: string): ClientLogger {
        category = category ? category : "main";
        if (ClientLogger.cachedLoggers) {
            if (ClientLogger.cachedLoggers.has(category)) {
                return ClientLogger.cachedLoggers.get(category)!;
            }
        } else {
            ClientLogger.cachedLoggers = new Map();
        }
        const logger = new ClientLogger(category);
        ClientLogger.cachedLoggers.set(category, logger);
        return logger;
    }

    /**
     * Write a single line log.
     *
     * @param level Log level
     * @param message Log message
     */
    public log(level: LogLevel, message: any) {
        const outStr = "["
            .concat(new Date().toLocaleString())
            .concat("] [")
            .concat(this.category)
            .concat("] [")
            .concat(level)
            .concat("] ")
            .concat(message);

        switch (level) {
            case "trace":
                console.trace(outStr);
                break;
            case "debug":
                console.debug(outStr);
                break;
            case "info":
                console.info(outStr);
                break;
            case "warn":
                console.warn(outStr);
                break;
            case "error":
                console.error(outStr);
                break;
            case "fatal":
                console.error(outStr);
                break;
            default:
                console.log(outStr);
                break;
        }
        ClientLogger.outputChannel.appendLine(outStr);
    }

    public trace(message: any) {
        this.log("trace", message);
    }

    public debug(message: any) {
        this.log("debug", message);
    }

    public info(message: any) {
        this.log("info", message);
    }

    public warn(message: any) {
        this.log("warn", message);
    }

    public error(message: any) {
        this.log("error", message);
    }

    public fatal(message: any) {
        this.log("fatal", message);
    }
}
