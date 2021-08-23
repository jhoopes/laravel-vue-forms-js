export class Configuration {
  public apiHost: string | undefined = process.env.VUE_APP_API_HOST;
  public apiPrefix: string | undefined = process.env.VUE_APP_LVF_API_PREFIX;
  public adminApiPrefix: string | undefined =
    process.env.VUE_APP_LVF_ADMIN_API_PREFIX;
  public useJsonApi = Boolean(process.env.VUE_APP_LVF_JSONAPI);
  public withCredentials = Boolean(process.env.VUE_APP_LVF_WITH_CREDENTIALS);
}

const config = new Configuration();
export default config;
