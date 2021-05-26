/**
 * Created by pedrosousabarreto@gmail.com on 15/Jan/2019.
 */

"use strict";

import {ParamTypes, ServiceParams} from "../../index";

let params = new ServiceParams();

params.add_param(
	"test_param",	 ParamTypes.STRING,
	"default_val",
	"test param to be overridden by env_var"
);

params.add_param(
	"http_port", ParamTypes.INT_NUMBER,
	3000,
	"http port for the service to listen on"
);

params.add_param(
	"ext_base_url", ParamTypes.STRING,
	"https://localhost",
	"external base url, ex: https://localhost:443"
);

params.add_param(
	"kafka_conn_string", ParamTypes.STRING,
	"localhost:9092",
	"kafka broker connection string - ex: 127.0.0.1:9092"
);

params.add_feature_flag(
	"RUN_EXPRESS_APP",
	true,
	"start the express application"
);

params.add_secret(
	"secret1",
	null,
	"db password example"
);

export = params;
