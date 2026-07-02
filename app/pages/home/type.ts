import type {
  FormInstance
} from "antd";

import type {
  IDataConversation,
  IDataConversationListItem,
  IDataDevice,
  IDataGetCurrentUser,
  IDataListUsers,
  IDataMessage,
  IDataMessageReceipt,
  IDataPresence
} from "~/api";
import type {
  TWebSocketStatus
} from "~/hooks/use-websocket-hook";

export interface IGroupFormValues {
  avatarUrl?: string;
  memberIds?: number[];
  title: string;
}

export interface IAddMemberFormValues {
  userIds: number[];
}

export interface IGroupProfileFormValues {
  avatarUrl?: string;
  title: string;
}

export interface IUserOption {
  label: string;
  value: number;
}

export interface IHomeWorkbenchState {
  activeConversation: IDataConversation | null;
  activeConversationId: number | null;
  activeTitle: string;
  conversations: IDataConversationListItem[];
  currentUser: IDataGetCurrentUser | null;
  deviceId: string;
  devices: IDataDevice[];
  draftText: string;
  errorNotice: string;
  loading: boolean;
  messageLoading: boolean;
  messages: IDataMessage[];
  onlineCount: number;
  presences: Record<number, IDataPresence>;
  receipts: IDataMessageReceipt[];
  searchResults: IDataMessage[];
  searchText: string;
  selectedDirectUserId: number | null;
  selectedGroupUserIds: number[];
  sending: boolean;
  users: IDataListUsers;
  wsStatus: TWebSocketStatus;
}

export interface IHomeWorkbenchForms {
  addMemberForm: FormInstance<IAddMemberFormValues>;
  groupForm: FormInstance<IGroupFormValues>;
  profileForm: FormInstance<IGroupProfileFormValues>;
}

export interface IHomeWorkbenchDialogs {
  devicesOpen: boolean;
  directModalOpen: boolean;
  groupModalOpen: boolean;
  memberModalOpen: boolean;
  profileModalOpen: boolean;
  receiptsOpen: boolean;
}

export interface IHomeWorkbenchActions {
  clearErrorNotice: () => void;
  handleAddMembers: () => Promise<void>;
  handleCreateDirect: () => Promise<void>;
  handleCreateDirectWithUser: (userId: number) => Promise<void>;
  handleCreateGroup: () => Promise<void>;
  handleDeleteDevice: (targetDeviceId: string) => Promise<void>;
  handleDeleteMessage: (messageId: number) => Promise<void>;
  handleLeaveGroup: () => Promise<void>;
  handleOpenGroupFromSelection: () => void;
  handleLogout: () => void;
  handleOpenGroupProfile: () => void;
  handleOpenReceipts: (messageId: number) => Promise<void>;
  handleRecallMessage: (messageId: number) => Promise<void>;
  handleRefresh: () => Promise<void>;
  handleRemoveMember: (userId: number) => Promise<void>;
  handleSearch: () => Promise<void>;
  handleSelectConversation: (conversationId: number) => void;
  handleSendMessage: () => Promise<void>;
  handleUpdateGroupProfile: () => Promise<void>;
  handleUpdateMemberRole: (userId: number, role: string) => Promise<void>;
  handleUpsertDevice: () => Promise<void>;
  setDevicesOpen: (open: boolean) => void;
  setDirectModalOpen: (open: boolean) => void;
  setDraftText: (value: string) => void;
  setGroupModalOpen: (open: boolean) => void;
  setMemberModalOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setReceiptsOpen: (open: boolean) => void;
  setSearchResults: (messages: IDataMessage[]) => void;
  setSearchText: (value: string) => void;
  setSelectedDirectUserId: (userId: number | null) => void;
  setSelectedGroupUserIds: (userIds: number[]) => void;
  toggleSelectedGroupUser: (userId: number) => void;
}

export interface IHomeWorkbenchViewModel {
  actions: IHomeWorkbenchActions;
  dialogs: IHomeWorkbenchDialogs;
  forms: IHomeWorkbenchForms;
  state: IHomeWorkbenchState;
  userOptions: IUserOption[];
}
