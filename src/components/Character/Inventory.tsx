import React, { useState } from 'react';
import { Character } from '../../Interfaces/Character';
import { Weapon } from '../../Interfaces/Weapon';

// just to test the inventory needs to  improve
interface InventoryProps {
  character: Character;
  weapons: Weapon[];
  onEquipWeapon: (weaponId: number) => void;
  onUnequipWeapon: () => void;
  onUseItem: (itemName: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ character, weapons, onEquipWeapon, onUnequipWeapon, onUseItem }) => {
  const [selectedWeapon, setSelectedWeapon] = useState<number | null>(null);

  const handleEquipWeapon = () => {
    if (selectedWeapon !== null) {
      onEquipWeapon(selectedWeapon);
    }
  };

  const handleUnequipWeapon = () => {
    onUnequipWeapon();
  };

  const handleUseItem = (itemName: string) => {
    onUseItem(itemName);
  };

  return (
    <div className="inventory">
      <h2>Inventory</h2>
      <div>
        <h3>Weapons</h3>
        <select onChange={(e) => setSelectedWeapon(Number(e.target.value))} value={selectedWeapon ?? ''}>
          <option value="">Select Weapon</option>
          {weapons.map((weapon) => (
            <option key={weapon.id} value={weapon.id}>
              {weapon.name}
            </option>
          ))}
        </select>
        <button onClick={handleEquipWeapon}>Equip Weapon</button>
        <button onClick={handleUnequipWeapon}>Unequip Weapon</button>
      </div>

      <div>
        <h3>Items</h3>
        {character.inventory.map((item, index) => (
          <div key={index}>
            <span>{item}</span>
            <button onClick={() => handleUseItem(item)}>Use</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
