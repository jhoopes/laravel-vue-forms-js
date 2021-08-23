import VueStore from "vue-class-store";

import { IStoreModule } from "laravel-vue-forms";

import { authModule } from "./authStore";
import { FormConfigurationStore } from "@/entry.esm";
import { EntityTypesStore } from "@/entry.esm";
import { EntityStore } from "@/entry.esm";

@VueStore
export class Store {
  public modules: Record<string, IStoreModule>;

  constructor() {
    this.modules = {};
  }

  addModule(name: string, storeModule: IStoreModule): void {
    this.modules[name] = storeModule;
  }

  getModule(name: string): IStoreModule | string {
    return this.modules[name];
  }
}

const storeInstance = new Store();
storeInstance.addModule("auth", new authModule());
storeInstance.addModule("formConfiguration", new FormConfigurationStore());
storeInstance.addModule("entityType", new EntityTypesStore());
storeInstance.addModule("entity", new EntityStore());
export default storeInstance;
