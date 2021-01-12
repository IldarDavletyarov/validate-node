import { IInput, mergeOptions } from './validateNode';
import ValidateNode from './validateNode';

let pid = 0;

export const create = <T>(inputObj: {}, childAsProperty: boolean = false) : ValidateNode<T> => {
	const input = (inputObj as IInput<T>); // bad practice
	const children: ValidateNode<any>[] | undefined = input.children?.map(c => create(c, childAsProperty));
	const vn = new ValidateNode(
		input?.name || (pid++).toString(),
		input?.value,
		input.functions || [],
		children,
		input.isLazy,
		mergeOptions(input?.options));
	if (childAsProperty && children) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if(vn.hasOwnProperty(child.name)) {
				console.error(`create: child name "${child.name}" must not match property names of validate-node instance`, vn);
				break;
			}
			(vn as { [index: string]: any })[child.name] = child;
		}
	}

	children?.forEach(c => { // add parent
		c.subscribers.push(vn);
	});

	input.isLazy = input.isLazy || input.isLazy !== undefined;
	if (!input.isLazy) {
		children?.forEach(c => { // then force update for send data from child
			c.forceUpdate().then();
		});
	}
	return vn;
};
