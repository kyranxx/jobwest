"use client";

import { useState } from 'react';

interface DeleteAdDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
}

export default function DeleteAdDialog({ isOpen, onClose, onConfirm, userEmail }: DeleteAdDialogProps) {
  const [emailConfirmation, setEmailConfirmation] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (emailConfirmation === userEmail) {
      onConfirm();
    } else {
      alert('Nesprávny email.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Zmazať inzerát</h2>
        <p>Pre potvrdenie zmazania inzerátu zadajte svoj email: {userEmail}</p>
        <input
          type="email"
          value={emailConfirmation}
          onChange={(e) => setEmailConfirmation(e.target.value)}
          className="border p-2 w-full mt-2"
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">Zrušiť</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg">Zmazať</button>
        </div>
      </div>
    </div>
  );
}
