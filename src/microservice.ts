/**
 * Created by pedrosousabarreto@gmail.com on 15/Jan/2019.
 */
"use strict";

import * as http from "http";
import assert from "assert";
import express from "express";
import * as Uuid from "uuid";

import {DiContainer} from "./di_container";
import {ServiceConfigs} from "./service_configs";
import {IDiFactory, ILogger} from "./interfaces";
import {AddressInfo} from "net";
import {ConsoleLogger} from "./console_logger";
import Signals = NodeJS.Signals;

export class Microservice extends DiContainer {
	private _express_app!: express.Application;
	private _port: number | undefined;
	private _http_server!: http.Server;
	private _configs: ServiceConfigs;
	private _logger: ILogger;

	private _run_express: boolean = true;

	constructor(configs: ServiceConfigs, logger?: ILogger) {
		super(logger);

		if (!logger)
			this._logger = new ConsoleLogger().create_child({class: "Microservice"});
		else
			this._logger = logger.create_child({class: "Microservice"});

		console.time("MicroService - Start " + configs.instance_name);

		//do something when app is closing
		process.on('exit', () => {
			this._logger.info("Microservice - exiting...");
		});

		//catches ctrl+c event
		process.on('SIGINT', this._handle_int_and_term_signals.bind(this));

		//catches program termination event
		process.on('SIGTERM', this._handle_int_and_term_signals.bind(this));

		this._configs = configs;
		this.register_dependency("configs", this._configs);
	}

	public async init(): Promise<void> {
		// init configs first
		await this._configs.init();

		const run_express_flag = this._configs.get_feature_flag_value("RUN_EXPRESS_APP");
		this._run_express = run_express_flag == undefined ? true : run_express_flag;

		if(this._run_express)
			await this._init_express_app();

		await this._init_factories();

		console.timeEnd("MicroService - Start " + this._configs.instance_name);

	}

	public async destroy(): Promise<void> {
		let mod: IDiFactory;
		let factories_names = Array.from(this._factories.keys());

		const all_destroys: Promise<void>[] = factories_names.map((factory_name) => {
			this._logger.info(`Microservice - destroying factory: ${factory_name}`);
			mod = this.get(factory_name);
			return mod.destroy();
		});

		await Promise.all(all_destroys).catch((err) => {
			this._logger.error(err, "Microservice - destroy cleanup error");
			return Promise.reject(err);
		}).then(() => {
			this._logger.info("Microservice - destroy cleanup completed successfully, exiting...");
			return Promise.resolve();
		});
	}

	private async _init_express_app(): Promise<void> {
		return new Promise((resolve) => {
			this._express_app = express();

			this._port = this._configs.get_param_value("http_port");
			assert(this._port, "Invalid port for express microservice");

			this._http_server = http.createServer(this._express_app);
			this._http_server.listen(this._port, "0.0.0.0");
			this._http_server.on('error', this._http_error_handler.bind(this));

			// register express_app and http_server in the DI Container
			this.register_dependency("express_app", this._express_app);
			this.register_dependency("http_server", this._http_server); // thanks jcfsantos

			this._http_server.on('listening', () => {
				let addr: AddressInfo = this._http_server.address() as AddressInfo;
				// let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + JSON.stringify(addr);
				this._logger.info(`Microservice - listening on: ${addr.family} ${addr.address}:${addr.port}`);
				this._logger.info(`Microservice - PID: ${process.pid}`);

				// hook health check - implement a proper health check with a factory
				// this._express_app.get('/', this._health_check_handler.bind(this));

				// debug
				this._express_app.use("*", (req: express.Request, res: express.Response, next: express.NextFunction) => {
					//console.log(`Got request - ${req.method} - ${req.originalUrl}`);

					// TODO check for incoming correlationid header and set it from incoming

					// add a correlation id to all calls
					const correlation_id = Uuid.v4();
					res.locals["correlation_id"] = correlation_id;
					res.setHeader("X-API-correlation-id", correlation_id);

					next();
				});

				// CORS
				this._express_app.use(function (req, res, next) {
					res.setHeader("Access-Control-Allow-Origin", "*");
					res.setHeader("Access-Control-Allow-Methods", "HEAD, GET, POST, PATCH, DELETE");
					res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Requested-With");
					res.setHeader("access-control-expose-headers", "X-API-correlation-id");

					next();
				});

				resolve();
			});
		});
	}

	private async _init_factories(): Promise<void> {
		let factories_names = Array.from(this._factories.keys());

		let mod;
		for (let i = 0; i < factories_names.length; i++) {
			this._logger.info("Microservice - initializing factory: %s", factories_names[i]);
			mod = this.get(factories_names[i]);
			await mod.init();
		}
	}

	private _http_error_handler(error: Error | any) {
		if (error["syscall"] !== 'listen')
			throw error;

		// handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES':
				this._logger.fatal(this._port + ' requires elevated privileges');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				this._logger.fatal(this._port + ' is already in use');
				process.exit(1);
				break;
			default:
				this._logger.fatal("unkown error - ", error);
				throw error;
		}

	}

	private async _handle_int_and_term_signals(signal: Signals): Promise<void> {
		this._logger.info(`Microservice - ${signal} received - cleaning up...`);

		await this.destroy()
			.catch(err => process.exit(90))
			.then(value => process.exit());
	}

}


