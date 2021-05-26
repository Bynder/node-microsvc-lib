/**
 * Created by pedrosousabarreto@gmail.com on 21/May/2019.
 */


"use strict";

import * as path from "path";
import * as fs from "fs";
import * as Bunyan from "bunyan";
import {ILogger} from "./interfaces";
import {ServiceConfigs} from "./service_configs";

const PrettyStream = require("bunyan-prettystream");


export class BunyanLogger implements ILogger{

	private _logger:Bunyan;

	constructor(svc_configs: ServiceConfigs, log_file_path:string) {
		log_file_path = path.resolve(log_file_path); // convert to absolute

		fs.mkdirSync(path.dirname(log_file_path), { recursive: true });

		// const parts = path.dirname(log_file_path).split(path.sep);
		// // For every part of our path, call our wrapped mkdirSync()
		// // on the full path until and including that part
		// for (let i = 1; i <= parts.length; i++) {
		// 	try {
		// 		fs.mkdirSync(path.join.apply(null, parts.slice(0, i)))
		// 	} catch (e) {
		// 		debugger;
		// 	}
		// }

		let pretty_stdout = new PrettyStream();
		pretty_stdout.pipe(process.stdout);

		this._logger = Bunyan.createLogger({
			name: svc_configs.app_name,
			instance_id: svc_configs.instance_id,
			env: svc_configs.env,
			app_version: svc_configs.app_version,
			streams: [
				{
					level: 'trace',
					type: 'raw',
					stream: pretty_stdout
				}, {
					level: "debug",
					type: "rotating-file",
					path: log_file_path,
					period: "3h",   // every 3h rotation
					count: 4        // keep 12h of backups
				}
			]
		});
	}


	create_child(attrs?: object): ILogger{
		if(!attrs)
			attrs = {};

		// @ts-ignore
		return this._logger.child(attrs, false);
	}

	debug(message?: any, ...optionalParams: any[]): void {
		this._logger.debug.apply(this._logger, [message, ...optionalParams]);
	}
	info(message?: any, ...optionalParams: any[]): void {
		this._logger.info.apply(this._logger, [message, ...optionalParams]);
	}
	warn(message?: any, ...optionalParams: any[]): void {
		this._logger.warn.apply(this._logger, [message, ...optionalParams]);
	}
	error(message?: any, ...optionalParams: any[]): void {
		this._logger.error.apply(this._logger, [message, ...optionalParams]);
	}
	fatal(message?: any, ...optionalParams: any[]): void {
		this._logger.fatal.apply(this._logger, [message, ...optionalParams]);
	}

}
