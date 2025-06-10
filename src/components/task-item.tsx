'use client';

import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'; 

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

interface TaskItemProps {
  task: Task;
  index: number;
  onUpdateTask: (taskId: string, newContent: string, newTagIds: string[]) => void;
  onDeleteTask: (taskId: string) => void;
  allTags: Tag[]; 
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index, onUpdateTask, onDeleteTask, allTags }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content);
  const [selectedTagIds, setSelectedTagIds] = useState(task.tags.map(tag => tag.id));
  const [showActions, setShowActions] = useState(false); 

  const handleSave = () => {
    if (editedContent.trim()) {
      onUpdateTask(task.id, editedContent, selectedTagIds);
    }
    setIsEditing(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDeleteTask(task.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }
  const getTagColorClasses = (color: string) => {
    if (color.startsWith('bg-')) {
      return color;
    }
    return `bg-[${color}] text-white`; 
  };


  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="relative bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-2 text-sm cursor-grab shadow-sm mb-1 flex flex-col hover:shadow-md transition-all duration-200 group"
          onDoubleClick={() => setIsEditing(true)}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {isEditing ? (
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') {
                    setEditedContent(task.content);
                    setSelectedTagIds(task.tags.map(tag => tag.id));
                    setIsEditing(false);
                  }
                }}
                autoFocus
                className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 p-1.5 rounded-md border border-gray-300"
              />
              <select
                multiple
                value={selectedTagIds}
                onChange={(e) =>
                  setSelectedTagIds(
                    Array.from(e.target.selectedOptions, (option) => option.value)
                  )
                }
                className="w-full text-sm p-1.5 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
              >
                {allTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <button onClick={handleSave} className="mt-1 bg-blue-500 text-white text-sm py-1.5 rounded-md hover:bg-blue-600 transition-colors">
                Save
              </button>
            </div>
          ) : (
            <>
              <div className="text-gray-800 font-medium leading-tight mb-1">{task.content}</div>
              <div className="flex flex-wrap gap-1 mt-auto">
                {task.tags.map(tag => (
                  <span
                    key={tag.id}
                    className={`${getTagColorClasses(tag.color)} text-white text-xs px-2 py-0.5 rounded-full font-medium`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </>
          )}

          {showActions && !isEditing && (
            <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleEditClick}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-blue-600 transition-colors"
                aria-label="Edit task"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-500 transition-colors"
                aria-label="Delete task"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TaskItem;