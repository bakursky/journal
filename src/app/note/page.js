'use client'

import { useEffect, useState } from 'react';

export default function TextUploadForm() {
  const [selectedDate, setSelectedDate] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');


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
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Daily Journal</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your Note:</label>
          <textarea
            value={noteContent}
            onChange={handleContentChange}
            className="w-full h-64 p-2 border rounded"
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
    </div>
  );
}