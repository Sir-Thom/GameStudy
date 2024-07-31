import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { DraggableItem } from './DraggableItem';
import { Item } from '../../types/Item';

interface SortableSlotProps {
  id: string;
  item: Item | null;
}

export const SortableSlot: React.FC<SortableSlotProps> = ({ id, item }) => {
  const { setNodeRef, isOver } = useSortable({ id });

  return (
    <div ref={setNodeRef} className={`p-2 border border-gray-300 rounded ${isOver ? 'bg-gray-400' : 'bg-gray-500'}`}>
      {item ? (
        <DraggableItem item={item} />
      ) : (
        <div className="w-full h-16 flex items-center justify-center text-gray-300">Empty Slot</div>
      )}
    </div>
  );
};
