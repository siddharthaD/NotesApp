import React, {useState} from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import { data } from "./data"
import Split from "react-split"
import { nanoid } from "nanoid"
// import {auth,db} from "./firebase.js";
import {onSnapshot} from 'firebase/firestore'

import Auth from "./components/Auth";
import {auth, noteCollection, unloadCallback} from "./firebase.js";

export default function App() {
    const [notes, setNotes] = React.useState(
        () => JSON.parse(localStorage.getItem("notes")) || []
    )

    const [currentNoteId, setCurrentNoteId] = React.useState(
        (notes[0] && notes[0].id) || ""
    )

    const [user,setUser] = useState({})

    // added to ensure snapshot is working properly
    //https://stackoverflow.com/questions/74468493/firestore-fetch-api-cannot-load-due-to-access-control-checks
    React.useEffect(() => {
        window.addEventListener("beforeunload",unloadCallback)
        return ()=> window.removeEventListener("beforeunload",unloadCallback)
  }, [])

    React.useEffect(() => {
        localStorage.setItem("notes", JSON.stringify(notes))

        const unsubscribe = onSnapshot(noteCollection,function(snapshot){
            // sync our local notes array
            console.log("Things are changing")

            const notesArr = snapshot.docs.map(
                doc => ({...doc.data(),id:doc.id})
            )
        })

        return unsubscribe;

    }, [notes])

    function createNewNote() {
        const newNote = {
            id: nanoid(),
            body: "# Type your markdown note's title here"
        }
        setNotes(prevNotes => [newNote, ...prevNotes])
        setCurrentNoteId(newNote.id)
    }

    function updateNote(text) {
        setNotes(oldNotes => {
            const newArray = []
            for (let i = 0; i < oldNotes.length; i++) {
                const oldNote = oldNotes[i]
                if (oldNote.id === currentNoteId) {
                    // Put the most recently-modified note at the top
                    newArray.unshift({ ...oldNote, body: text })
                } else {
                    newArray.push(oldNote)
                }
            }
            return newArray
        })
    }

    function deleteNote(event, noteId) {
        event.stopPropagation()
        setNotes(oldNotes => oldNotes.filter(note => note.id !== noteId))
    }

    function findCurrentNote() {
        return notes.find(note => {
            return note.id === currentNoteId
        }) || notes[0]
    }

    function handleAuthChange()
    {
        auth.currentUser ? setUser(auth.currentUser) : setUser({})

    }
    return (
        <main>
            <Auth handleAuthChange={handleAuthChange} user={user}/>
            {
                notes.length > 0
                    ?
                    <Split
                        sizes={[30, 70]}
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            notes={notes}
                            currentNote={findCurrentNote()}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        {
                            currentNoteId &&
                            notes.length > 0 &&
                            <Editor
                                currentNote={findCurrentNote()}
                                updateNote={updateNote}
                            />
                        }
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}
                        >
                            Create one now
                </button>
                    </div>

            }
        </main>
    )
}
