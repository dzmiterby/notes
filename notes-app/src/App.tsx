import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

type Note = {
  id: number;
  title: string;
  content: string;
}

function App() {

  const [notes, setNotes] = useState<Note[]>([]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const response = await fetch('http://localhost:5000/api/notes');
        const notes: Note[] = await response.json();
        setNotes(notes);
      } catch (e) {
        console.log(e);
      }
    }
    fetchNotes();
  }, []);


  async function handleAddNote(event: React.FormEvent) {
    event.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/api/notes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );
      const newNote = await response.json();
      setNotes([...notes, newNote]);
      setTitle("");
      setContent("");
    } catch (e) {
      console.log(e);
    }
  }

  function handleClickNote(note: Note) {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  }

  async function handleUpdateNote(event: React.FormEvent) {
    event.preventDefault();
    if(!selectedNote) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/notes/${selectedNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          })
        }
      );
      const updatedNote = await response.json();
      const updatedNotesList = notes.map((note) => note.id === selectedNote.id ? updatedNote : note);
      setNotes(updatedNotesList);
      setTitle("");
      setContent("");
      setSelectedNote(null);
    } catch (e) {
      console.log(e);
    }
  }

  function handleCancel() {
    setTitle('');
    setContent('');
    setSelectedNote(null);
  }

  async function deleteNote(event: React.MouseEvent, noteId: number) {
    event.stopPropagation();
    try {
      await fetch(
        `http://localhost:5000/api/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );
      const updatedNotes = notes.filter(
        (note) => note.id !== noteId
      );
      setNotes(updatedNotes);
    } catch (e) {
      console.log(e);
    }
  }
 
  return (
    <div className="app">
      <form
        className="app__note-form"
        onSubmit={(event) => (selectedNote ? handleUpdateNote(event) : handleAddNote(event))}
      >

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title..."
          required
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Content..."
          rows={10}
          required
        />
        {selectedNote ? (
          <div className="app__edit-buttons">
            <button type="submit">Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        ) : (
          <button type="submit">Add Note</button>
        )}
      </form>
      <div className="app__notes-box">
        {notes.map((note) => (
          <div
            className="app__note-item"
            key={uuidv4()}
            onClick={() => handleClickNote(note)}
          >
            <div className="app__note-header">
              <button onClick={(event) => deleteNote(event, note.id)}>x</button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;