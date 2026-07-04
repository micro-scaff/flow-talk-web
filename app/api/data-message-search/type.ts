import type {
  IDataMessage
} from "../shared/type";

export interface IParamsMessageSearch {
  ["conversation_id"]?: number;
  keyword: string;
  limit?: number;
}

export type IDataMessageSearch = IDataMessage[];
