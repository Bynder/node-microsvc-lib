/**
 * Created by pedrosousabarreto@gmail.com on 21/May/2019.
 */
"use strict";

"use strict";

import {IConfigsProvider} from "../../index";
import * as assert from "assert";

export class MockConfigsProvider implements IConfigsProvider {
	private _solution_name: string;
	private _kvs: Map<string, string>;
	private _mock_values:{};

	public get solution_name(): string {
		return this._solution_name;
	}

	constructor(solution_name: string, mock_values:{}) {
		this._kvs = new Map<string, string>();

		this._solution_name = solution_name;
		this._mock_values = mock_values;
	}

	init(keys: string[], callback: (err?: Error) => void): void {
		keys.forEach((key: string) => {
			if (this._mock_values.hasOwnProperty(key)) {
				// @ts-ignore
				this._kvs.set(key, this._mock_values[key]);
			}
		});

		callback();
	}

	get_value(key_name: string): string | null {
		return this._kvs.get(key_name) || null;
	}

}
