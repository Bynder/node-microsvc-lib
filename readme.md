# node-microsvc-lib
[![Git Commit](https://img.shields.io/github/last-commit/pedrosousabarreto/node-microsvc-lib.svg?style=flat)](https://github.com/pedrosousabarreto/node-microsvc-lib/commits/master)
[![Npm Version](https://img.shields.io/npm/v/node-microsvc-lib.svg?style=flat)](https://www.npmjs.com/package/node-microsvc-lib)
[![NPM Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/node-microsvc-lib.svg?style=flat)](https://www.npmjs.com/package/node-microsvc-lib)
[![CircleCI](https://circleci.com/gh/pedrosousabarreto/node-microsvc-lib.svg?style=svg)](https://circleci.com/gh/pedrosousabarreto/node-microsvc-lib)


## Installation

```bash
npm install node-microsvc-lib --save
```

## Usage

Creating a microservice app:

*app.ts*
 ```javascript
"use strict";

import {Microservice, ConsoleLogger} from "node-microsvc-lib";

// factories/modules
import {RequestLogger} from "./factories/request_logger";
import {HealthCheck} from "./factories/health_check";
import {TestRestCtrl} from "./factories/rest_service";

// configs
import configs = require("./config/config");

const logger = new ConsoleLogger();

// create microservice appv
const app = new Microservice(configs, logger);

app.register_dependency("logger", logger);

app.register_factory("request_logger", RequestLogger);
app.register_factory("test_rest_ctrl", TestRestCtrl);
app.register_factory("health_check", HealthCheck);

process.on("uncaughtException", (err:Error)=>{
   logger.fatal(err);
});

app.init().catch((err) => {
    return logger.error(err);
}).then(()=> {
    logger.info("APP STARTED");
});

```

## How configuration works

The *Microservice* instance expects a *ServiceConfigs* instance. 
This *ServiceConfigs* instance requires the base dir `__dirname`, an instance of *AppBaseConfigs* and an (optional) instance of *IConfigsProvider*. 

Three sets of configuration values exist: 
- Parameters - values can be of type STRING, BOOL, INT_NUMBER or FLOAT_NUMBER;
- Feature Flags - values are always of boolean type;
- Secrets - values are always of string type.

##### ServiceConfigs *(Required for Microservice obj instantiation)*
This is the object that the *Microservice* requires to source all its runtime configurations.

##### IConfigsProvider *(Optional)*
Optional instance that fetches all config values from an external service such as consul or hashicorp vault. 

#### Load order / precedence
The order of loading:
1. **params.js file** - ServiceParams instance gets loaded along with the default values;
2. **params.ENV_NAME.js file** - the one that overrides values in ServiceParams per env;
3. **IConfigsProvider** - if a correspondent key name exists the value from the provider overrides the current one *(after app/microservice init)*;
4. **Environment vars** - all parameters can be overridden by passing an uppercase env var with the param key name *(after app/microservice init)*

In summary, env vars always win (if defined).

### Minimum config structure

```
src/config/config.ts (main config object) 
src/config/param.ts (default params definition)
```

### Example of config code structure
See [the ref implementaion](https://github.com/pedrosousabarreto/node-microsvc-lib/tree/master/src/tests/config])

*config/config.ts*
```javascript
"use strict";

import {ServiceConfigs, AppBaseConfigs} from "node-microsvc-lib";

let app_base_confs = new AppBaseConfigs();
app_base_confs.env = process.env.APP_ENV || 'dev_local';
app_base_confs.solution_name = "my_solution";
app_base_confs.app_name = "my_app";
app_base_confs.app_version = "0.0.1";
app_base_confs.app_api_prefix = "";
app_base_confs.app_api_version = "1";

export = new ServiceConfigs(__dirname, app_base_confs, null);
```
*config/params.ts*
```javascript
"use strict";

import {ParamTypes, ServiceParams} from "node-microsvc-lib";
let params = new ServiceParams();

params.add_param(
	"test_param",
	ParamTypes.STRING, 
	"default_val",
	"test param to be overridden by env_var"
);
 
params.add_feature_flag(
	"RUN_EXPRESS_APP",
	true, 
	"start the express application"
);

params.add_secret(
	"secret1", 
	null, // secrets should be loaded from an IServiceProvider or a non-github-tracked per env override file 
	"db password example"
);

export = params;
```

*config/overrides.stage.ts (optional file see step 2 above - where "stage" comes from APP_ENV)*
```javascript
"use strict";

import {ServiceParams} from "node-microsvc-lib";

module.exports = function(configs:ServiceConfigs){
	// override params, feature_flags or secrets values'

	configs.override_param_value("kafka_conn_string", "stage:9092");

};
```

## Pre-requisites for contributing
NVM - Node Version Manager - https://github.com/creationix/nvm
 ```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

After NVM is installed, go to the proect directory and execute this to download and install the correct node version:
```bash
nvm install -s
```
