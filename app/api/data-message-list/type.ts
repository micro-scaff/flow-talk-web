import type {
  IDataMessagePage
} from "../shared/type";

export interface IParamsMessageList {
  ["before_id"]?: number;
  ["conversation_id"]: number;
  limit?: number;
}

export type IDataMessageList = IDataMessagePage;
