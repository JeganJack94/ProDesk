import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableTask({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow mb-3 cursor-move"
    >
      <h4 className="font-medium">{task.title}</h4>
      <p className="text-sm text-gray-600">
        {task.description}
      </p>
      <div className="mt-2 text-sm text-gray-500">
        Due: {new Date(task.dueDate).toLocaleDateString()}
      </div>
    </div>
  );
} 