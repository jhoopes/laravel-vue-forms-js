import { DefineComponent, Plugin } from 'vue';




declare const LaravelVueForms: Exclude<Plugin['install'], undefined>;
export default LaravelVueForms;

export const FormStatic: DefineComponent<{}, {}, any>;
export const FormText: DefineComponent<{}, {}, any>;
export const FormPassword: DefineComponent<{}, {}, any>;
export const FormCode: DefineComponent<{}, {}, any>;


export {EntityTypesStore} from "@/store/entityTypesStore";
export {EntityStore} from "@/store/entityStore";
export {FormConfigurationStore} from "@/store/formConfigurationStore";
export {ApiClient} from "@/classes/apiClient";

export { EntityType } from "@/classes/models/entityType";
export { FormConfiguration } from "@/classes/models/FormConfiguration";
export { FormField } from "@/classes/models/FormField";
export { Generic } from "@/classes/models/Generic";


export interface IStoreModule {}

export interface IStore {
    addModule(key: string, module: object): void;
    getModule(key: string): object;
}

declare module "vue-awesome-datepicker" {}