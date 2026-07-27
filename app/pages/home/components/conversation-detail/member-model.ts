import type {
  IDataConversationMember,
  IDataListUsers,
  IDataPresence
} from "~/api";

import {
  getUserName
} from "../../utils";

const memberRoleLabels: Record<string, string> = {
  admin: "管理员",
  member: "成员",
  owner: "群主"
};

const memberStatusLabels: Record<string, string> = {
  active: "正常",
  left: "已退出",
  removed: "已移除"
};

const memberSections = [
  {
    key: "owner",
    title: "群主"
  },
  {
    key: "admin",
    title: "管理员"
  },
  {
    key: "member",
    title: "成员"
  },
  {
    key: "inactive",
    title: "已退出 / 已移除"
  }
] as const;

interface IMemberViewItem {
  member: IDataConversationMember;
  presence?: IDataPresence;
  user?: IDataListUsers[number];
}

interface IMemberSection {
  key: string;
  members: IMemberViewItem[];
  title: string;
}

function getMemberRoleLabel(role: string): string {
  return memberRoleLabels[role] || role;
}

function getMemberStatusLabel(status: string): string {
  return memberStatusLabels[status] || status;
}

function getMemberSectionKey(member: IDataConversationMember): string {
  if (member.status !== "active") {
    return "inactive";
  }

  if (member.role === "owner" || member.role === "admin") {
    return member.role;
  }

  return "member";
}

function sortMemberViewItems(source: IMemberViewItem, target: IMemberViewItem): number {
  const sourceOnlineRank = source.presence?.online ? 0 : 1;

  const targetOnlineRank = target.presence?.online ? 0 : 1;

  if (sourceOnlineRank !== targetOnlineRank) {
    return sourceOnlineRank - targetOnlineRank;
  }

  const nameCompare = getUserName(source.user).localeCompare(getUserName(target.user), "zh-Hans-CN");

  if (nameCompare !== 0) {
    return nameCompare;
  }

  return source.member.user_id - target.member.user_id;
}

function groupMemberViewItems(items: IMemberViewItem[]): IMemberSection[] {
  return memberSections.map(section => {
    return {
      ...section,
      members: [
        ...items.filter(item => {
          return getMemberSectionKey(item.member) === section.key;
        })
      // eslint-disable-next-line unicorn/no-array-sort
      ].sort(sortMemberViewItems)
    };
  }).filter(section => {
    return section.members.length > 0;
  });
}

export {
  getMemberRoleLabel,
  getMemberStatusLabel,
  groupMemberViewItems
};

export type {
  IMemberSection,
  IMemberViewItem
};
