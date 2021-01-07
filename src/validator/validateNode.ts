// ERRORS show errors lazy functions

// класс функции содержит сам предикат, список от чего зависит предикат, isValid, список всех ошибок, список активных ошибок.

const asyncEvery = async (arr: TValidateFunction[], predicate: (val:TValidateFunction) => Promise<boolean>) => {
	for (let e of arr) {
		if (!await predicate(e)) return false;
	}
	return true;
};

type TOutput = {
	value: boolean,
	errors: string[],
};

export type TValidateFunction =
	{
		f: (value: any | undefined, children: IValidateNode[] | undefined) => TOutput,
		children: string[] | undefined, // @ todo same children in f arg, need for lazy update
	};// todo strings with errors

type TUpdateData = { childNames: string[] };

type TOptions = {
	onChildUpdate: ((data: TUpdateData) => any),
	onSelfUpdate: ((data: IValidateNode) => any),
	endChildUpdate: ((data: TUpdateData) => any),
	endSelfUpdate: ((data: IValidateNode) => any),
	onlyFirstExceptions: boolean,
	lazyUpdating: boolean,
} | undefined;

export interface IInput {
	name: string | undefined;
	value: any | undefined;
	functions: TValidateFunction[] | undefined;
	children: IInput[] | undefined;
	isLazy: boolean | undefined;
	options: TOptions | undefined;
}

export interface IValidateNode {
	name: string;
	value: any;
	functions: TValidateFunction[];
	cacheFunctions: TOutput[];
	children: IValidateNode[];
	subscribers: IValidateNode[];
	options: TOptions;
	isValid: boolean;
	errors: string[];
	onUpdate: boolean;
	handler: (input:any) => Promise<any> | void;
	child: (...args: string[] | string[][]) => IValidateNode | undefined
}

export default class ValidateNode implements IValidateNode {
	name: string;

	value: any; // todo generic T

	readonly functions: TValidateFunction[];

	cacheFunctions: TOutput[] = [];

	updateOnStack: TUpdateData[];

	children: ValidateNode[];

	public get isValid(): boolean {
		for (let i = 0; i < this.cacheFunctions.length; i++) {
			if (!this.cacheFunctions[i].value) {
				return false;
			}
		}
		return true;
	}

	public get errors(): string[] {
		for (let i = 0; i < this.cacheFunctions.length; i++) {
			if (!this.cacheFunctions[i].value) {
				return this.cacheFunctions[i].errors;
			}
		}
		return [];
	}

	public get onUpdate(): boolean {
		return this.updateOnStack.length !== 0;
	}

	subscribers: ValidateNode[];

	options: TOptions;

	public async handler(newValue: any): Promise<void> {
		this.value = newValue;
		this.startUpdate();
		await this.updateCacheFunctions(undefined, true);
		// await this.updateIsValid();
		this.finishUpdate(); // await
	}

	public async forceUpdate(): Promise<void> {
		this.startUpdate();
		await this.updateCacheFunctions(undefined,true);
		// await this.updateIsValid();
		this.finishUpdate();
	}

	public child(...args: string[] | string[][]): IValidateNode | undefined {
		let v: ValidateNode | undefined = this;
		let children: string[] | string[][] = Array.isArray(args[0]) ? args[0] : args;
		children.forEach(( _: string | string[]) => {
			v = v?.children.find(c => c.name === _)
		});
		return v;
	}

	// private async updateIsValid(): Promise<void> {
	// 	this.isValid = await asyncEvery(this.functions, async({ f }) => {
	// 		return await f(this.value, this.children);
	// 	});
	// }

	private async initCacheFunctions(): Promise<void> {
		for (let i = 0; i < this.functions.length; i++) {
			this.cacheFunctions.push( await this.functions[i].f(this.value,this.children));
		}
	}
	private async updateCacheFunctions(childName: string | undefined = undefined, isForce: boolean = false): Promise<void> {
		for (let i = 0; i < this.functions.length; i++) {
			if (!isForce && (Array.isArray(this.functions[i].children)) && (!childName || !this.functions[i].children?.includes(childName))) { // lazy factor
				continue;
			}
			this.cacheFunctions[i] = await this.functions[i].f(this.value, this.children);
		}
	}

	// private async updateIsValidLazy(childName: string | undefined): Promise<void> {
	// 	if (!childName) {
	// 		this.updateIsValid();
	// 	} else {
	// 		this.isValid = await asyncEvery(this.functions.filter(f => !f.children.includes(childName)), async ({ f }) => {
	// 			return await f(this.value, this.children);
	// 		});
	// 	}
	// }

	private startUpdate(): void {
		// this.onUpdate = true;
		const data = {childNames: [this.name]};
		this.updateOnStack.push(data);
		this.sendParentOnUpdate(data, 0);
	}

	private async finishUpdate(): Promise<void> {
		this.updateOnStack.pop();
		// this.onUpdate = false;
		await this.sendParentEndUpdate({childNames: [this.name]}, 0);
	}

	public onChildUpdate(data: TUpdateData, deep: number): void { // invoke from child
		this.options?.onChildUpdate(data);
		this.updateOnStack.push(data);
		// this.onUpdate = true;
		this.sendParentOnUpdate({ childNames:[...data.childNames, this.name] }, deep + 1);
	}

	public async endChildUpdate(data: TUpdateData, deep: number): Promise<void> { // invoke from child
		this.options?.endChildUpdate(data);
		// lazy is not work
		// await this.updateIsValidLazy(data.childNames.pop());
		await this.updateCacheFunctions(data.childNames.pop());
		// await this.updateIsValid();
		// this.onUpdate = false;
		this.updateOnStack.pop();
		this.sendParentEndUpdate({ childNames:[...data.childNames, this.name] }, deep + 1); // probable problem with order
	}

	private sendParentOnUpdate(data: TUpdateData, deep: number): void {
		this.options?.onSelfUpdate(this);
		if (this.subscribers.length > 0) {
			this.subscribers.forEach(s => {
				s.onChildUpdate(data, deep);
			});
		}
	}

	private async sendParentEndUpdate(data: TUpdateData, deep: number): Promise<void> {
		this.options?.endSelfUpdate(this);
		if (this.subscribers.length > 0) {
			for (let i = 0; i < this.subscribers.length; i++) {
				await this.subscribers[i].endChildUpdate(data, deep);
			}
		}
	}

	// private setParent(): void {
	// 	this.children.forEach(n => {
	// 		n.parent = this;
	// 	})
	// }

	constructor(
		name: string,
		value: any,
		functions: TValidateFunction[],
		children: ValidateNode[] = [],
		isLazy: boolean = false,
		options : TOptions = undefined,
		subscribers: ValidateNode[] = []
	) {
		this.updateOnStack = [];
		this.name = name;
		this.value = value;
		this.functions = functions;
		this.children = children;
		this.initCacheFunctions().then();
		// this.isValid = false;
		this.subscribers = subscribers;
		this.options = options;
		if (!isLazy) {
			this.updateCacheFunctions().then();
			// this.updateIsValid().then(r => {});
		}
	}
}
