export const dbStore: any = {
  orders: [],
  memberships: [],
  telegramInvites: [],
  products: [],
  users: [],
  transactions: [],
  wallets: [],
  getUserById: () => null,
  getWallet: () => ({ pendingBalance: 0, totalEarned: 0 }),
  dispatchNotification: () => {},
  logAudit: () => {}
};
export type OrderData = any;
export type MembershipData = any;
