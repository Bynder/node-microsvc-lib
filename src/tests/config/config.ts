/**
 * Created by pedrosousabarreto@gmail.com on 15/Jan/2019.
 */


"use strict";

import {ServiceConfigs, AppBaseConfigs} from "../../index";
import {IConfigsProvider} from "../../index";
import {MockConfigsProvider} from "../mocks/config_provider_mock";

let app_base_confs = new AppBaseConfigs();
app_base_confs.env = process.env.APP_ENV || 'dev_local';
app_base_confs.solution_name = "my_solution";
app_base_confs.app_name = "my_app";
app_base_confs.app_version = "0.0.1";
app_base_confs.app_api_prefix = "";
app_base_confs.app_api_version = "1";

let provider:IConfigsProvider|null;

provider = new MockConfigsProvider(app_base_confs.solution_name, {secret1: "my_secret1_value", should_not_be:"this should not be in the configs "});

// exports a ServiceConfigs instance
export = new ServiceConfigs(__dirname, app_base_confs, provider);
// export = new ServiceConfigs(svc_params, aws_secrets_manager_provider, app_base_confs);
// export = new ServiceConfigs(svc_params, vault_provider, app_base_confs);