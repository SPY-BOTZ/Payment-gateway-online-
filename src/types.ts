export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  mobile: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT';
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  telegramId?: string;
  telegramChatId?: string;
  referralCode?: string;
  referredBy?: string;
  subscriptionExpiry?: string;
  createdAt: string;
}
