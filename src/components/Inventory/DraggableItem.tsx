import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item } from '../../types/Item';

interface DraggableItemProps {
  item: Item | null;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item?.id ?? '',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  if (!item) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-2 border border-gray-300 rounded bg-white flex flex-col items-center"
    >
      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover mb-2" />
      <p className="text-center text-sm font-semibold h-full w-full">{item.name}</p>
    </div>
  );
};
