"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Plus, X, GripVertical, Trash2 } from "lucide-react";

// Types
type Task = {
  id: string;
  content: string;
};

type ColumnData = {
  id: string;
  title: string;
  taskIds: string[];
};

type BoardData = {
  tasks: Record<string, Task>;
  columns: Record<string, ColumnData>;
  columnOrder: string[];
};

const initialData: BoardData = {
  tasks: {
    "task-1": { id: "task-1", content: "Research competitor analysis" },
    "task-2": { id: "task-2", content: "Design wireframes for new dashboard" },
    "task-3": { id: "task-3", content: "Setup CI/CD pipeline" },
    "task-4": { id: "task-4", content: "Write API documentation" },
  },
  columns: {
    "column-1": {
      id: "column-1",
      title: "To Do",
      taskIds: ["task-1", "task-2"],
    },
    "column-2": {
      id: "column-2",
      title: "In Progress",
      taskIds: ["task-3"],
    },
    "column-3": {
      id: "column-3",
      title: "Done",
      taskIds: ["task-4"],
    },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
};

export default function KanbanBoard() {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<BoardData>(initialData);
  const [addingTaskColId, setAddingTaskColId] = useState<string | null>(null);
  const [newTaskContent, setNewTaskContent] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      });
      return;
    }

    // Moving from one list to another
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...startColumn,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finishColumn,
      taskIds: finishTaskIds,
    };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    });
  };

  const handleAddTask = (columnId: string) => {
    if (!newTaskContent.trim()) {
      setAddingTaskColId(null);
      setNewTaskContent("");
      return;
    }

    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = {
      id: newTaskId,
      content: newTaskContent.trim(),
    };

    const column = data.columns[columnId];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.push(newTaskId);

    setData({
      ...data,
      tasks: {
        ...data.tasks,
        [newTaskId]: newTask,
      },
      columns: {
        ...data.columns,
        [columnId]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
    });

    setAddingTaskColId(null);
    setNewTaskContent("");
  };

  const handleDeleteTask = (columnId: string, taskId: string) => {
    const column = data.columns[columnId];
    const newTaskIds = column.taskIds.filter((id) => id !== taskId);

    const newTasks = { ...data.tasks };
    delete newTasks[taskId];

    setData({
      ...data,
      tasks: newTasks,
      columns: {
        ...data.columns,
        [columnId]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Project Board</h1>
            <p className="text-neutral-500 mt-1">Manage your tasks with drag and drop.</p>
          </div>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex items-start space-x-6 overflow-x-auto pb-8">
            {data.columnOrder.map((columnId) => {
              const column = data.columns[columnId];
              const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

              return (
                <div
                  key={column.id}
                  className="bg-neutral-200/50 rounded-xl flex flex-col w-80 shrink-0 border border-neutral-200/60"
                >
                  <div className="p-4 flex items-center justify-between">
                    <h2 className="font-semibold text-neutral-700 flex items-center gap-2">
                      {column.title}
                      <span className="bg-neutral-200 text-neutral-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {tasks.length}
                      </span>
                    </h2>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`px-3 pb-3 min-h-[150px] transition-colors ${
                          snapshot.isDraggingOver ? "bg-neutral-200/80 rounded-lg" : ""
                        }`}
                      >
                        <div className="flex flex-col gap-3">
                          {tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`group relative flex gap-2 p-3 rounded-lg border bg-white shadow-sm transition-all
                                    ${
                                      snapshot.isDragging
                                        ? "shadow-lg ring-2 ring-blue-500/20 rotate-2 scale-105 z-50 border-blue-200"
                                        : "hover:shadow-md hover:border-neutral-300 border-neutral-200"
                                    }`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-0.5 text-neutral-400 hover:text-neutral-600 transition-colors cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 text-sm text-neutral-700 leading-snug break-words">
                                    {task.content}
                                  </div>
                                  <button
                                    onClick={() => handleDeleteTask(column.id, task.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-red-500 bg-white"
                                    title="Delete task"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>

                  <div className="px-3 pb-3 mt-auto">
                    {addingTaskColId === column.id ? (
                      <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm mt-3">
                        <textarea
                          autoFocus
                          placeholder="What needs to be done?"
                          className="w-full text-sm resize-none outline-none text-neutral-700 bg-transparent placeholder:text-neutral-400 min-h-[60px]"
                          value={newTaskContent}
                          onChange={(e) => setNewTaskContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddTask(column.id);
                            } else if (e.key === "Escape") {
                              setAddingTaskColId(null);
                              setNewTaskContent("");
                            }
                          }}
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleAddTask(column.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          >
                            Add Task
                          </button>
                          <button
                            onClick={() => {
                              setAddingTaskColId(null);
                              setNewTaskContent("");
                            }}
                            className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 p-1.5 rounded-md transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingTaskColId(column.id)}
                        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/80 w-full p-2 rounded-lg transition-colors font-medium mt-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add a task
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
