import { client } from "@/classes/apiClient";

class Configuration {
    constructor() {
        this.apiPrefix = process.env.VUE_APP_FORM_API_PREFIX;
        this.adminApiPrefix = process.env.VUE_APP_ADMIN_API_PREFIX;
        this.webAdminPrefix = process.env.VUE_APP_WEB_ADMIN_PREFIX;
        this.useJsonApi = Boolean(process.env.VUE_APP_USE_JSON_API);

        this.configureApiClient();
    }

    configureApiClient() {
        client.setUrlBase(process.env.VUE_APP_API_HOST);
        if (this.useJsonApi) {
            client.header("Accept", "application/vnd.api+json");
        }
    }
}

export const config = new Configuration();
