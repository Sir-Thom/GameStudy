// CharacterCreationPage.tsx

import React, { useState } from 'react';
import { ClassType } from '../Interfaces/ClassType';
import { Character } from '../Interfaces/Character';
import { CharacterClass } from '../Interfaces/CharacterClass';
import { DefaultWarriorClass, DefaultMageClass, DefaultArcherClass, DefaultRogueClass } from '../utils/Classes';

const CharacterCreationPage: React.FC = () => {
  // State to manage character creation form data
  const [characterData, setCharacterData] = useState<Character>({
    name: '',
    level: 1,
    class: DefaultWarriorClass, // Default to Warrior class
    hp: 0,
    skills: [],
    inventory: [],
    gold: 0,
    experience: 0,
    nextLevelExp: 100, // Example value, adjust as needed
    currentExp: 0,
    image: '',
    weapon: '',
    armor: '',
    shield: '',
    accessory: '',
  });

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Process character creation logic here (e.g., send data to backend, validate, etc.)
    console.log('Submitted character data:', characterData);
    // Example: Reset form or navigate to next step
  };

  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCharacterData({ ...characterData, [name]: value });
  };

  // Handle class selection
  const handleClassSelect = (selectedClass: ClassType) => {
    let selectedClassData: CharacterClass;

    switch (selectedClass) {
      case ClassType.Warrior:
        selectedClassData = DefaultWarriorClass;
        break;
      case ClassType.Mage:
        selectedClassData = DefaultMageClass;
        break;
      case ClassType.Archer:
        selectedClassData = DefaultArcherClass;
        break;
      case ClassType.Rogue:
        selectedClassData = DefaultRogueClass;
        break;
      default:
        selectedClassData = DefaultWarriorClass; // Default to Warrior if no match
    }

    setCharacterData({ ...characterData, class: selectedClassData });
  };

  return (
    <div className="character-creation-page">
      <h1>Create Your Character</h1>
      <form onSubmit={handleSubmit}>
        {/* Character Name Input */}
        <div>
          <label htmlFor="name">Character Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={characterData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Class Selection */}
        <div>
          <label>Choose Your Class:</label>
          <div>
            <button
              onClick={() => handleClassSelect(ClassType.Warrior)}
              className={`class-button ${characterData.class.name === ClassType.Warrior ? 'selected' : ''}`}
            >
              Warrior
            </button>
            <button
              onClick={() => handleClassSelect(ClassType.Mage)}
              className={`class-button ${characterData.class.name === ClassType.Mage ? 'selected' : ''}`}
            >
              Mage
            </button>
            <button
              onClick={() => handleClassSelect(ClassType.Archer)}
              className={`class-button ${characterData.class.name === ClassType.Archer ? 'selected' : ''}`}
            >
              Archer
            </button>
            <button
              onClick={() => handleClassSelect(ClassType.Rogue)}
              className={`class-button ${characterData.class.name === ClassType.Rogue ? 'selected' : ''}`}
            >
              Rogue
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button type="submit">Create Character</button>
        </div>
      </form>
    </div>
  );
};

export default CharacterCreationPage;
