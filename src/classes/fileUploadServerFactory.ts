import {
  ProgressServerConfigFunction,
  ProcessServerConfigFunction,
  RevertServerConfigFunction,
} from "filepond";
import { IApiClient } from "./../types";

export type ServerLoadFunction = (p: string | Record<string, any>) => void;

export type FileUploadServerObject = {
  process: ProcessServerConfigFunction;
  revert: RevertServerConfigFunction;
};
import { getCookie } from "./../utilities/utils";

export default (
  apiClient: IApiClient,
  serverOptions: Record<string, any>,
  fileUploadedCallback: (file: Record<string, any>) => void,
  fileRemovedCallback: (uniqueId: string) => void
): FileUploadServerObject => {
  return {
    process: (
      fieldName: string,
      file: File,
      metadata: Record<string, any>,
      load: ServerLoadFunction,
      error: (errorText: string) => void,
      progress: ProgressServerConfigFunction,
      abort: () => void
    ) => {
      if (!apiClient) {
        return;
      }

      const formData = new FormData();
      formData.append(fieldName, file, file.name);

      formData.append("metaData", JSON.stringify(metadata));

      const request = new XMLHttpRequest();
      const url = apiClient.urlBase + serverOptions.fileApiUrl;

      request.open("POST", url);
      for (const rHeader in apiClient.defaultHeaders) {
        if (Object.hasOwnProperty.call(apiClient.defaultHeaders, rHeader)) {
          request.setRequestHeader(rHeader, apiClient.defaultHeaders[rHeader]);
        }
      }

      const XSRFToken = getCookie("XSRF-TOKEN");
      if (XSRFToken !== null) {
        request.setRequestHeader("X-XSRF-TOKEN", XSRFToken);
      }

      request.withCredentials = apiClient.withCredentials;
      request.upload.onprogress = (e) => {
        progress(e.lengthComputable, e.loaded, e.total);
      };

      request.onload = function () {
        if (request.status >= 200 && request.status < 300) {
          const response = JSON.parse(request.responseText);
          load(response.meta.storedFiles[0].original_filename);
          fileUploadedCallback(response.meta.storedFiles[0]);
        } else {
          error("unable to upload file");
        }
      };

      request.send(formData);
      return {
        abort: () => {
          // This function is entered if the user has tapped the cancel button
          request.abort();
          abort();
        },
      };
    },
    revert: async (
      uniqueFileId: string,
      load: () => void,
      error: (errorText: string) => void
    ) => {
      try {
        await apiClient.delete(serverOptions.fileApiUrl + "/" + uniqueFileId);
        load();
        fileRemovedCallback(uniqueFileId);
      } catch (err) {
        error(err.toString());
      }
    },
  };
};
