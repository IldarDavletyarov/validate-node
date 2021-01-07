import { IValidateNode } from './validateNode'

let handler: (e: Event) => void;
let eventType: string;

export const validate = {
  bind(el: HTMLInputElement, binding : { value: IValidateNode, modifiers: any, arg: string | undefined }) {
    if(!binding.value) {
      console.error(`v-validate: pass validate-node for that element:`,el);
      return;
    }
    let v: IValidateNode | undefined = binding.value.child(Object.keys(binding.modifiers));
    el.value = v?.value;
    handler = async (e: Event) => {
      await v?.handler((e?.target as HTMLInputElement).value)
    };
    eventType = binding.arg || 'input';
    el.addEventListener(eventType, handler);
  },
  unbind(el: HTMLInputElement) {
    el.removeEventListener(eventType, handler);
  }
}
