/**
 * Created by pedrosousabarreto@gmail.com on 19/Mar/2019.
 */


"use strict";

import * as async from "async";
import * as request from "request";
import * as Url from "url";
import {IConfigsProvider} from "../interfaces";
import {Response} from "request";
import undefinedError = Mocha.utils.undefinedError;

const BASE_SECRET_PATH = "/v1/secret/data/";

export class HashicorpVaultProvider implements IConfigsProvider{
	private _solution_name:string;
	private _service_name:string;
	private _vault_final_url:string;
	private _vault_token:string;
	private _kvs:Map<string, string>;

	public get solution_name():string{
		return this._solution_name;
	};

	constructor(solution_name:string, service_name:string, vault_base_url:string, vault_token:string){
		this._solution_name = solution_name;
		this._service_name = service_name;

		this._vault_final_url = Url.resolve(vault_base_url, Url.resolve(BASE_SECRET_PATH, solution_name+"/"+service_name));

		this._vault_token = vault_token;
		this._kvs = new Map<string, string>();
	}


	async init(keys:string[]):Promise<void>{
		return this._fetch_all_from_vault(keys);
	}

	get_value(key_name:string):string|null{
		return this._kvs.get(key_name) || null;
	}

	private async _fetch_all_from_vault(keys:string[]): Promise<void> {
		return new Promise((resolve, reject)=> {
			request.get(this._vault_final_url, {
				json: true,
				auth: {bearer: this._vault_token}
			}, (error: any, response: Response, body: any) => {
				//console.log(body);
				// TODO handler error
				if (response && response.statusCode == 200) {
					keys.forEach((key_name: string) => {
						const val = this._get_value_from_resp_body(key_name, body);
						if (val)
							this._kvs.set(key_name, val)
					});
				}

				resolve()
			});
		});
	}


	private _get_value_from_resp_body(key_name:string, body:any):string|null{
		if(body.hasOwnProperty("data") && body.data.hasOwnProperty("data") && body.data.data.hasOwnProperty(key_name)){
			return body.data.data[key_name] || null;
		}

		return null;
	}
}
