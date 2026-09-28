import Link from 'next/link';

async function getRooms() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/rooms`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Cybersecurity Rooms</h1>
      <p className="text-muted-foreground mb-8">Explore hands-on learning rooms and interactive modules.</p>

      {rooms.length === 0 ? (
        <div className="p-8 text-center border rounded-lg bg-card text-card-foreground">
          <p>No published rooms available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room: any) => (
            <Link key={room.id} href={`/rooms/${room.slug}`} className="block group">
              <div className="border rounded-lg p-6 bg-card hover:border-primary transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
                      {room.difficulty}
                    </span>
                    {room.estimatedMinutes && (
                      <span className="text-xs text-muted-foreground">{room.estimatedMinutes} mins</span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {room.title}
                  </h2>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{room.description}</p>
                </div>
                {room.course && (
                  <div className="text-xs text-muted-foreground font-medium">
                    Course: {room.course.title}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
