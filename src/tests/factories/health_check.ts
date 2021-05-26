/**
 * Created by pedrosousabarreto@gmail.com on 15/Jan/2019.
 */
"use strict";
import * as express from "express";


import {ILogger,IDiFactory, ServiceConfigs } from "../../index"
import {ConsoleLogger} from "../../console_logger";

const my_path = "/_health_check";

export class HealthCheck implements IDiFactory {
	private _name = "HealthCheck";
	private _configs: ServiceConfigs;
	private _express_app: express.Application;

	private _logger: ILogger;

	get name() {
		return this._name;
	};

	constructor(configs: ServiceConfigs, express_app: express.Application, logger:ILogger) {
		this._configs = configs;
		this._express_app = express_app;

		if(!logger)
			this._logger = new ConsoleLogger().create_child({class: "HealthCheck"});
		else
			this._logger = logger.create_child({class: "HealthCheck"});
	}

	async init(): Promise<void> {
		this._logger.info("%s initialising...", this.name);

		await this._inject_routes().catch((err?:Error)=> {
			this._logger.error(err, this.name + " Error initializing");
			return Promise.reject(err);
		}).then(()=>{
			this._logger.info("%s initialised", this.name);
			return Promise.resolve();
		});
	}

	async destroy(): Promise<void> {
		this._logger.info("%s - destroying...", this.name);
	}

	private async _inject_routes(): Promise<void> {
		this._logger.info("%s initialising routes...", this.name);

		let router = express.Router();

		router.get(my_path, this._health_check_handler.bind(this));

		this._express_app.use(this._configs.app_base_url, router);
	}

	private _health_check_handler(req: express.Request, res: express.Response, next: express.NextFunction) {
		// TODO add overrideable custom handler
		res.status(200).json({status: "ok"});
	}
}
