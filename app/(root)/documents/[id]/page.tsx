import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Document = async ({ params }: { params: { id: string } }) => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');
  const { id } = await params;
  // Fetch the room document
  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  if (!room) redirect('/');

  // Safely get userIds from room.usersAccesses
  const userIds = Object.keys(room.usersAccesses ?? {});
  
  let users = [];
  try {
    // Fetch users data with a fallback to an empty array
    users = (await getClerkUsers({ userIds })) || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    users = [];
  }

  // Map users to include userType
  const usersData = users.map((user: User) => ({
    ...user,
    userType: room?.usersAccesses?.[user.email]?.includes('room:write')
      ? 'editor'
      : 'viewer',
  }));

  // Determine the current user's role
  const currentUserType = room?.usersAccesses?.[clerkUser.emailAddresses[0].emailAddress]?.includes('room:write')
    ? 'editor'
    : 'viewer';

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  );
};

export default Document;
