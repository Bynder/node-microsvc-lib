/**
 * Created by pedrosousabarreto@gmail.com on 15/Jan/2019.
 */
"use strict";

// import {strEnum} from "./string_utils";
// export const PARAM_TYPES = strEnum([
// 	'STRING',
// 	'BOOL',
// 	'INT_NUMBER',
// 	'FLOAT_NUMBER'
// ]);

export enum ParamTypes {
	"STRING"= "STRING",
	"BOOL" = "BOOL",
	"INT_NUMBER" = "INT_NUMBER",
	"FLOAT_NUMBER" = "FLOAT_NUMBER"
}

/** type from string enum */
// export type ParamType = keyof typeof PARAM_TYPES;

/***
 * ServiceParams
 * An instance of this class is required to configure a service.
 * This will act like the schema of available of parameters, feature flags and secrets for a service.
 */

export class ServiceParams{
	private _uppercase_key_names:string[];
	private _original_key_names:string[];
	private _params:Map<string, ServiceParam>;
	private _feature_flags:Map<string, ServiceFeatureFlag>;
	private _secrets:Map<string, ServiceSecret>;

	constructor(){
		this._uppercase_key_names = [];
		this._original_key_names = [];
		this._params = new Map<string, ServiceParam>();
		this._feature_flags = new Map<string, ServiceFeatureFlag>();
		this._secrets = new Map<string, ServiceSecret>();
	}

	has(name:string):boolean{
		return this._uppercase_key_names.indexOf(name.toUpperCase()) != -1;
	}

	private _register_key_name(name:string){
		this._original_key_names.push(name);
		this._uppercase_key_names.push(name.toUpperCase());
	}

	all_keys():string[]{
		return this._original_key_names;
	}

	private _check_name(name:string){
		if(this.has(name.toUpperCase()))
			throw new Error(`Duplicate param name detected - name: ${name}`);
	}

	// params

	// add_param(name:string, type:ParamType, default_value:any, description:string){
	add_param(name:string, type:ParamTypes, default_value:any, description:string){
		const param = new ServiceParam(name, type, default_value, description);
		this._check_name(param.name);

		this._params.set(param.name, param);

		this._register_key_name(param.name);
	}

	get_param(param_name:string):ServiceParam | null{
		return this._params.get(param_name) || null;
	}

	get_all_params():Array<ServiceParam>{
		return Array.from(this._params.values());
	}

	// feature flags

	add_feature_flag(name:string, default_value:boolean, description:string){
		const feature_flag = new ServiceFeatureFlag(name, default_value, description);
		this._check_name(feature_flag.name);

		this._feature_flags.set(feature_flag.name.toUpperCase(), feature_flag);

		this._register_key_name(feature_flag.name);
	}

	get_feature_flag(feature_flag_name:string):ServiceFeatureFlag | null{
		return this._feature_flags.get(feature_flag_name.toUpperCase()) || null;
	}

	get_all_feature_flags():Array<ServiceFeatureFlag>{
		return Array.from(this._feature_flags.values());
	}

	// secrets

	add_secret(name:string, default_value:string | null, description:string){
		const secret = new ServiceSecret(name, default_value, description);
		this._check_name(secret.name);

		this._secrets.set(secret.name, secret);

		this._register_key_name(secret.name);
	}

	get_secret(secret_name:string):ServiceSecret | null{
		return this._secrets.get(secret_name) || null;
	}

	get_all_secrets():Array<ServiceSecret>{
		return Array.from(this._secrets.values());
	}

/*
	// this will update the passed
	public override_from_env_file(base_config_path:string, app_base_confs:AppBaseConfigs):void{
		const filename = path.resolve(base_config_path, "params." + app_base_confs.env);
		// if(process.env.hasOwnProperty("LOCAL_OVERRIDES")){
			try{
				require(filename)(app_base_confs, this);
				console.info(`ENV VAR name based param file LOADED from path: ${filename}`);
			} catch(e){
				console.info(`ENV VAR name based param file NOT FOUND in path: ${filename}`);
			}
		// }
	}
*/

}

export class ServiceParam{
	// constructor(private _name:string, private _type:ParamType, private _default_value:any, private _description:string){}
	constructor(private _name:string, private _type:ParamTypes, private _default_value:any, private _description:string){}

	get name():string{ return this._name;}
	// get type():ParamType{ return this._type;}
	get type():ParamTypes{ return this._type;}
	get default_value():any{ return this._default_value;}
	get description():string{ return this._description;}
}

export class ServiceFeatureFlag{
	constructor(private _name:string, private _default_value:boolean, private _description:string){}

	get name():string{ return this._name; }
	get default_value():boolean{ return this._default_value; }
	get description():string{ return this._description; }
}

export class ServiceSecret{
	constructor(private _name:string, private _default_value:string | null, private _description:string){}

	get name():string{ return this._name; }
	get default_value():string|null{ return this._default_value; }
	get description():string{ return this._description; }
}


