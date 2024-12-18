'use server';

import { clerkClient } from "@clerk/nextjs/server";
import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";
export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    // Fetch user list based on email addresses
    const { data } = await clerkClient.users.getUserList({
      emailAddress: userIds, // Use emailAddress for filtering
    });

    // Ensure data exists and map user details
    const users = (data || []).map((user) => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.emailAddresses?.[0]?.emailAddress || "",
      avatar: user.imageUrl || "",
    }));

    // Sort users based on input userIds
    const sortedUsers = userIds.map((email) =>
      users.find((user) => user.email === email)
    );

    return parseStringify(sortedUsers.filter(Boolean)); // Remove undefined entries
  } catch (error: any) {
    console.error(`Error fetching users: ${error.message}`);
    return []; // Return an empty array on failure
  }
};

export const getDocumentUsers = async ({ roomId, currentUser, text }: { roomId: string, currentUser: string, text: string }) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    const users = Object.keys(room.usersAccesses).filter((email) => email !== currentUser);

    if(text.length) {
      const lowerCaseText = text.toLowerCase();

      const filteredUsers = users.filter((email: string) => email.toLowerCase().includes(lowerCaseText))

      return parseStringify(filteredUsers);
    }

    return parseStringify(users);
  } catch (error) {
    console.log(`Error fetching document users: ${error}`);
  }
}