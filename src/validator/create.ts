import { IValidateNode, IInput } from './validateNode';
import ValidateNode from './validateNode';

export const create = (input: IInput) : ValidateNode => {
	const children: ValidateNode[] | undefined = input.children?.map(c => create(c));
	const vm = new ValidateNode(
		input.name,input.value,
		input.functions || [],
		children,
		input.isLazy,
		input.options);
	children?.forEach(c => {
		c.subscribers.push(vm);
	});

	return vm;
}
