/**
 * Created by pedrosousabarreto@gmail.com on 15/Jan/2019.
 */


"use strict";

import {IDiFactory, ILogger} from "./interfaces";
import {ConsoleLogger} from "./console_logger";

export class DiContainer {
	protected _dependencies: Map<string, any>;
	protected _factories: Map<string, IDiFactory>;
	private _di_logger: ILogger;

	constructor(logger?:ILogger) {
		this._dependencies = new Map<string, any>();
		this._factories = new Map<string, IDiFactory>();

		if(!logger)
			this._di_logger = new ConsoleLogger().create_child({class: "DiContainer"});
		else
			this._di_logger = logger.create_child({class: "DiContainer"});
	}

	register_factory(name: string, factory: any):void {
		this._check_duplicate_name(name);
		// TODO check that it implements IDiFactory

		this._di_logger.info("DI Container - registering factory: %s", name);
		this._factories.set(name, factory);
	}

	register_dependency(name: string, dep: any) :void{
		this._check_duplicate_name(name);

		this._di_logger.info("DI Container - registering dependency: %s", name);
		this._dependencies.set(name,dep);
	};

	has(name: string){
		return (this._dependencies.has(name) || this._factories.has(name));
	}

	get(name: string): any {
		name = name.trim();

		if (!this._dependencies.has(name)) {
			const uninitialised_factory = this._factories.get(name);
			if (uninitialised_factory) {
				this._di_logger.info("DI Container - injecting factory: %s", name);
				this._dependencies.set(name, this._inject(uninitialised_factory));
			}

			if (!this._dependencies.has(name))
				throw new Error("DI Container - cannot find module: " + name);
		}

		return this._dependencies.get(name);
	}

	private _check_duplicate_name(name:string):void{
		if(!this.has(name))
			return;

		const err = new Error(`Di Container - already has an object named ${name}`);
		this._di_logger.fatal(err);
		throw err;
	}

	private _inject(factory:IDiFactory) {
		// @ts-ignore
		let ctor = factory.prototype.constructor.toString();

		let args_list = ctor.match(/constructor\s?\(([^)]*)\)/).splice(1)[0];
		if(!args_list)
			return new (<any>factory)();

		// args_list = args_list.replace(" ", "");
		let args_array = args_list.split(",");

		// if (args_array.length <= 0)
		// 	return new (<any>factory)();

		// map them to the dependencies/factories
		let args = args_array.map((dependency:any) => {
			return this.get(dependency);
		});

		// instantiate and return
		return new (<any>factory)(...args);
	}
}
