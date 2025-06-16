import CalendarGrid from '@/components/calendar-grid';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-white mb-8 h-10 w-full pl-60 bg-amber-400 flex items-center">My Event Calendar</h1>
      <div className="w-full max-w-7xl px-4"> 
        <CalendarGrid />
      </div>
    </main>
  );
}