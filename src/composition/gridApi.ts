import Parser from "./../classes/jsonapi_parser";
import { ILengthAwarePaginator } from "./../types";
import { Model } from "./../classes/model";
import Collection from "./../classes/collection";
import { ApiClient } from "./../classes/apiClient";
import { isReactive, Ref, toRaw } from "vue";

export const getApiParamsForGrid = (
  page: number,
  sortBy: Ref<Record<string, any>> | Ref<null>,
  currentFilter: Ref<Record<string, any>> | Ref<null>,
  recordUrlParams: Ref<Record<string, any>>
): Record<string, any> => {
  if (page == null) {
    page = 1;
  }

  const params: Record<string, any> = {
    page,
  };

  if (sortBy.value && sortBy.value.by) {
    params.sortBy = sortBy.value.by;

    if (sortBy.value.dir) {
      params.sortDir = sortBy.value.dir;
    }
  }

  if (currentFilter.value && currentFilter.value.params) {
    Object.assign(params, currentFilter.value.params);
  }

  for (const key in recordUrlParams.value) {
    if (
      Object.hasOwnProperty.call(recordUrlParams.value, key) &&
      recordUrlParams.value[key]
    ) {
      let paramValue = recordUrlParams.value[key];
      if (isReactive(recordUrlParams.value[key])) {
        paramValue = toRaw(recordUrlParams.value[key]);
      }
      params[key] = paramValue;
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
