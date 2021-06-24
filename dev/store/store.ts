import VueStore from "vue-class-store";

export interface IStoreModule {}

import { authModule } from "./authStore";

@VueStore
export class Store {

    public modules: Record<string, IStoreModule>

    constructor() {
        this.modules = {}
    }


    addModule(name: string, storeModule: IStoreModule): void {
        this.modules[name] = storeModule;
    }

    getModule(name: string): IStoreModule | string {
        return this.modules[name];
    }
}

const storeInstance = new Store();
storeInstance.addModule('auth', new authModule());
export default storeInstance;