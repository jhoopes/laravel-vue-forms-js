import { DefineComponent, Plugin } from 'vue';


declare const LaravelVueForms: Exclude<Plugin['install'], undefined>;
export default LaravelVueForms;

export const FormStatic: DefineComponent<{}, {}, any>;
export const FormText: DefineComponent<{}, {}, any>;
export const FormPassword: DefineComponent<{}, {}, any>;
export const FormCode: DefineComponent<{}, {}, any>;
