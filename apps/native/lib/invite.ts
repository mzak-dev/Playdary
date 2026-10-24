import * as Linking from "expo-linking";

const webUrl = process.env.EXPO_PUBLIC_WEB_URL;

export const inviteLink = (username: string) => (webUrl ? `${webUrl.replace(/\/?$/, "/")}u/${encodeURIComponent(username)}` : Linking.createURL(`u/${encodeURIComponent(username)}`));
