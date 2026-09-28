import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getRoom(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/rooms/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export default async function RoomDetailPage({ params }: { params: { slug: string } }) {
  const room = await getRoom(params.slug);

  if (!room) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        {room.course && (
          <Link href={`/courses/${room.course.slug}`} className="text-sm text-primary hover:underline mb-2 inline-block">
            ← Back to Course: {room.course.title}
          </Link>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
            {room.difficulty}
          </span>
          {room.estimatedMinutes && (
            <span className="text-xs text-muted-foreground">Estimated: {room.estimatedMinutes} mins</span>
          )}
        </div>
        <h1 className="text-3xl font-bold mt-2 text-foreground">{room.title}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{room.description}</p>
      </div>

      <div className="border-t pt-6 mt-6">
        <h2 className="text-2xl font-semibold mb-4">Tasks & Challenges</h2>
        <div className="p-8 text-center border rounded-lg bg-card text-muted-foreground border-dashed">
          <p>Tasks for this room will appear here in the next phase.</p>
        </div>
      </div>
    </div>
  );
}
