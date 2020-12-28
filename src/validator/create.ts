import { IValidateNode, IInput } from './validateNode';
import ValidateNode from './validateNode';

let pid = 0;

export const create = (input: IInput) : ValidateNode => {
	const children: ValidateNode[] | undefined = input.children?.map(c => create(c));
	const vm = new ValidateNode(
		input?.name || (pid++).toString(),
		input?.value,
		input.functions || [],
		children,
		input.isLazy,
		input.options);
	children?.forEach(c => { // add parent
		c.subscribers.push(vm);
	});
	children?.forEach(c => { // then force update for send data from child
		c.forceUpdate();
	});
	return vm;
}