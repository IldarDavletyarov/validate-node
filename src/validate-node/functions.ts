import { TValidateFunction as t } from './validateNode';

export const all: t<any> = {
	f: (value, children) => ({ value: children?.map(c => c.isValid).every(_ => _ ) || false, errors: []}),
	children: undefined,
};

export const email: t<string> = {
	f: ((value, children) => ({
		value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			.test(value.toLowerCase()),
		errors: []
	})),
	children: [],
};

export const equal = (input: string): t<any> => {
	return {
		f: ((value, children) => ({ value: value === input, errors: [] })),
		children: []
	}
};

export const tel: t<string> = {
	f: ((value, children) =>({ value: /^\d{11}$/.test(value), errors: [/^\d{11}$/.test(value) ? 'норм' : 'неправильно'] })),
	children: []
};
