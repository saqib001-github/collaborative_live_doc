import AddDocumentBtn from '@/components/AddDocumentBtn';
import { DeleteModal } from '@/components/DeleteModal';
import Header from '@/components/Header';
import Notifications from '@/components/Notifications';
import { getDocuments } from '@/lib/actions/room.actions';
import { dateConverter } from '@/lib/utils';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const Home = async () => {
  const clerkUser = await currentUser();

  // Redirect to sign-in page if not authenticated
  if (!clerkUser) redirect('/sign-in');

  // Extract email address safely
  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    console.error('User email not found');
    redirect('/sign-in'); // Redirect if no email
  }

  // Fetch documents and handle potential errors
  let roomDocuments = { data: [] };
  try {
    roomDocuments = await getDocuments(email);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
  }

  const documents = roomDocuments.data || [];

  return (
    <main className="home-container">
      <Header className="sticky left-0 top-0">
        <div className="flex items-center gap-2 lg:gap-4">
          <Notifications />
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </Header>

      {documents.length > 0 ? (
        <div className="document-list-container">
          <div className="document-list-title">
            <h3 className="text-28-semibold">All documents</h3>
            <AddDocumentBtn userId={clerkUser.id} email={email} />
          </div>
          <ul className="document-ul">
            {documents.map(({ id, metadata, createdAt }: any) => (
              <li key={id} className="document-list-item">
                <Link href={`/documents/${id}`} className="flex flex-1 items-center gap-4">
                  <div className="hidden rounded-md bg-dark-500 p-2 sm:block">
                    <Image
                      src="/assets/icons/doc.svg"
                      alt="file"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="line-clamp-1 text-lg">{metadata?.title || 'Untitled Document'}</p>
                    <p className="text-sm font-light text-blue-100">
                      Created about {dateConverter(createdAt)}
                    </p>
                  </div>
                </Link>
                <DeleteModal roomId={id} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="document-list-empty">
          <Image
            src="/assets/icons/doc.svg"
            alt="Document"
            width={40}
            height={40}
            className="mx-auto"
          />
          <p className="text-center text-lg text-gray-500">No documents found.</p>
          <AddDocumentBtn userId={clerkUser.id} email={email} />
        </div>
      )}
    </main>
  );
};

export default Home;
