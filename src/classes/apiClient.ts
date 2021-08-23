import {
  HTTPWebProtocol,
  IApiClient,
  IHTTPClientBody,
  IHTTPClientResponse,
} from "../types/index";

import ApiError from "./ApiError";

export class ApiClient implements IApiClient {
  urlBase: string;
  fetch: typeof fetch;
  protocol: HTTPWebProtocol;
  defaultHeaders: Record<string, string>;
  withCredentials = false;

  constructor(fetchInjection?: typeof fetch) {
    if (!fetchInjection) {
      this.fetch = window.fetch.bind(window);
    } else {
      this.fetch = fetchInjection;
    }
    this.urlBase = "";
    if (window.location && window.location.origin) {
      this.urlBase = window.location.origin;
    }
    this.protocol = HTTPWebProtocol.HTTPS;
    this.defaultHeaders = {
      Accept: "application/json",
    };
  }

  setUrlBase(url: string) {
    this.urlBase = url;
  }

  setProtocol(protocol: HTTPWebProtocol) {
    this.protocol = protocol;
  }

  header(header: string, value: string) {
    this.defaultHeaders[header] = value;
  }

  useCredentials(credentials?: boolean) {
    if (!credentials) {
      this.withCredentials = false;
    }

    this.withCredentials = true;
  }

  async get(
    path: string,
    body?: IHTTPClientBody,
    headers?: Record<string, string>,
    config?: RequestInit
  ): Promise<IHTTPClientResponse> {
    return await this.http(path, {
      method: "GET",
      body: this.buildBodyFromClientBodyOptions(body),
      headers: Object.assign({}, this.defaultHeaders, headers),
      ...config,
    });
  }

  async post(
    path: string,
    body: IHTTPClientBody,
    headers?: Record<string, string>,
    config?: RequestInit
  ): Promise<IHTTPClientResponse> {
    return await this.http(path, {
      method: "POST",
      body: this.buildBodyFromClientBodyOptions(body),
      headers: Object.assign({}, this.defaultHeaders, headers),
      ...config,
    });
  }

  async put(
    path: string,
    body: IHTTPClientBody,
    headers?: Record<string, string>,
    config?: RequestInit
  ): Promise<IHTTPClientResponse> {
    return await this.http(path, {
      method: "PUT",
      body: this.buildBodyFromClientBodyOptions(body),
      headers: Object.assign({}, this.defaultHeaders, headers),
      ...config,
    });
  }

  async patch(
    path: string,
    body: IHTTPClientBody,
    headers?: Record<string, string>,
    config?: RequestInit
  ): Promise<IHTTPClientResponse> {
    return await this.http(path, {
      method: "PATCH",
      body: this.buildBodyFromClientBodyOptions(body),
      headers: Object.assign({}, this.defaultHeaders, headers),
      ...config,
    });
  }

  async delete(
    path: string,
    body?: IHTTPClientBody,
    headers?: Record<string, string>,
    config?: RequestInit
  ): Promise<IHTTPClientResponse> {
    return await this.http(path, {
      method: "DELETE",
      body: this.buildBodyFromClientBodyOptions(body),
      headers: Object.assign({}, this.defaultHeaders, headers),
      ...config,
    });
  }

  async http(path: string, config: RequestInit): Promise<IHTTPClientResponse> {
    const XSRFToken = this.getCookie("XSRF-TOKEN");
    if (XSRFToken !== null) {
      config.headers = Object.assign(
        {
          "X-XSRF-TOKEN": XSRFToken,
        },
        config.headers
      );
    }

    if (config.body === "") {
      delete config.body;
    } else if (
      config.method === "GET" &&
      config.body &&
      config.body instanceof URLSearchParams
    ) {
      path += "?" + config.body.toString();
      delete config.body;
    }

    try {
      // determine if path contains full URL, exception is thrown otherwise, and we'll add the urlBase
      new URL(path);
    } catch (err) {
      path = this.urlBase + path;
    }

    if (this.withCredentials) {
      config.credentials = "include";
    }

    const request = new Request(path, config);

    const response = await this.fetch(request);
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(response, body);
    }

    return {
      data: body,
      response: response,
    };
  }

  buildBodyFromClientBodyOptions(body?: IHTTPClientBody): BodyInit {
    if (body && body.searchParams) {
      const searchParams = new URLSearchParams();
      Object.keys(body.searchParams).forEach((key) => {
        if (body.searchParams && body.searchParams[key]) {
          searchParams.append(key, body.searchParams[key] as string);
        }
      });

      return searchParams;
    }

    if (body && body.requestBody && body.requestBody instanceof FormData) {
      return body.requestBody;
    }

    if (body && body.requestBody) {
      this.defaultHeaders["Content-Type"] = "application/json";
      return JSON.stringify(body.requestBody);
    }

    return "";
  }

  getCookie(name: string): string | null {
    // Split cookie string and get all individual name=value pairs in an array
    const cookieArr = document.cookie.split(";");

    // Loop through the array elements
    for (let i = 0; i < cookieArr.length; i++) {
      const cookiePair = cookieArr[i].split("=");

      /* Removing whitespace at the beginning of the cookie name
            and compare it with the given string */
      if (name == cookiePair[0].trim()) {
        // Decode the cookie value and return
        return decodeURIComponent(cookiePair[1]);
      }
    }

    // Return null if not found
    return null;
  }
}

const client = new ApiClient();
export default client;
