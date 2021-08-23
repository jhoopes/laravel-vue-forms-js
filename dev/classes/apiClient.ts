import { ApiClient } from "@/entry.esm";
import config from "./configuration";

const apiClientInstance = new ApiClient();
apiClientInstance.setUrlBase(config.apiHost || window.location.host);
apiClientInstance.useCredentials(config.withCredentials);
export default apiClientInstance;
