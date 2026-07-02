import type {
  IDataResource
} from "../shared/type";

export interface IParamsUploadResource {
  file: File;
  type: "image" | "video";
}

export type IDataUploadResource = IDataResource;
