import Parser from "./../classes/jsonapi_parser";
import { ILengthAwarePaginator } from "./../types";
import { Model } from "./../classes/model";
import Collection from "./../classes/collection";
import { ApiClient } from "./../classes/apiClient";

export const getApiParamsForGrid = (
    page: number,
    sortBy: Record<string, any> | null,
    currentFilter: Record<string, any> | null,
    recordUrlParams: Record<string, any>
): Record<string, any> => {
    if (page == null) {
        page = 1;
    }

    const params: Record<string, any> = {
        page,
    };

    if (sortBy && sortBy.by) {
        params.sortBy = sortBy.by;

        if (sortBy.dir) {
            params.sortDir = sortBy.dir;
        }
    }

    if (currentFilter && currentFilter.params) {
        Object.assign(params, currentFilter.params);
    }

    for (const key in recordUrlParams) {
        if (
            Object.hasOwnProperty.call(recordUrlParams, key) &&
            recordUrlParams[key]
        ) {
            params[key] = recordUrlParams[key];
        }
    }

    return params;
};

export const getRecordsFromAPI = async (
    params: Record<string, any>,
    apiClient: ApiClient,
    recordUrl: string,
    useJsonApi: boolean
): Promise<
    Collection<Model> | ILengthAwarePaginator<Model> | Record<string, any>[]
> => {
    const response = await apiClient.get(recordUrl, {
        searchParams: params,
    });

    if (useJsonApi) {
        return Parser.parseJSONAPIResponse(response.data) as Collection<Model>;
    }

    return response.data as ILengthAwarePaginator<Model>;
};
