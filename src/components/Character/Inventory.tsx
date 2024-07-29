import React, { useState } from 'react';
import { ExtendedPlayer, Player } from '../../Interfaces/Player';
import { Weapon } from '../../Interfaces/Weapon';
import { Inventory } from '../../Interfaces/Inventory';
import { fetchPlayerInventory } from '../../utils/dbUtils';
import Database from '@tauri-apps/plugin-sql';

// just to test the inventory needs to  improve
interface InventoryProps {
  character: Player;
  weapons: Weapon[];
  onEquipWeapon: (weaponId: number) => void;
  onUnequipWeapon: () => void;
  onUseItem: (itemName: string) => void;
}

const InventoryPlayer: React.FC<InventoryProps> = ({
  character,
  weapons,
  onEquipWeapon,
  onUnequipWeapon,
  onUseItem,
}) => {
  const [selectedWeapon, setSelectedWeapon] = useState<number | null>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const db = Database.load('sqlite:character.db');
  const handleEquipWeapon = () => {
    if (selectedWeapon !== null) {
      onEquipWeapon(selectedWeapon);
    }
  };

  fetchPlayerInventory(db, character.id).then((result) => setInventory(result));

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
        {inventory.map((item, index) => (
          <div key={index}>
            <span>{item}</span>
            <button onClick={() => handleUseItem(item)}>Use</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryPlayer;
