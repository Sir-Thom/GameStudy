import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { DraggableItem } from './DraggableItem';
import { SortableSlot } from './SortableSlot';
import { Equipment } from './Equipment';
import { Item } from '../../types/Item';

const initialItems: Item[] = [
  { id: '1', name: 'Sword', image: 'path/to/sword.png', type: 'inventory' },
  { id: '2', name: 'Shield', image: 'path/to/shield.png', type: 'inventory' },
  { id: 'equipement-3', name: 'Helmet', image: 'path/to/helmet.png', type: 'equipment' },
  { id: '4', name: 'Potion', image: 'path/to/potion.png', type: 'inventory' },
];

const totalInventorySlots = 20;

const Inventory: React.FC = () => {
  const [inventoryItems, setInventoryItems] = React.useState<(Item | null)[]>(
    Array(totalInventorySlots)
      .fill(null)
      .map((_, index) => initialItems[index] || null),
  );
  const [equipmentItems, setEquipmentItems] = React.useState<{ [key: string]: Item | null }>({
    helmet: null,
    armor: null,
    weapon: null,
    shield: null,
    accessory: null,
  });
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeItemIndex = inventoryItems.findIndex((item) => item && item.id === active.id);
    const overId = over.id.toString();
    console.log('overId', overId);
    console.log('activeItemIndex', activeItemIndex);

    if (activeItemIndex !== -1 && overId.startsWith('inventory-')) {
      const overIndex = parseInt(overId.split('-')[1], 10);

      setInventoryItems((prev) => {
        const newItems = [...prev];
        newItems[overIndex] = prev[activeItemIndex];
        newItems[activeItemIndex] = prev[overIndex];
        return newItems;
      });
    } else if (activeItemIndex !== -1 && overId.startsWith('equipment-')) {
      const equipmentSlot = overId.split('-')[1] as keyof typeof equipmentItems;
      console.log('going to set equipment items');
      if (equipmentItems[equipmentSlot] === null) {
        setEquipmentItems((prev) => ({ ...prev, [equipmentSlot]: inventoryItems[activeItemIndex] }));
        setInventoryItems((prev) => prev.map((item, index) => (index === activeItemIndex ? null : item)));
      }
    } else if (overId.startsWith('inventory-')) {
      const overIndex = parseInt(overId.split('-')[1], 10);
      const equipmentSlot = Object.keys(equipmentItems).find(
        (key) => equipmentItems[key as keyof typeof equipmentItems]?.id === active.id,
      ) as keyof typeof equipmentItems;

      const equippedItem = equipmentItems[equipmentSlot];

      console.log('equippedItem', equippedItem);
      if (equippedItem) {
        setEquipmentItems((prev) => ({ ...prev, [equipmentSlot]: null }));
        setInventoryItems((prev) => prev.map((item, index) => (index === overIndex ? equippedItem : item)));
      }
    }

    setActiveId(null);
  };
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 p-4">
        <div className="w-1/3 bg-gray-700 rounded-md p-4">
          <h2 className="text-lg font-bold mb-4 text-white">Equipment</h2>
          <div className="w-full bg-gray-700 rounded-md p-4">
            <Equipment items={equipmentItems} />
          </div>
        </div>
        <div className="w-2/3 bg-gray-700 rounded-md p-4">
          <h2 className="text-lg font-bold mb-4 text-white">Inventory</h2>
          <SortableContext items={inventoryItems.map((_, index) => `inventory-${index}`)}>
            <div className="grid grid-cols-4 gap-2">
              {inventoryItems.map((item, index) => (
                <SortableSlot key={index} id={`inventory-${index}`} item={item} />
              ))}
            </div>
          </SortableContext>
        </div>
      </div>
      <DragOverlay>
        {activeId ? <DraggableItem item={inventoryItems.find((item) => item?.id === activeId) ?? null} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Inventory;
