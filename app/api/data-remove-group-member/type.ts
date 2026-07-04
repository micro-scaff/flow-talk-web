import type {
  IDataEmpty
} from "../shared/type";

export interface IParamsRemoveGroupMember {
  ["conversation_id"]: number;
  ["user_id"]: number;
}

export type IDataRemoveGroupMember = IDataEmpty | null;
