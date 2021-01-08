import { IValidateNode } from './validateNode';

let handler: (e: Event) => Promise<void>;
let eventType: string;

export const validate = {
  bind(el: HTMLInputElement, binding : { value: IValidateNode, modifiers: any, arg: string | undefined }) {
    if (!binding.value) {
      console.error(`v-validate: pass validate-node for the element:`,el);
      return;
    }

    const children = Object.keys(binding.modifiers);

    let v: IValidateNode | undefined = binding.value.child(children);

    if (!v) {
      console.error(`v-validate: passed child (path: ${children}) is undefined:`,el);
      return;
    }

    el.value = v?.value;
    handler = async (e: Event): Promise<void> => {
      await v?.handler(el.value, (value) => {el.value = value;});
    };
    eventType = binding.arg || 'input';
    el.addEventListener(eventType, handler);
  },
  unbind(el: HTMLInputElement) {
    el.removeEventListener(eventType, handler);
  }
}
