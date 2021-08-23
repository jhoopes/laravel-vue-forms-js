import VueStore from "vue-class-store";
import apiClient from "./../classes/apiClient";
import { IStoreModule } from "laravel-vue-forms";

@VueStore
export class authModule implements IStoreModule {
  public hasAuth = false;
  public user: Record<string, boolean> | undefined;

  /**
   * Demo login with the associated demo application with the PHP side
   */
  async login() {
    try {
      await apiClient.get("http://localhost/sanctum/csrf-cookie");
      const createSessionResponse = await apiClient.get(
        "http://localhost/api/create_session"
      );
      const createSessionData = createSessionResponse.data as Record<
        string,
        any
      >;
      this.user = createSessionData.user;
      this.hasAuth = true;
    } catch (err) {
      console.log(err);
    }
  }

  async getUser() {
    try {
      const user = await apiClient.get("http://localhost/api/user");
      this.user = user.data as Record<string, any>;
      this.hasAuth = true;
    } catch (err) {
      console.log(err);
    }
  }
}
