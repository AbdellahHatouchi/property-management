import { auth } from "@/auth";

export const UserAuth = async() => {
  const session = await auth();
  return session?.user
};
