import CalendarGrid from '@/components/calendar-grid';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center">
      <h1 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-8 h-10 w-full pl-4 sm:pl-60 bg-amber-400 flex items-center">
        My Event Calendar
      </h1>
      <div className="w-full max-w-7xl px-2 sm:px-4"> 
        <CalendarGrid />
      </div>
    </main>
  );
}