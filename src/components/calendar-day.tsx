'use client';

import React, { useState } from 'react';
import TaskItem from './task-item';
import { format } from 'date-fns';
import { Droppable } from '@hello-pangea/dnd';
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
      setNewTaskContent('');
      setSelectedNewTaskTagIds([]);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const dropDisabled = !isCurrentMonth;

  return (
    <div
      className={`relative min-h-[120px] sm:min-h-[160px] md:min-h-[200px] lg:min-h-[240px] p-1 sm:p-2 border border-gray-200 flex flex-col transition-colors duration-200
        ${isCurrentMonth ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-400'}
        hover:shadow-lg hover:border-gray-400`}
    >
      <div className="flex justify-between items-start mb-1 px-1">
        <span className={`text-md sm:text-lg font-bold ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}`}>
          {format(date, 'd')}
        </span>
        <div className="text-xs font-semibold text-amber-600 flex flex-col items-end max-w-[70%] text-right">
          {holidays.map(holiday => (
            <span key={holiday.name} className="truncate leading-tight text-amber-600">
              {holiday.name}
            </span>
          ))}
        </div>
      </div>

      <Droppable
        droppableId={droppableId}
        isDropDisabled={dropDisabled}
        isCombineEnabled={false}
        ignoreContainerClipping={false}
      >
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
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-1">
                <textarea
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddTask();
                    }
                    if (e.key === 'Escape') {
                      setNewTaskContent('');
                      setSelectedNewTaskTagIds([]);
                      setIsAddingTask(false);
                    }
                  }}
                  autoFocus
                  placeholder="New task content..."
                  className="w-full text-sm p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white border border-gray-300 resize-y min-h-[60px]"
                />
                <select
                  multiple
                  value={selectedNewTaskTagIds}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions);
                    const newSelectedIds = selectedOptions.map(option => option.value);
                    setSelectedNewTaskTagIds(newSelectedIds);
                  }}
                  className="w-full text-sm p-1.5 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[40px]"
                >
                  {allTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <button onClick={handleAddTask} className="mt-1 bg-amber-400 text-white text-sm py-1.5 rounded-md hover:bg-amber-500 transition-colors">
                  Save
                </button>
              </div>
            ) : (
              isCurrentMonth && (
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="w-full text-left text-sm text-amber-600 hover:text-amber-800 hover:underline p-1 sm:p-2 mt-auto flex items-center justify-center space-x-1 font-medium bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" /> <span>Add task</span>
                </button>
              )
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default CalendarDay;