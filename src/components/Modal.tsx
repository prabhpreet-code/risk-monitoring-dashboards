import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-softPeach rounded-lg p-6 w-full max-w-md relative max-h-[80vh] overflow-y-auto">
        <button
          className="absolute top-2 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          x
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
