export default class apiClient {
    constructor() {
        this.urlBase = null;
        if (window.location && window.location.origin) {
            this.urlBase = window.location.origin;
        }

        this.protocol = null;
        this.defaultHeaders = {
            Accept: "application/json"
        };
    }

    setUrlBase(url) {
        this.urlBase = url;
    }

    setProtocol(protocol) {
        this.protocol = protocol;
    }

    header(header, value) {
        this.defaultHeaders[header] = value;
    }

    async get(url, options) {
        var response = {};
        try {
            response = await window.fetch(this.buildRequest(url, options));

            if (response.ok === false) {
                await this.processErrorResponse(response);
            }

            let data = await response.json();
            response.data = data;
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }

            throw new Error(err);
        }

        return response;
    }

    async post(url, body, options) {
        var response = {};
        try {
            response = await window.fetch(
                this.buildRequest(url, options, "POST", body)
            );
            if (response.ok === false) {
                await this.processErrorResponse(response);
            }
            response.data = await response.json();
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }

            throw new Error(err);
        }
        return response;
    }

    async patch(url, body, options) {
        var response = {};
        try {
            response = await window.fetch(
                this.buildRequest(url, options, "PATCH", body)
            );
            if (response.ok === false) {
                await this.processErrorResponse(response);
            }
            response.data = await response.json();
        } catch (err) {
            throw new Error(err);
        }
        return response;
    }

    async delete(url, options) {
        var response = {};
        try {
            response = await window.fetch(
                this.buildRequest(url, options, "DELETE")
            );

            if (response.ok === false) {
                await this.processErrorResponse(response);
            }

            response.data = await response.json();
        } catch (err) {
            throw new Error(err);
        }

        return response;
    }

    buildRequest(url, options, method, body) {
        options = this.getOptions(options);
        url = new URL(url, this.urlBase);
        if (options.params) {
            Object.keys(options.params).forEach(key =>
                url.searchParams.append(key, options.params[key])
            );
        }

        if (this.protocol) {
            url.protocol = this.protocol;
        }

        options.method = method;
        if (!method) {
            options.method = "GET";
        }
        options.headers = Object.assign(
            {},
            this.defaultHeaders,
            options.headers
        );
        options = this.buildBody(body, options);
        return new Request(url, options);
    }

    getOptions(options) {
        if (!options || typeof options !== "object") {
            options = {};
        }

        return options;
    }

    buildBody(body, options) {
        if (!body) {
            return options;
        }

        if (body instanceof FormData) {
            options.body = body;
        } else if (body && typeof body === "object") {
            options.body = JSON.stringify(body);
            options.headers["Content-Type"] = "application/json";
        }

        return options;
    }

    async processErrorResponse(response) {
        let errorResponse = await response.json();
        let error = new Error(response.statusText);
        response.data = errorResponse;
        error.response = response;
        throw error;
    }
}

export const client = new apiClient();
