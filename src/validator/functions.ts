import { TValidateFunction as t } from './validateNode';

export const all: t = {
	f: (value, children) => children?.map(c => c.isValid).every(_ => _ ) || false,
}

export const email: t = {
	f: ((value, children) => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value.toLowerCase())),
}

export const equal = (input: string): t => {
	return {
		f: ((value, children) => value === input)
	}
}

export const age: t = {
	f: ((value, children) => value>=1 && value <= 130)
}

export const tel: t = {
	f: ((value, children) => /^\d{11}$/.test(value))
}
