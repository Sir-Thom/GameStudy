import { publicDir } from "@tauri-apps/api/path";
import { publicEncrypt } from "crypto";
import React, { useEffect, useState } from "react";

interface PortraitSelectionProps {
    selectedPortrait: string;
    onSelect: (portrait: string) => void;
  }
 // Function to dynamically import all images and resolve their URLs
const loadPortraits = async () => {
    const modules = import.meta.glob('/src/assets/portrait/*.{png,jpeg,jpg,svg}', { eager: true });
    const imagePaths: string[] = [];
  
    for (const path in modules) {
      const module = modules[path];
      const url = new URL(module.default, import.meta.url).toString();
      imagePaths.push(url);
    }
  
    return imagePaths;
  };

  

export default function PortraitSelection({ selectedPortrait, onSelect }: PortraitSelectionProps) {
    const [availablePortraits, setAvailablePortraits] = useState<string[]>([]);

    useEffect(() => {
      // Load portraits when the component mounts
      const fetchPortraits = async () => {
        const portraits = await loadPortraits();
        setAvailablePortraits(portraits);
      };
      fetchPortraits();
    }, []);
  
    return (
         <div>
        <label className="block text-sm font-medium text-gray-700">Choose Your Portrait:</label>
        <div className="mt-2 flex flex-wrap gap-4">
        {availablePortraits.map((portrait, index) => (
          <img
            key={index}
            src={portrait}
            alt={`Portrait ${index + 1}`}
            className={`w-16 h-16 cursor-pointer border-2 rounded-md ${selectedPortrait === portrait ? 'border-indigo-600' : 'border-gray-300'}`}
            onClick={() => onSelect(portrait)}
          />
        ))}
        </div>
      </div>
      );
    };
