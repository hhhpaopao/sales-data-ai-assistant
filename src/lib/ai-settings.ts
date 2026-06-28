export type AiSettings = {
  provider: string;
  baseUrl: string;
  model: string;
  apiKey: string;
};

export const aiSettingsStorageKey = "sales-ai-settings";

export const defaultAiSettings: AiSettings = {
  provider: "DeepSeek",
  baseUrl: "https://api.deepseek.com",
  model: "deepseek-chat",
  apiKey: "",
};

export function maskApiKey(value: string) {
  if (!value) return "未配置";
  if (value.length <= 10) return "已配置";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
