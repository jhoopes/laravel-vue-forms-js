import { DefineComponent, Plugin } from 'vue';


declare const LaravelVueForms: Exclude<Plugin['install'], undefined>;
export default LaravelVueForms;

export const LaravelVueFormsSample: DefineComponent<{}, {}, any>;
