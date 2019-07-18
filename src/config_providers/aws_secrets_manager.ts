"use strict";

import {IConfigsProvider} from "../interfaces";
import AWS = require("aws-sdk");
import {AWSError, SecretsManager} from "aws-sdk";
import * as assert from "assert";



export class AWSSecretsManagerProvider implements IConfigsProvider {
	private _solution_name: string;
	private _region: string;
	private _kvs: Map<string, string>;
	private _secret_name: string;
	private _aws_creds: IAWSCredentials;
	private _aws_role_name: string | null = null;
	private _aws_runtime_credentials!: AWS.Credentials;

	public get solution_name(): string {
		return this._solution_name;
	}

	constructor(solution_name: string, secret_name: string, region: string, aws_creds:IAWSCredentials, aws_role_name:string|null = null) {
		this._kvs = new Map<string, string>();

		this._solution_name = solution_name;
		this._region = region;
		this._secret_name = secret_name;
		this._aws_creds = aws_creds;
		this._aws_role_name = aws_role_name;

		assert.ok(this._region);
		assert.ok(this._secret_name);
		assert.ok(this._aws_creds.accessKeyId);
		assert.ok(this._aws_creds.secretAccessKey);
		// assert.ok(this._aws_creds.sessionToken); // this is optional
	}

	init(keys: string[], callback: (err?: Error) => void): void {
		if(this._aws_role_name){
			// assume role
			const sts = new AWS.STS({});
			const role_params = {
				RoleArn: this._aws_role_name,
				RoleSessionName: `${this._solution_name}_assume_role_session`
			};
			sts.assumeRole(role_params, (err, data) => {
				if (err)
					return callback(err);

				if(!data)
					return new Error(`AWSSecretsManagerProvider - Could not assume role and get credentials from it`);

				// successful response
				// @ts-ignore
				this._aws_runtime_credentials = new AWS.Credentials(data.Credentials.AccessKeyId, data.Credentials.SecretAccessKey, data.Credentials.SessionToken);

				this._fetch_all_from_aws_secrets_manager(keys, callback)
			});
		}else{
			// fetch all
			this._aws_runtime_credentials = new AWS.Credentials(this._aws_creds.accessKeyId, this._aws_creds.secretAccessKey, this._aws_creds.sessionToken);
			this._fetch_all_from_aws_secrets_manager(keys, callback);
		}
	}

	get_value(key_name: string): string | null {
		return this._kvs.get(key_name) || null;
	}

	private _fetch_all_from_aws_secrets_manager(keys: string[], callback: (err?: Error) => void) {
		const secrets_manager = new AWS.SecretsManager({region: this._region, credentials: this._aws_runtime_credentials});

		secrets_manager.getSecretValue(
			{SecretId: this._secret_name},
			(err: AWSError, secret_data: SecretsManager.Types.GetSecretValueResponse) => {
				if (err)
					return callback(err);

				try {
					// successful response
					const secrets = JSON.parse(String(secret_data.SecretString));

					keys.forEach((key: string) => {
						if (key in secrets) {
							this._kvs.set(key, secrets[key]);
						}
					});
					callback();
				} catch (e) {
					callback(e);
				}

			}
		);

	}
}


export interface IAWSCredentials{
	accessKeyId:string;
	secretAccessKey:string;
	sessionToken?:string;
}