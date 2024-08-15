import React, { useState } from 'react';
import { ClassType } from '../../types/ClassType';
import { Classes } from '../../Interfaces/Classes';

interface ClassSelectionModalProps {
  classes: Classes[];
  selectedClass: ClassType;
  onClassSelect: (className: ClassType) => void;
  onClose: () => void;
}

const ClassSelectionModal: React.FC<ClassSelectionModalProps> =({ classes, selectedClass, onClassSelect, onClose }) => {
        const [currentClass, setCurrentClass] = useState<ClassType>(selectedClass);
      
        const handleClassClick = (className: ClassType) => {
          setCurrentClass(className);
        };
      
        const handleConfirmClick = () => {
          onClassSelect(currentClass);
          onClose(); // Close the modal after confirming
        };
      
        const selectedClassData = classes.find(cls => cls.name === currentClass) || { name: '', description: '' };
      
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full flex flex-col">
                <div className="flex">
                  {/* Scrollable List */}
                  <div className="w-1/3 pr-4 border-r overflow-y-auto max-h-80">
                    <h2 className="text-2xl font-bold mb-4">Class List</h2>
                    {classes.map((cls) => (
                      <div
                        key={cls.name}
                        className={`p-2 cursor-pointer ${currentClass === cls.name ? 'bg-blue-100' : 'bg-white'}`}
                        onClick={() => handleClassClick(cls.name as ClassType)}
                      >
                        <h3 className="text-lg font-semibold">{cls.name}</h3>
                      </div>
                    ))}
                  </div>
                  
                  {/* Class Description */}
                  <div className="w-2/3 pl-4">
                    <h2 className="text-2xl font-bold mb-4">Class Description</h2>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{selectedClassData.name}</h3>
                      <p>{selectedClassData.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Actions Section */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleConfirmClick}
                    className="px-6 py-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 mr-4"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        };

export default ClassSelectionModal;
