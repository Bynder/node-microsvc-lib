/**
 * Created by Marten Sies on 13/June/2019.
 */
"use strict";

import * as Bunyan from "bunyan";
import {ILogger, LogLevels} from "./interfaces";
import {ServiceConfigs} from "./service_configs";
import printf = require("printf");

export class JSONLogger implements ILogger {
	private _attrs:object = {};
	private readonly _logger:Bunyan;

	constructor(svc_configs: ServiceConfigs) {
		this._logger = Bunyan.createLogger({
			name: svc_configs.app_name,
			instance_id: svc_configs.instance_id,
			env: svc_configs.env,
			app_version: svc_configs.app_version,
			streams: [
				{
					level: 'trace',
					stream: process.stdout
				}
			],
		});
	}

	debug(message?: any, ...optionalParams: any[]): void {
		this._logger.debug.apply(this._logger,[
			this.create_message(LogLevels.DEBUG, message, optionalParams),
		]);
	}

	info(message?: any, ...optionalParams: any[]): void {
		this._logger.info.apply(this._logger, [
			this.create_message(LogLevels.INFO, message, optionalParams),
		]);
	}

	warn(message?: any, ...optionalParams: any[]): void {
		this._logger.warn.apply(this._logger, [
			this.create_message(LogLevels.WARN, message, optionalParams),
		]);
	}

	error(message?: any, ...optionalParams: any[]): void {
		this._logger.error.apply(this._logger, [
			this.create_message(LogLevels.ERROR, message, optionalParams),
		]);
	}

	fatal(message?: any, ...optionalParams: any[]): void {
		this._logger.fatal.apply(this._logger, [
			this.create_message(LogLevels.FATAL, message, optionalParams),
		]);
	}

	create_message(level: string, message: any = '', optionalParams: any[] = []): {} {
		let logMessage = {
			log_level: level,
		};

		if (typeof message === "object") {
			Object.assign(logMessage, message);
		} else if (typeof message === "string") {
			Object.assign(logMessage, {message: printf(message, ...optionalParams)} );
		} else {
			Object.assign(logMessage, {message});
		}

		return logMessage;
	}

	create_child(attrs?: object): ILogger {
		if(attrs)
			this._attrs = attrs;

		// @ts-ignore
		return this._logger.child(attrs, false);
	}
}
