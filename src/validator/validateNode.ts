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
		this.finishUpdate(); // await
	}

	public async forceUpdate(): Promise<void> {
		this.startUpdate();
		await this.updateCacheFunctions(undefined,true);
		this.finishUpdate();
	}

	public child(...children: string[] | string[][]): IValidateNode | undefined {
		let v: ValidateNode | undefined = this;
		let resultChildren: string[] | string[][] = Array.isArray(children[0]) ? children[0] : children;
		resultChildren.forEach(( _: string | string[]) => {
			v = v?.children.find(c => c.name === _)
		});
		return v;
	}

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
		this.options?.onChildUpdate(data);
		this.updateOnStack.push(data);
		this.sendParentOnUpdate({ childNames:[...data.childNames, this.name] }, deep + 1);
	}

	public async endChildUpdate(data: TUpdateData, deep: number): Promise<void> { // invoke from child
		this.options?.endChildUpdate(data);
		await this.updateCacheFunctions(data.childNames.pop());
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
		this.subscribers = subscribers;
		this.options = options;
		if (!isLazy) {
			this.updateCacheFunctions().then();
		}
	}
}
