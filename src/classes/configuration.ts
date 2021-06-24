import apiClient from "./apiClient";

export class Configuration {
    public apiPrefix: string | undefined = process.env.VUE_APP_LVF_API_PREFIX;
    public adminApiPrefix: string | undefined =
        process.env.VUE_APP_LVF_ADMIN_API_PREFIX;
    public useJsonApi = Boolean(process.env.VUE_APP_LVF_JSONAPI);
    public withCredentials = Boolean(process.env.VUE_APP_LVF_WITH_CREDENTIALS);

    constructor() {
        this.configureApiClient();
    }

    configureApiClient() {
        apiClient.setUrlBase(this.apiPrefix || window.location.host);
        if (this.useJsonApi) {
            apiClient.header("Accept", "application/vnd.api+json");
        }
    }
}

const configInstance = new Configuration();
export default configInstance;
