/**
 * Created by pedrosousabarreto@gmail.com on 01/Feb/2019.
 */

"use strict";

import "mocha";
import {expect} from "chai"
const http = require('http');
import {ServerResponse} from "http";

import {ObjectUtils, ServiceConfigs, ILogger,Microservice} from "../index";
import {HealthCheck} from "./factories/health_check";
import {BunyanLogger} from "../bunyan_logger";
import {ConsoleLogger} from "../console_logger";
import {JSONLogger} from "../json_logger";
import {ParamTypes, ServiceFeatureFlag, ServiceParams} from "../service_params";


process.env["TEST_PARAM"]= "env_var_value";
process.env["APP_ENV"]= "stage";

describe('main', () => {
	let logger:ILogger;

	let app:Microservice;
	let configs:ServiceConfigs;

	const start_time = Date.now();
	configs = require("./config/config");

	logger = new ConsoleLogger();
	//logger = new BunyanLogger(configs, "./log/sub/tests.log");

	// create microservice app, no init yet
	const app_without_logger = new Microservice(configs); // for test coverage only

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
		app.init().catch((err) => {
			done(err);
		}).then(()=> {
			done();
		});
	});

	after( (done)=>{
		app.destroy().catch((err) => {
			done(err);
		}).then(()=> {
			console.log("---all destroys done");
			done();
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

		it("duplicate name", () => {
			// expect(app.register_dependency.bind(app,"logger", {})).to.throw;
			try {
				app.register_dependency("logger", {})
			}catch(err){
				expect(err);
			}
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


	describe("Loggers", ()=>{
		it("console logger", ()=>{
			const logger: ILogger = new ConsoleLogger();
			logger.debug("debug test");
			logger.info("info test");
			logger.warn("warn test");
			logger.error(new Error("new error for error test"), "desc for error test");
			logger.fatal("fatal test");
		});

		it("bunyan logger", ()=>{
			const logger: ILogger = new BunyanLogger(configs, "./log/sub/tests.log");
			logger.create_child({"test_child_attr":"test_child_attr_value"});
			logger.debug("debug test");
			logger.info("info test");
			logger.warn("warn test");
			logger.error(new Error("new error for error test"), "desc for error test");
			logger.fatal("fatal test");


			logger.create_child();
		});

		it("JSON logger", ()=>{
			const logger: ILogger = new JSONLogger(configs);
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
		it("fixed configs", ()=>{
			expect(configs.env).to.eq(process.env["APP_ENV"]);
			expect(configs.solution_name).to.eq("my_solution");
			expect(configs.app_name).to.eq("my_app");
			expect(configs.app_version).to.eq("0.0.1");
			expect(configs.app_api_prefix).to.eq("");
			expect(configs.app_api_version).to.eq("1");
		});

		it("computed configs", ()=>{
			expect(configs.dev_mode).to.eq(false);
			expect(configs.app_full_name).to.eq(configs.solution_name+ "__"+configs.env+"__"+configs.app_name);
			expect(configs.app_full_name_version).to.eq(configs.app_full_name+"__"+configs.app_version);
			expect(configs.app_base_url).to.eq("/");
			expect(configs.instance_id).to.be.not.null;
			expect(configs.instance_name).to.be.eq(configs.app_full_name_version + "__" + configs.instance_id);
		});
	});

	describe("params", ()=>{
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

		it("duplicate param detection", ()=>{
			let params = new ServiceParams();
			params.add_param(
				"dupe_test_param",ParamTypes.STRING,
				"dupe_test_param_val",
				"dupe_test_param param to test duplicate check"
			);
			expect(params.add_param.bind(params,
				"dupe_test_param", ParamTypes.STRING,
				"dupe_test_param_val",
				"dupe_test_param param to test duplicate check"
			)).to.throw();
		});

		it("get param", ()=>{
			let params = new ServiceParams();

			params.add_param(
				"get_param",ParamTypes.STRING,
				"value",
				"get_param param to test get check"
			);
			const param = params.get_param("get_param");
			expect(param?.default_value).to.eq("value");

			const not_param = params.get_param("not_found");
			expect(not_param).to.be.null;
		});

		it("get feature flag", ()=>{
			let params = new ServiceParams();

			params.add_feature_flag(
				"flag1", true,
				"test feature flag"
			);
			const feature_flag = params.get_feature_flag("flag1");
			expect(feature_flag?.default_value).to.eq(true);

			const not_feature_flag = params.get_feature_flag("not_found");
			expect(not_feature_flag).to.be.null;
		});

		it("get secret", ()=>{
			let params = new ServiceParams();

			params.add_secret(
				"secret1", "ultra_top_max_secret",
				"test secrets"
			);
			const secret = params.get_secret("secret1");
			expect(secret?.default_value).to.eq("ultra_top_max_secret");
		});

		it("get secret", ()=>{
			let params = new ServiceParams();

			params.add_secret(
				"secret2", null,
				"test secrets"
			);
			const secret = params.get_secret("secret2");
			expect(secret?.default_value).to.null;

			const not_found_secret = params.get_secret("not_found_secret");
			expect(not_found_secret).to.be.null;
		});
	});


});

