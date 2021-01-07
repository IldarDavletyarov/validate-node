import { IValidateNode } from './validateNode'

let handler: (e: any) => void;
let eventType: string;

export const validate = {
  bind(el: HTMLInputElement, binding : { value: IValidateNode, modifiers: any, arg: string | undefined }) {
    if(!binding.value) {
      console.error('pass validate node');
      return;
    }
    let v: IValidateNode | undefined = binding.value.child(Object.keys(binding.modifiers));
    el.value = v?.value;
    handler = async (e: any) => {
      await v?.handler(e.target.value)
    };
    eventType = binding.arg || 'input';
    el.addEventListener(eventType, handler);
  },
  unbind(el: HTMLInputElement) {
    el.removeEventListener(eventType, handler);
  }
}
