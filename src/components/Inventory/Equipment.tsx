import React from 'react';
import { DroppableSlot } from './DroppableSlot';
import { Item } from '../../types/Item';

interface EquipmentProps {
  items: { [key: string]: Item | null };
}

export const Equipment: React.FC<EquipmentProps> = ({ items }) => {
  return (
    <div>
      {Object.entries(items).map(([slot, item]) => (
        <div key={`equipment-${slot}`} className="p-2 border border-gray-400 rounded bg-gray-800 relative">
          <div className="text-white mb-2">{slot}</div>
          <DroppableSlot id={slot} item={item} />
        </div>
      ))}
    </div>
  );
};
