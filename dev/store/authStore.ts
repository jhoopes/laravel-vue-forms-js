import VueStore from "vue-class-store";
import apiClient from './../classes/apiClient';
import {IStoreModule} from "./store";

@VueStore
export class authModule implements IStoreModule {

    public hasAuth: boolean = false;
    public user: Record<string, boolean> | undefined;

    /**
     * Demo login with the associated demo application with the PHP side
     */
    async login() {
        try {
            await apiClient.get('http://localhost/sanctum/csrf-cookie');
            let createSessionResponse = await apiClient.get('/create_session');
            let createSessionData = createSessionResponse.data as Record<string, any>;
            this.user = createSessionData.user;
            this.hasAuth = true;
        }catch(err) {
            console.log(err);
        }
    }

    async getUser() {
        try {
            let user = await apiClient.get('/user');
            this.user = user.data as Record<string, any>;
            this.hasAuth = true;
        }catch(err) {
            console.log(err);
        }
    }


}