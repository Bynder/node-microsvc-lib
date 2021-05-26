/**
 * Created by pedrosousabarreto@gmail.com on 15/Jan/2019.
 */
"use strict";

/**
 * Utility function to create a K:V from a list of strings
 * source: https://basarat.gitbooks.io/typescript/docs/types/literal-types.html
 * */
// // @ts-ignore
// export function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
// 	// @ts-ignore
// 	// @ts-ignore
// 	return o.reduce((res, key) => {
// 		res[key] = key;
// 		return res;
// 	}, Object.create(null));
// }
//
// // @ts-ignore
// const guid_regex: RegExp = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
//
// export function is_guid(str:string):boolean{
// 	return guid_regex.exec(str) !== null;
// }
