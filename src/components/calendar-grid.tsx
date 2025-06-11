'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CalendarDay from './calendar-day';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  date: string;
  content: string;
  order: number;
  calendarId: string;
  tags: Tag[];
}

interface Holiday {
  date: string;
  name: string;
}

const CalendarGrid: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    const setupCalendar = async () => {
      try {
        let currentCalendarId = localStorage.getItem('my_calendar_id');
        if (!currentCalendarId) {
          const res = await fetch('/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'My Main Calendar' }),
          });
          if (res.ok) {
            const data = await res.json();
            currentCalendarId = data.id;
            localStorage.setItem('my_calendar_id', currentCalendarId!);
          } else {
            console.error('Failed to create calendar:', await res.text());
            return;
          }
        }
        setCalendarId(currentCalendarId);
      } catch (error) {
        console.error('Error setting up calendar:', error);
      }
    };
    setupCalendar();
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!calendarId) return;
    const year = format(currentDate, 'yyyy');
    const month = format(currentDate, 'MM');
    const res = await fetch(`/api/tasks?year=${year}&month=${month}&calendarId=${calendarId}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    } else {
      console.error('Failed to fetch tasks:', await res.text());
    }
  }, [currentDate, calendarId]);

  const fetchHolidays = useCallback(async () => {
    const year = format(currentDate, 'yyyy');
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/PL`);
    if (res.ok) {
      const data = await res.json();
      setHolidays(data.map((h: any) => ({ date: h.date, name: h.name })));
    } else {
      console.error('Failed to fetch holidays:', Error);
    }
  }, [currentDate]);

  const fetchTags = useCallback(async () => {
    const res = await fetch('/api/tags');
    if (res.ok) {
      const data = await res.json();
      setAllTags(data);
    } else {
      console.error('Failed to fetch tags:', Error);
    }
  }, []);

  useEffect(() => {
    if (calendarId) {
      fetchTasks();
      fetchHolidays();
      fetchTags();
    }
  }, [fetchTasks, fetchHolidays, fetchTags, calendarId]);

  const daysToDisplay = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const draggedTask = tasks.find(task => task.id === draggableId);
    if (!draggedTask) return;

    const sourceDroppableId = source.droppableId;
    const destinationDroppableId = destination.droppableId;

    setTasks(prevTasks => {
        let newTasks = [...prevTasks];

        const draggedTaskIndexInPrev = newTasks.findIndex(t => t.id === draggableId);
        if (draggedTaskIndexInPrev > -1) {
            newTasks.splice(draggedTaskIndexInPrev, 1);
        }

        const sourceDayTasks = newTasks
            .filter(t => format(new Date(t.date), 'yyyy-MM-dd') === sourceDroppableId)
            .sort((a, b) => a.order - b.order)
            .map((t, i) => ({ ...t, order: i }));

        newTasks = newTasks.filter(t => format(new Date(t.date), 'yyyy-MM-dd') !== sourceDroppableId);
        newTasks.push(...sourceDayTasks);

        const updatedDraggedTask = {
            ...draggedTask,
            date: destinationDroppableId,
            order: destination.index,
        };

        const destinationDayTasks = newTasks
            .filter(t => format(new Date(t.date), 'yyyy-MM-dd') === destinationDroppableId)
            .sort((a, b) => a.order - b.order);

        destinationDayTasks.splice(destination.index, 0, updatedDraggedTask);

        const reorderedDestinationDayTasks = destinationDayTasks.map((t, i) => ({ ...t, order: i }));

        newTasks = newTasks.filter(t => format(new Date(t.date), 'yyyy-MM-dd') !== destinationDroppableId);
        newTasks.push(...reorderedDestinationDayTasks);

        return newTasks.sort((a, b) => (new Date(a.date).getTime() - new Date(b.date).getTime()) || (a.order - b.order));
    });

    try {
        if (sourceDroppableId === destinationDroppableId) {
            const dayTasks = tasks.filter(task => format(new Date(task.date), 'yyyy-MM-dd') === sourceDroppableId);
            const reorderedDayTasks = Array.from(dayTasks);
            const [removed] = reorderedDayTasks.splice(source.index, 1);
            reorderedDayTasks.splice(destination.index, 0, removed);

            const updates = reorderedDayTasks.map(async (task, index) => {
                if (task.order !== index) {
                    const res = await fetch(`/api/tasks/${task.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ order: index }),
                    });
                    if (!res.ok) throw new Error('Failed to update task order');
                }
            });
            await Promise.all(updates);

        } else {
            const res = await fetch(`/api/tasks/${draggableId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: destinationDroppableId, order: destination.index }),
            });
            if (!res.ok) throw new Error('Failed to move task');

            fetchTasks();
        }
    } catch (error) {
        console.error('Error during drag and drop backend update:', error);
        fetchTasks();
    }
  };

  const handleUpdateTask = async (taskId: string, newContent: string, newTagIds: string[]) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent, tagIds: newTagIds }),
    });
    if (res.ok) {
      fetchTasks();
    } else {
      console.error('Failed to update task:', await res.text());
    }
  };

  const handleCreateTask = async (date: string, content: string, tagIds: string[]) => {
    if (!calendarId) {
      alert('Calendar not loaded yet.');
      return;
    }
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, content, calendarId, order: 0, tagIds }),
    });
    if (res.ok) {
      fetchTasks();
    } else {
      console.error('Failed to create task:', await res.text());
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    if (res.ok) {
      fetchTasks();
    } else {
      console.error('Failed to delete task:', await res.text());
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!calendarId) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600 text-lg">
        Loading calendar...
      </div>
    );
  }

  return (
    <div className="p-4 w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <button onClick={() => setCurrentDate(prev => subMonths(prev, 1))} className="p-2 rounded-full hover:bg-purple-100 transition-colors text-purple-600">
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <h2 className="text-3xl font-extrabold text-purple-800 tracking-tight">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={() => setCurrentDate(prev => addMonths(prev, 1))} className="p-2 rounded-full hover:bg-purple-100 transition-colors text-purple-600">
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Search tasks or tags..."
          className="p-2 border border-purple-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-1/3 text-gray-700 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-7 gap-1 bg-purple-200 rounded-xl overflow-hidden shadow-2xl border border-purple-300">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-sm font-bold text-purple-800 bg-purple-100 uppercase tracking-wider border-b border-purple-300">
            {day}
          </div>
        ))}
        <DragDropContext onDragEnd={onDragEnd}>
          {daysToDisplay.map((dateObj) => {
            const dateString = format(dateObj, 'yyyy-MM-dd');
            const dayTasks = filteredTasks.filter(task => format(new Date(task.date), 'yyyy-MM-dd') === dateString);
            const dayHolidays = holidays.filter(holiday => holiday.date === dateString);
            const isCurrentMonthDay = isSameMonth(dateObj, currentDate);

            return (
              <CalendarDay
                key={dateString}
                date={dateObj}
                tasks={dayTasks}
                holidays={dayHolidays}
                isCurrentMonth={isCurrentMonthDay}
                onUpdateTask={handleUpdateTask}
                onCreateTask={handleCreateTask}
                onDeleteTask={handleDeleteTask}
                droppableId={dateString}
                allTags={allTags}
              />
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
};

export default CalendarGrid;