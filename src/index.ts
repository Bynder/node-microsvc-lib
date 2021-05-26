/**
 * Created by pedrosousabarreto@gmail.com on 15/Jan/2019.
 */
"use strict";
import {HashicorpVaultProvider as imp_HashicorpVaultProvider} from "./config_providers/hashicorp_vault";
import {AWSSecretsManagerProvider as imp_AWSSecretsManagerProvider} from "./config_providers/aws_secrets_manager";
import * as Interfaces from "./interfaces";
import {ConsoleLogger as imp_ConsoleLogger} from "./console_logger";
import {JSONLogger as imp_JSONLogger} from "./json_logger";
import {BunyanLogger as imp_BunyanLogger} from "./bunyan_logger";
import {DiContainer as imp_DiContainer} from "./di_container";
import {Microservice as imp_Microservice} from "./microservice";

import * as imp_ServiceConfigs from "./service_configs";
import * as imp_ServiceParams from "./service_params";
import * as imp_ObjectUtils from "./objects_utils";


// export namespace NodeMicroSVCLib{
	export type ILogger = Interfaces.ILogger;
	export type IDiFactory = Interfaces.IDiFactory;
	export type IConfigsProvider = Interfaces.IConfigsProvider;

	export type ConsoleLogger = imp_ConsoleLogger;
	export const ConsoleLogger = imp_ConsoleLogger;

	export type JSONLogger = imp_JSONLogger;
	export const JSONLogger = imp_JSONLogger;

	export type BunyanLogger = imp_BunyanLogger;
	export const BunyanLogger = imp_BunyanLogger;

	export type DiContainer = imp_DiContainer;
	export const DiContainer = imp_DiContainer;

	export type Microservice = imp_Microservice;
	export const Microservice = imp_Microservice;

	export type ServiceConfigs = imp_ServiceConfigs.ServiceConfigs;
	export const ServiceConfigs = imp_ServiceConfigs.ServiceConfigs;
	export type AppBaseConfigs = imp_ServiceConfigs.AppBaseConfigs;
	export const AppBaseConfigs = imp_ServiceConfigs.AppBaseConfigs;


	export type ServiceParams = imp_ServiceParams.ServiceParams;
	export const ServiceParams = imp_ServiceParams.ServiceParams;
	export type ServiceParam = imp_ServiceParams.ServiceParam;
	export const ServiceParam = imp_ServiceParams.ServiceParam;
	export type ServiceFeatureFlag = imp_ServiceParams.ServiceFeatureFlag;
	export const ServiceFeatureFlag = imp_ServiceParams.ServiceFeatureFlag;
	export type ServiceSecret = imp_ServiceParams.ServiceSecret;
	export const ServiceSecret = imp_ServiceParams.ServiceSecret;

	// export type ParamType = imp_ServiceParams.ParamType;

	// export const PARAM_TYPES = imp_ServiceParams.PARAM_TYPES;
	export const ParamTypes = imp_ServiceParams.ParamTypes;

	export const HashicorpVaultProvider = imp_HashicorpVaultProvider;
	export const AWSSecretsManagerProvider = imp_AWSSecretsManagerProvider;

	export const ObjectUtils = imp_ObjectUtils;
// }



