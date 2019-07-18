/**
 * Created by pedrosousabarreto@gmail.com on 01/Feb/2019.
 */


"use strict";
import "mocha";
import {expect} from "chai"
import * as async from "async";
import * as uuid from "uuid";
const http = require('http');
import {ServerResponse} from "http";

import {ObjectUtils, ServiceConfigs, ConsoleLogger, ILogger,Microservice} from "../index";
import {HealthCheck} from "./factories/health_check";
import {BunyanLogger} from "../bunyan_logger";


process.env["TEST_PARAM"]= "env_var_value";
process.env["APP_ENV"]= "stage";

describe('main', () => {
	let logger:ILogger;

	let app:Microservice;
	let configs:ServiceConfigs;

	const start_time = Date.now();
	configs = require("./config/config");

	// logger = new ConsoleLogger();
	logger = new BunyanLogger(configs, "./log/sub/tests.log");

	// create microservice app, no init yet
	app = new Microservice(configs, logger);

	app.register_dependency("logger", logger);
	app.register_dependency("test_dep", {key:"abc", value: 123});

	// register factories, order matters
	// app.register_factory("request_logger", RequestLogger);
	app.register_factory("health_check", HealthCheck);


	process.on("uncaughtException", (err:Error)=>{
		logger.fatal(err);
	});


	before((done) => {
		app.init((err?: Error) => {
			expect(err).to.not.exist;

			if (err){
				console.error(err);
				done(err);
			}

			done();
		});
	});

	after((done)=>{
		// @ts-ignore
		async.parallel([
			app.destroy.bind(app)
		], (err?: Error) => {
			expect(err).to.not.exist;

			if (err)
				console.error(err);
			else
				console.log("---all destroys done");

			done(err);
		});
	});


	describe("di container", () => {

		it("dependency exists", (done) => {
			const test_dep = app.get("test_dep");
			const logger_dep = app.get("logger");

			expect(test_dep).to.exist;
			expect(logger_dep).to.exist;
			done();
		});

		it("dependency does not exist", (done) => {
			try {
				const non_existing_dep = app.get("non_existing_dep");
				expect(non_existing_dep).to.not.exist;
			}catch(e){
				expect(e).to.exist;
			}

			done();
		});

	});

	describe("express app", ()=>{
		it("heath_check", (done)=>{

			http.get('http://localhost:3000/_health_check', (res: ServerResponse)=> {
				expect(res.statusCode).to.be.eq(200);
				done();
			});
		});

		it("non existent path", (done)=>{

			http.get('http://localhost:3000/non_existing', (res: ServerResponse)=> {
				expect(res.statusCode).to.be.eq(404);
				done();
			});
		});
	});


	describe("console_logger", ()=>{
		it("normal log", ()=>{
			logger.debug("debug test");
			logger.info("info test");
			logger.warn("warn test");
			logger.error(new Error("new error for error test"), "desc for error test");
			logger.fatal("fatal test");
		});


	});


	describe("object_utils", ()=>{
		it("ToCamelCase log", ()=>{
			const src = {my_key:"my_value"};
			const dst = ObjectUtils.ToCamelCase(src);

			expect(dst).to.haveOwnProperty("myKey");
			expect(dst).to.not.haveOwnProperty("my_key");
		});

		it("ToSnakeCase log", ()=>{
			const src = {myKey:"my_value"};
			const dst = ObjectUtils.ToSnakeCase(src);

			expect(dst).to.haveOwnProperty("my_key");
			expect(dst).to.not.haveOwnProperty("myKey");
		});

	});

	describe("configs", ()=>{
		it("override from param file with env name", ()=>{
			const param_val = configs.get_param_value("kafka_conn_string");
			expect(param_val).be.equal("stage:9092");

		});

		it("override from env_vars", ()=>{
			const param_val = configs.get_param_value("test_param");
			expect(param_val).be.equal("env_var_value");

		});

		it("override from service provider", ()=>{
			const secret_val = configs.get_secret_value("secret1");
			expect(secret_val).be.equal("my_secret1_value");

		});

	});


});

