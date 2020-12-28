import { IValidateNode } from './validateNode'

let handler: (e: any) => void;

export const validate = {
  bind(el: HTMLInputElement, binding : { value: IValidateNode }) {
    el.value = binding.value.value
    handler = async (e: any) => {
      await binding.value.handler(e.target.value)
    }
    el.addEventListener('input', handler);
  },
  unbind(el: HTMLInputElement) {
    el.removeEventListener('input', handler);
  }
}
