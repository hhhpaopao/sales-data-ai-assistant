export type LocalAccount = {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
  status: "active" | "disabled";
  lastLogin: string;
};

export type LocalSession = {
  email: string;
  name: string;
  role: "admin" | "user";
  signedInAt: string;
};

export const defaultAccounts: LocalAccount[] = [
  {
    email: "admin@salesai.local",
    password: "Admin123!",
    name: "管理员",
    role: "admin",
    status: "active",
    lastLogin: "今天",
  },
  {
    email: "test@salesai.local",
    password: "Test123!",
    name: "测试用户",
    role: "user",
    status: "active",
    lastLogin: "今天",
  },
];

export const accountStorageKey = "sales-ai-local-users";
export const sessionStorageKey = "sales-ai-local-session";
export const uploadHistoryStorageKey = "sales-ai-upload-history";
export const importedMetricsStorageKey = "sales-ai-imported-metrics";
