/**
 * Created by pedrosousabarreto@gmail.com on 15/Jan/2019.
 */
"use strict";

export enum LogLevels {
	TRACE =  	"TRACE",
	DEBUG = 	"DEBUG",
	INFO = 		"INFO",
	WARN =		"WARN",
	ERROR = 	"ERROR",
	FATAL = 	"FATAL",
}

export interface ILogger {
	debug(message?: any, ...optionalParams: any[]): void;
	info(message?: any, ...optionalParams: any[]): void;
	warn(message?: any, ...optionalParams: any[]): void;
	error(message?: any, ...optionalParams: any[]): void;
	fatal(message?: any, ...optionalParams: any[]): void;

	create_child(attrs?:object):ILogger;
}

export interface IDiFactory {
	name: string;
	init():Promise<void>;
	destroy():Promise<void>;
}

export interface IConfigsProvider{
	readonly solution_name:string;
	init(keys:string[]):Promise<void>;
	get_value(key_name:string):string|null;
}
