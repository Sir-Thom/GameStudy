import { getCurrentWindow } from '@tauri-apps/api/window';
import { Link } from 'react-router-dom';
interface PauseMenuProps {
  isVisible: boolean;
  onClose: () => void;
  mainMenuLink: string;
}

export default function PauseMenu({ isVisible, onClose, mainMenuLink }: PauseMenuProps) {
  if (!isVisible) return null;
  // to redesign
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white grid p-8 rounded-lg shadow-lg text-center w-80">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6">Pause Menu</h2>
        <button
          className="mt-4 w-full px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-md shadow-ld hover:bg-blue-700 transition-transform transform hover:scale-105"
          onClick={onClose}
        >
          Resume Game
        </button>
        <Link
          className="mt-4 w-full px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
          to={mainMenuLink}
        >
          Return to Main Menu
        </Link>
        <button
          className="mt-4 w-full px-6 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105"
          onClick={async () => await getCurrentWindow().close()}
        >
          Exit the App
        </button>
      </div>
    </div>
  );
}
