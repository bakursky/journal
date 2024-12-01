'use client'
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import { authOptions } from "../api/auth/auth.config";
import { redirect } from "next/navigation";

export default function TextUploadForm() {
  const [selectedDate, setSelectedDate] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const session = useSession(authOptions)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchNote = async () => {
      setIsLoading(true);
      setStatus('Loading note...');

      try {
        const response = await fetch('/api/CheckDateNote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date: selectedDate }),
        });

        const data = await response.json();

        if (data.content) {
          setNoteContent(data.content);
          setStatus('Note loaded successfully');
        } else {
          setNoteContent('');
          setStatus('No note found for this date');
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        setNoteContent('');
        setStatus('Error loading note. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
  };

  const handleContentChange = (e) => {
    setNoteContent(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Uploading...');

    try {
        const formData = new FormData();
        formData.append('date', selectedDate);
        formData.append('content', noteContent); // If you have a file, use: formData.append('file', fileInput);

        const response = await fetch('/api/UploadDriveNote', {
            method: 'POST',
            body: formData, // No need for headers here; the browser sets them automatically for FormData
        });

        const result = await response.json();

        if (response.ok) {
            setStatus('Note saved successfully!');
        } else {
            setStatus(`Error: ${result.error}`);
        }
    } catch (error) {
        setStatus('An error occurred while saving the note.');
        console.error(error);
    }
};


  return (
<div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col items-center justify-center">
  <h1 className="text-2xl font-bold mb-8 text-white">Daily Journal</h1>
  
  <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2 text-white">Select Date:</label>
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        className="w-full p-2 border rounded bg-transparent text-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium mb-2 text-white">Your Note:</label>
      <textarea
        value={noteContent}
        onChange={handleContentChange}
        className="w-full h-64 p-2 border rounded bg-transparent text-white border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Start writing your note..."
        rows="10"
        required
      />
    </div>

    <div className="flex items-center justify-between">
      <button 
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Save Note'}
      </button>
      
      {status && (
        <p className={`text-sm ${
          status.includes('Error') ? 'text-red-500' : 'text-green-500'
        }`}>
          {status}
        </p>
      )}
    </div>
  </form>
  
  <button 
    onClick={() => signOut("google")} 
    className="mt-6 text-sm text-white underline hover:text-blue-500"
  >
    Sign out (if you have a problem with disk)
  </button>
</div>
  );
}