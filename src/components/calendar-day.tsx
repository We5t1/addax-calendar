'use client';

import React, { useState } from 'react';
import TaskItem from './task-item';
import { format } from 'date-fns';
import { Droppable } from 'react-beautiful-dnd';
import { PlusIcon } from '@heroicons/react/24/solid';

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
  tags: Tag[];
}

interface Holiday {
  date: string;
  name: string;
}

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  holidays: Holiday[];
  isCurrentMonth: boolean;
  onUpdateTask: (taskId: string, newContent: string, newTagIds: string[]) => void;
  onCreateTask: (date: string, content: string, tagIds: string[]) => void;
  onDeleteTask: (taskId: string) => void;
  droppableId: string;
  allTags: Tag[]; 
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  tasks,
  holidays,
  isCurrentMonth,
  onUpdateTask,
  onCreateTask,
  onDeleteTask,
  droppableId,
  allTags,
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [selectedNewTaskTagIds, setSelectedNewTaskTagIds] = useState<string[]>([]);

  const handleAddTask = () => {
    if (newTaskContent.trim()) {
      onCreateTask(format(date, 'yyyy-MM-dd'), newTaskContent, selectedNewTaskTagIds);
      setNewTaskContent('');
      setSelectedNewTaskTagIds([]);
      setIsAddingTask(false);
    } else {
      setIsAddingTask(false);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <div
      className={`relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 p-2 border border-purple-200 flex flex-col transition-colors duration-200
        ${isCurrentMonth ? 'bg-white text-gray-900' : 'bg-purple-50 text-gray-400'}
        hover:shadow-lg hover:border-purple-400`}
    >
      <div className="flex justify-between items-start mb-1 px-1">
        <span className={`text-lg font-bold ${isCurrentMonth ? 'text-purple-800' : 'text-purple-400'}`}>
          {format(date, 'd')}
        </span>
        <div className="text-xs font-semibold text-blue-600 flex flex-col items-end max-w-[70%] text-right">
          {holidays.map(holiday => (
            <span key={holiday.name} className="truncate leading-tight text-blue-600">
              {holiday.name}
            </span>
          ))}
        </div>
      </div>

      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-col flex-grow gap-1 overflow-y-auto custom-scrollbar pr-1 pb-1"
          >
            {sortedTasks.map((task, index) => (
              <TaskItem
                key={task.id} 
                task={task}
                index={index}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                allTags={allTags}
              />
            ))}
            {provided.placeholder}

            {isAddingTask ? (
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-200 flex flex-col gap-1">
                <input
                  type="text"
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  onBlur={handleAddTask}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTask();
                    if (e.key === 'Escape') {
                      setNewTaskContent('');
                      setSelectedNewTaskTagIds([]);
                      setIsAddingTask(false);
                    }
                  }}
                  autoFocus
                  placeholder="New task content..."
                  className="w-full text-sm p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white border border-gray-300"
                />
                <select
                  multiple
                  value={selectedNewTaskTagIds}
                  onChange={(e) =>
                    setSelectedNewTaskTagIds(
                      Array.from(e.target.selectedOptions, (option) => option.value)
                    )
                  }
                  className="w-full text-sm p-1.5 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[40px]"
                >
                  {allTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <button onClick={handleAddTask} className="mt-1 bg-purple-500 text-white text-sm py-1.5 rounded-md hover:bg-purple-600 transition-colors">
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTask(true)}
                className="w-full text-left text-sm text-purple-600 hover:text-purple-800 hover:underline p-2 mt-auto flex items-center justify-center space-x-1 font-medium bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <PlusIcon className="h-4 w-4" /> <span>Add task</span>
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default CalendarDay;