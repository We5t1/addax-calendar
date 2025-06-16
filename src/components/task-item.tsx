'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { TrashIcon, PencilIcon, ArrowsPointingOutIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasMoreContent, setHasMoreContent] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      const tempDiv = document.createElement('div');
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.position = 'absolute';
      tempDiv.style.width = contentRef.current.clientWidth + 'px';
      tempDiv.style.fontFamily = getComputedStyle(contentRef.current).fontFamily;
      tempDiv.style.fontSize = getComputedStyle(contentRef.current).fontSize;
      tempDiv.style.lineHeight = getComputedStyle(contentRef.current).lineHeight;
      tempDiv.style.whiteSpace = 'pre-wrap';
      tempDiv.textContent = task.content;
      document.body.appendChild(tempDiv);

      const lineHeight = parseFloat(getComputedStyle(contentRef.current).lineHeight);
      const clampedHeightThreshold = lineHeight * 2.5;
      setHasMoreContent(tempDiv.scrollHeight > clampedHeightThreshold);

      document.body.removeChild(tempDiv);
    }
  }, [task.content, isExpanded, isEditing]);

  const handleSave = () => {
    if (editedContent.trim()) {
      onUpdateTask(task.id, editedContent, selectedTagIds);
    }
    setIsEditing(false);
    setIsExpanded(false);
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
    setIsExpanded(true);
  }

  const getTagColorClasses = (color: string) => {
    if (color.startsWith('bg-')) {
      return color;
    }
    return 'bg-gray-400';
  };

  return (
    <Draggable
      draggableId={task.id}
      index={index}
      isDragDisabled={isEditing}
      disableInteractiveElementBlocking={true}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="relative bg-gradient-to-r from-white-50 to-white-100 border-[1px] rounded-sm border-white-200 p-1 sm:p-2 text-xs sm:text-sm shadow-sm mb-1 flex flex-col hover:shadow-md transition-all duration-200 group"
          onDoubleClick={() => setIsEditing(true)}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <div className={`absolute bottom-1 right-1 flex space-x-1 transition-opacity z-10 ${showActions && !isEditing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div
              {...provided.dragHandleProps}
              className="p-1 cursor-grab text-gray-400 hover:text-gray-600"
              aria-label="Drag task"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </div>
            <button
              onClick={handleEditClick}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-amber-600 transition-colors"
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

          {isEditing ? (
            <div className="flex flex-col gap-1 mt-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSave();
                  }
                  if (e.key === 'Escape') {
                    setEditedContent(task.content);
                    setSelectedTagIds(task.tags.map(tag => tag.id));
                    setIsEditing(false);
                  }
                }}
                autoFocus
                placeholder="Edit task content..."
                className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 p-1.5 rounded-md border border-gray-300 resize-y min-h-[60px]"
              />
              <select
                multiple
                value={selectedTagIds}
                onChange={(e) => {
                  const newSelectedIds = Array.from(e.target.selectedOptions, (option) => option.value);
                  setSelectedTagIds(newSelectedIds);
                }}
                className="w-full text-sm p-1.5 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[40px]"
              >
                {allTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <button onClick={handleSave} className="mt-1 bg-amber-500 text-white text-sm py-1.5 rounded-md hover:bg-amber-600 transition-colors">
                Save
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-1 mb-1">
                {task.tags.map(tag => (
                  <span
                    key={tag.id}
                    className={`${getTagColorClasses(tag.color)} text-white text-xs px-2 py-0.5 rounded-full font-medium inline-block`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
              <div
                ref={contentRef}
                className={`text-gray-800 font-medium leading-tight whitespace-pre-wrap flex-grow ${!isExpanded && hasMoreContent ? 'line-clamp-2 sm:line-clamp-3' : ''}`}
              >
                {task.content}
              </div>

              {hasMoreContent && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="absolute bottom-1 left-2 text-amber-600 text-[8px] flex items-center justify-start hover:underline z-10"
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUpIcon className="h-3 w-3 ml-1" />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDownIcon className="h-3 w-3 ml-1" />
                    </>
                  )}
                </button>
              )}
              <div style={{ height: (showActions && !isEditing) || hasMoreContent ? '24px' : '0' }} className="w-full"></div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TaskItem;