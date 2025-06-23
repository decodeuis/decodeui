export interface UserData {
  email: string;
  newEmail?: string;
  username?: string;
  uuid: string;
}

export function decodeUserData(data: string): UserData {
  return JSON.parse(Buffer.from(data, "base64").toString());
}

export function encodeUserData(userData: UserData): string {
  return Buffer.from(JSON.stringify(userData)).toString("base64");
}
