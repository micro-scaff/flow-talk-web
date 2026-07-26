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
  groupAvatarUploading: boolean;
  hasMoreMessages: boolean;
  loading: boolean;
  loadingMoreMessages: boolean;
  messageLoading: boolean;
  messages: IDataMessage[];
  presences: Record<number, IDataPresence>;
  resourceUploading: boolean;
  searchResults: IDataMessage[];
  searchText: string;
  selectedDirectUserId: number | null;
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
  detailsOpen: boolean;
  devicesOpen: boolean;
  directModalOpen: boolean;
  groupModalOpen: boolean;
  memberModalOpen: boolean;
  profileModalOpen: boolean;
}

export interface IHomeWorkbenchActions {
  handleBackToContactList: () => void;
  clearErrorNotice: () => void;
  handleAddMembers: () => Promise<void>;
  handleCreateDirect: () => Promise<void>;
  handleCreateDirectWithUser: (userId: number) => Promise<void>;
  handleCreateGroup: () => Promise<void>;
  handleDeleteDevice: () => Promise<void>;
  handleLeaveGroup: () => Promise<void>;
  handleOpenGroupCreate: () => void;
  handleLoadMoreMessages: () => Promise<void>;
  handleLogout: () => void;
  handleOpenGroupProfile: () => void;
  handleOpenSearchResult: (message: IDataMessage) => void;
  handleRefresh: () => Promise<void>;
  handleRemoveMember: (userId: number) => Promise<void>;
  handleSearch: () => Promise<void>;
  handleSelectConversation: (conversationId: number) => void;
  handleSendResource: (file: File) => Promise<void>;
  handleSendMessage: () => Promise<void>;
  handleRetryMessage: (message: IDataMessage) => Promise<void>;
  handleUpdateGroupProfile: () => Promise<void>;
  handleUpdateMemberRole: (userId: number, role: string) => Promise<void>;
  handleUploadGroupAvatar: (file: File, target: "create" | "profile") => Promise<void>;
  handleUpsertDevice: () => Promise<void>;
  setDevicesOpen: (open: boolean) => void;
  setDetailsOpen: (open: boolean) => void;
  setDirectModalOpen: (open: boolean) => void;
  setDraftText: (value: string) => void;
  setGroupModalOpen: (open: boolean) => void;
  setMemberModalOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setSearchResults: (messages: IDataMessage[]) => void;
  setSearchText: (value: string) => void;
  setSelectedDirectUserId: (userId: number | null) => void;
}

export interface IHomeWorkbenchViewModel {
  actions: IHomeWorkbenchActions;
  dialogs: IHomeWorkbenchDialogs;
  forms: IHomeWorkbenchForms;
  state: IHomeWorkbenchState;
  userOptions: IUserOption[];
}
