import { ApiClient } from "./../classes/apiClient";

export abstract class LVFStore {
  public useJsonApi = false;
  public client?: ApiClient;

  public jsonApi(useJsonApi: boolean) {
    this.useJsonApi = useJsonApi;
  }

  public api(apiClient: ApiClient) {
    this.client = apiClient;
  }

  get apiClient(): ApiClient {
    // if (!this.client) {
    //   console.trace();
    //   throw Error("No apiClient set for store...");
    // }
    /** @ts-ignore **/
    return this.client;
  }
}
