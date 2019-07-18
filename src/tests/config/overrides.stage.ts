/**
 * Created by pedrosousabarreto@gmail.com on 21/Mar/2019.
 */
"use strict";

import {ServiceConfigs} from "../../index";

module.exports = function(configs:ServiceConfigs){
	// override params, feature_flags or secrets values'

	configs.override_param_value("kafka_conn_string", "stage:9092");

};