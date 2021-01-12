type TOutput = {
	value: boolean,
	errors: string[],
};

export type TValidateFunction<T> = {
		f: (value: T, children: IValidateNode<any>[]) => TOutput,
		children: string[] | undefined,
	};

export type TLinterFunction<T> = <T>(value: T) => T

type TUpdateData = { childNames: string[] };

type TOptions<T> = {
	onChildUpdate: (data: TUpdateData) => any,
	onSelfUpdate: <T>(data: IValidateNode<T>) => any,
	endChildUpdate: (data: TUpdateData) => any,
	endSelfUpdate: <T>(data: IValidateNode<T>) => any,
	allErrors: boolean,
	linters: TLinterFunction<T>[],
};

const initialOptions: TOptions<any> = {
	onChildUpdate: () => {},
	onSelfUpdate: () => {},
	endChildUpdate: () => {},
	endSelfUpdate: () => {},
	allErrors: true,
	linters: [],
};

export const mergeOptions = <T>(options: TOptions<T> | undefined): TOptions<any> => {
	let result: TOptions<any> = {...initialOptions};
	if (!options) {
		return result;
	}
	for(const key in options) {
		if (result.hasOwnProperty(key)) {
			(result as {[index: string]: any})[key] = (options as { [index: string]: any })[key];
		}
	}
	return result;
};

export interface IInput<T> {
	name: string | undefined;
	value: T;
	functions: TValidateFunction<T>[] | undefined;
	children: IInput<any>[] | undefined;
	isLazy: boolean | undefined;
	options: TOptions<T>;
}

export interface IValidateNode<T> {
	name: string;
	value: T;
	functions: TValidateFunction<T>[];
	cacheFunctions: TOutput[];
	children: IValidateNode<T>[];
	subscribers: IValidateNode<T>[];
	options: TOptions<T>;
	isValid: TOutput['value'];
	errors: TOutput['errors'];
	onUpdate: boolean;
	handler: (input:T, onLintUpdate: ((value: T) => any) | undefined) => Promise<void>;
	child: (...args: string[] | string[][]) => IValidateNode<any> | undefined
}

export default class ValidateNode<T> implements IValidateNode<T> {
	name: string;

	value: T;

	readonly functions: TValidateFunction<T>[];

	cacheFunctions: TOutput[] = [];

	updateOnStack: TUpdateData[];

	children: ValidateNode<any>[];

	public get isValid(): TOutput['value'] {
		for (let i = 0; i < this.cacheFunctions.length; i++) {
			if (!this.cacheFunctions[i].value) {
				return false;
			}
		}
		return true;
	}

	public get errors(): TOutput['errors'] {
		let errors: string[] = [];
		for (let i = 0; i < this.cacheFunctions.length; i++) {
			if (!this.cacheFunctions[i].value) {
				errors = errors.concat(this.cacheFunctions[i].errors);
				if (!this.options.allErrors) {
					break;
				}
			}
		}
		return errors;
	}

	public get onUpdate(): boolean {
		return this.updateOnStack.length !== 0;
	}

	subscribers: ValidateNode<any>[];

	options: TOptions<T>;

	public async handler(newValue: T, onLintUpdate: ((value: T) => T) | undefined = undefined): Promise<void> {

		let value: T = newValue;
		this.options?.linters.forEach(l => {
			value = l(value);
		});
		if (value !== newValue && onLintUpdate) { // lint detected
			onLintUpdate(value);
		}

		this.value = value;

		this.startUpdate();
		await this.updateCacheFunctions(undefined, true);
		this.finishUpdate(); // await
	}

	public async forceUpdate(): Promise<void> {
		this.startUpdate();
		await this.updateCacheFunctions(undefined,true);
		this.finishUpdate();
	}

	public child(...children: string[] | string[][]): IValidateNode<any> | undefined {
		let v: ValidateNode<any> | undefined = this;
		let resultChildren: string[] | string[][] = Array.isArray(children[0]) ? children[0] : children;
		resultChildren.forEach(( _: string | string[]) => {
			v = v?.children.find(c => c.name === _)
		});
		return v;
	}

	private async initCacheFunctions(): Promise<void> {
		this.cacheFunctions = [];
		for (let i = 0; i < this.functions.length; i++) {
			this.cacheFunctions.push( await this.functions[i].f(this.value,this.children));
		}
	}
	private async updateCacheFunctions(childName: string | undefined = undefined, isForce: boolean = false): Promise<void> {
		if (this.functions.length !== this.cacheFunctions.length) { // need initialize
			await this.initCacheFunctions();
			return;
		}
		for (let i = 0; i < this.functions.length; i++) {
			if (!isForce && (Array.isArray(this.functions[i].children)) && (!childName || !this.functions[i].children?.includes(childName))) { // lazy factor
				continue;
			}
			this.cacheFunctions[i] = await this.functions[i].f(this.value, this.children);
		}
	}

	private startUpdate(): void {
		const data = {childNames: [this.name]};
		this.updateOnStack.push(data);
		this.sendParentOnUpdate(data, 0);
	}

	private async finishUpdate(): Promise<void> {
		this.updateOnStack.pop();
		await this.sendParentEndUpdate({childNames: [this.name]}, 0);
	}

	public onChildUpdate(data: TUpdateData, deep: number): void { // invoke from child
		this.options.onChildUpdate(data);
		this.updateOnStack.push(data); // @todo abort previous async updates
		this.sendParentOnUpdate({ childNames:[...data.childNames, this.name] }, deep + 1);
	}

	public async endChildUpdate(data: TUpdateData, deep: number): Promise<void> { // invoke from child
		this.options.endChildUpdate(data);
		await this.updateCacheFunctions(data.childNames.pop());
		this.updateOnStack.pop();
		this.sendParentEndUpdate({ childNames:[...data.childNames, this.name] }, deep + 1);
	}

	private sendParentOnUpdate(data: TUpdateData, deep: number): void {
		this.options.onSelfUpdate(this);
		if (this.subscribers.length > 0) {
			this.subscribers.forEach(s => {
				s.onChildUpdate(data, deep);
			});
		}
	}

	private async sendParentEndUpdate(data: TUpdateData, deep: number): Promise<void> {
		this.options.endSelfUpdate(this);
		if (this.subscribers.length > 0) {
			for (let i = 0; i < this.subscribers.length; i++) {
				await this.subscribers[i].endChildUpdate(data, deep);
			}
		}
	}

	constructor(
		name: string,
		value: T,
		functions: TValidateFunction<T>[] = [],
		children: ValidateNode<any>[] = [],
		isLazy: boolean = false,
		options : TOptions<T> | undefined = undefined,
		subscribers: ValidateNode<any>[] = []
	) {
		this.updateOnStack = [];
		this.name = name;
		this.value = value;
		this.functions = functions;
		this.children = children;
		this.subscribers = subscribers;
		this.options = mergeOptions(options);
		if (!isLazy) {
			this.initCacheFunctions().then();
		}
	}
}
