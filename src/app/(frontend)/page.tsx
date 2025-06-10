import CalendarGrid from '@/components/calendar-grid';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">My Event Calendar</h1>
      <div className="w-full max-w-7xl px-4"> 
        <CalendarGrid />
      </div>
    </main>
  );
}