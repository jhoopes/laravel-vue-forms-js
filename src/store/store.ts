import VueStore from "vue-class-store";
import { FormConfigurationStore } from "./formConfigurationStore";
import { EntityTypesStore } from "./entityTypesStore";
import { EntityStore } from "./entityStore";

@VueStore
export class Store {
  modules: Record<string, Record<string, any>>;

  constructor() {
    this.modules = {};
  }

  addModule(key: string, module: Record<string, any>): void {
    this.modules[key] = module;
  }

  getModule(key: string): Record<string, any> {
    return this.modules[key];
  }
}

const createdStore = new Store();
createdStore.addModule("formConfiguration", new FormConfigurationStore());
createdStore.addModule("entityType", new EntityTypesStore());
createdStore.addModule("entity", new EntityStore());
export default createdStore;
