import React, {useState} from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
// import {auth,db} from "./firebase.js";
import {addDoc, onSnapshot,doc,deleteDoc,setDoc} from 'firebase/firestore'

import Auth from "./components/Auth";
import {auth, db, noteCollection, unloadCallback} from "./firebase.js";

export default function App() {
    const [notes, setNotes] = React.useState( [])

    const [currentNoteId, setCurrentNoteId] = React.useState( ""
    )
    const [editorNoteText,setEditorNoteText] = React.useState("")

    const [user,setUser] = useState({})

    // added to ensure snapshot is working properly
    //https://stackoverflow.com/questions/74468493/firestore-fetch-api-cannot-load-due-to-access-control-checks
    React.useEffect(() => {
        window.addEventListener("beforeunload",unloadCallback)
        return ()=> window.removeEventListener("beforeunload",unloadCallback)
  }, [])

    React.useEffect(()=>{
        !currentNoteId && setCurrentNoteId(notes[0]?.id);
    },[notes])

    React.useEffect(()=>{
        setEditorNoteText(currentNote?.body !== editorNoteText ?
                                currentNote?.body : editorNoteText);

    },[currentNoteId])



    React.useEffect(() => {
        const unsubscribe = onSnapshot(noteCollection,function(snapshot){
            // sync our local notes array
            console.log("Things are changing")

            const notesArr = snapshot.docs.map(
                doc => ({...doc.data(),id:doc.id})
            )

            setNotes(notesArr)
        })

        return unsubscribe;

    }, [])

    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here",
            createdOn: Date.now(),
            updatedOn: Date.now()
        }

        const newNoteRef = await addDoc(noteCollection,newNote)

        setCurrentNoteId(newNoteRef.id)
    }

    async function updateNote(text) {
       const docRef = doc(db,noteCollection.path,currentNoteId)
        await setDoc(docRef,{body:text,updatedOn:Date.now()}, {merge:true})
    }

    async function deleteNote(event, noteId) {
        event.stopPropagation()
        // alert(noteId);noteId
        const docRef = doc(db,noteCollection.path,noteId)
        deleteDoc(docRef).then(r=>console.log(r))
            .catch(err=>console.log(err))
    }

    const currentNote = notes.find(note=>note.id===currentNoteId) || notes[0]
    console.log(editorNoteText)

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
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        {
                            currentNoteId &&
                            notes.length > 0 &&
                            <Editor
                                currentNoteText={editorNoteText}
                                updateNote={setEditorNoteText}
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
