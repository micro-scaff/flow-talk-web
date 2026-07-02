import type {
  IDataEmpty
} from "../shared/type";

export interface IParamsRemoveGroupMember {
  conversationId: number;
  userId: number;
}

export type IDataRemoveGroupMember = IDataEmpty | null;
