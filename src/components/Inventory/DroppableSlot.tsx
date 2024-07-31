import { useDroppable } from '@dnd-kit/core';
import { DraggableItem } from './DraggableItem'; // Ensure the path is correct
import { Item } from '../../types/Item';

interface DroppableSlotProps {
  id: string;
  item: Item | null;
}

export const DroppableSlot: React.FC<DroppableSlotProps> = ({ id, item }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `equipment-${id}`,
    data: { id },
    disabled: item !== null,
  });

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
