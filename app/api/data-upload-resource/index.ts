import {
  apiClient
} from "~/request";

import type {
  IDataUploadResource,
  IParamsUploadResource
} from "./type";

function dataUploadResource(params: IParamsUploadResource): Promise<IDataUploadResource> {
  return apiClient.upload<IDataUploadResource>("/api/resources/upload", params);
}

export { dataUploadResource };
export type {
  IDataUploadResource,
  IParamsUploadResource
} from "./type";
