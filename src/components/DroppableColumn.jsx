import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTask } from './SortableTask';

export function DroppableColumn({ id, title, tasks }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="bg-base-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 capitalize">{title}</h3>
      <div ref={setNodeRef} className="min-h-[200px]">
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <SortableTask key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
} 