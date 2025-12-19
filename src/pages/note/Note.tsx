import "./note.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { getTable } from "../../services/database";
import { Nota } from "../../types/database";
import { formatDateToSpanish } from "../../utils/utils";
import waitAllImagesCharged from "../../utils/waitAllImagesCharged";
import { SpinnerContext } from "../../context/spinnerContext";

function Note() {

    const { showSpinner } = useContext(SpinnerContext);
    const { noteId } = useParams();
    const [noteData, setNoteData] = useState <Nota> ({});
    const navigate = useNavigate();
    const [nextNote, setNextNote] = useState <Nota | null> (null);
    const [prevNote, setPrevNote] = useState <Nota | null> (null);
    const [blogPage, setBlogPage] =  useState(1);
    const numberOfNotesByPage = 2;

    useEffect(() => {
        (async() => {
            if (!noteId) return;    
            const response = await getTable({tableName: "nota", orderBy: {field: "fecha", order: "desc"}});
            if (response.success && response.data) {
                const notesDataFromDB = response.data;
                const noteDataFromDB = notesDataFromDB.find((note: Nota) => note.slug === noteId);
                const actualNoteIndex = notesDataFromDB.findIndex((note: Nota) => note.slug === noteId);
                const numberOfNotes = notesDataFromDB.length;
                const nextNoteIndex = actualNoteIndex + 1 >= numberOfNotes ? null : actualNoteIndex + 1;
                const prevNoteIndex = actualNoteIndex - 1 < 0 ? null : actualNoteIndex - 1;

                const blogPageForThisNote = Math.ceil((actualNoteIndex + 1)/ numberOfNotesByPage);
                setBlogPage(blogPageForThisNote);

                nextNoteIndex !== null ? setNextNote(notesDataFromDB[nextNoteIndex]) : setNextNote(null);
                prevNoteIndex !== null ? setPrevNote(notesDataFromDB[prevNoteIndex]) : setPrevNote(null);
                
                const note_contentCont = document.querySelector(".note_contentCont") as HTMLDivElement;              //Eliminamos estilos setedos en el html
                const noteHTMLStr = noteDataFromDB.descripcion as string;                                                       
                const noteHTMLArr = noteHTMLStr.split(" ");
                const noteHTMLFiltered = noteHTMLArr.filter((word) => !word.includes("width=") && !word.includes("height="));
                const noteHTML = noteHTMLFiltered.join(" ");
                note_contentCont.innerHTML =  noteHTML;
           
                setNoteData(noteDataFromDB);

            }
        })();
    }, [noteId]);

    useEffect(() => {                                                                                               //Manejo de spinner
        if (!noteData) return;
        (async () => {
            showSpinner(true);
            await waitAllImagesCharged();
            showSpinner(false);
        })();
    }, [noteData]);
          
    return (
        <div className="pagesContainer note_pageContainer paddingHorizontalPages flex column">
            <img src={noteData.foto} alt={noteData.titulo} className="note_topImage"/>
            <div className="note_indexCont flex">
                <p className="note_index">Inicio / Blog / <span>{noteData.titulo}</span></p>
            </div>
            <div className="faqs_container note_container flex column">
                <div className="note_head flex column">
                    <p className="note_back opcionHoverPinkTransition" onClick={() => navigate(`/blog?page=${blogPage}`)}>« VOLVER AL LISTADO</p>
                    <h1 className="note_title">{noteData.titulo}</h1>
                    <p className="note_date">{formatDateToSpanish(noteData.fecha as string)}</p>
                </div>
                <div className="note_contentCont flex column"></div>                                              {/*Acá va el contenido html del post*/}
            </div> 
            <div className="note_otherNotesCont flex">
                <div className="note_prevNote note_otherNote flex column" onClick={() => prevNote ? navigate(`/nota/${prevNote.slug}`) : null}>
                    {   
                        prevNote &&
                        <>
                            <h2 className="note_otherNotesTitle">{prevNote.titulo}</h2>
                            <p className="note_otherNotesIntro">{prevNote.intro}</p>
                            <p className="note_otherNotesDate">{formatDateToSpanish(prevNote.fecha as string)}</p>
                            <img src={prevNote.thumbnail} className="note_otherNotesImg" alt={prevNote.titulo} />
                            <div className="note_otherNotesBgFilter"></div>
                        </>
                    }
                </div>
                <div  className="note_nextNote note_otherNote flex column" onClick={() => nextNote ? navigate(`/nota/${nextNote.slug}`) : null}>
                    {   
                        nextNote &&
                        <>
                            <h2 className="note_otherNotesTitle">{nextNote.titulo}</h2>
                            <p className="note_otherNotesIntro">{nextNote.intro}</p>
                            <p className="note_otherNotesDate">{formatDateToSpanish(nextNote.fecha as string)}</p>
                            <img src={nextNote.thumbnail} className="note_otherNotesImg" alt={nextNote.titulo} />
                            <div className="note_otherNotesBgFilter note_otherNotesBgFilterNext"></div>
                        </>
                    }        
                </div>
            </div>
        </div>
    );
}

export default Note;