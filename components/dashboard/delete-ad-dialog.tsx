"use client";

import { useState } from 'react';

interface DeleteAdDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userEmail: string;
  isDeleting?: boolean;
}

export default function DeleteAdDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userEmail, 
  isDeleting = false 
}: DeleteAdDialogProps) {
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleConfirm = async () => {
    if (emailConfirmation !== userEmail) {
      setError('Nesprávny email.');
      return;
    }

    setError('');
    try {
      await onConfirm();
    } catch (err) {
      console.error('Delete confirmation failed:', err);
      setError('Nepodarilo sa zmazať inzerát');
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setEmailConfirmation('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Zmazať inzerát</h2>
        <p className="mb-4">Pre potvrdenie zmazania inzerátu zadajte svoj email:</p>
        <p className="font-mono text-sm text-gray-600 mb-2">{userEmail}</p>
        <input
          type="email"
          value={emailConfirmation}
          onChange={(e) => setEmailConfirmation(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Zadajte váš email"
          disabled={isDeleting}
        />
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
        <div className="mt-6 flex justify-end space-x-2">
          <button 
            onClick={handleClose} 
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors disabled:opacity-50"
            disabled={isDeleting}
          >
            Zrušiť
          </button>
          <button 
            onClick={handleConfirm} 
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting || emailConfirmation !== userEmail}
          >
            {isDeleting ? 'Mazanie...' : 'Zmazať'}
          </button>
        </div>
      </div>
    </div>
  );
}
