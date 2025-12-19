import "./blog.css";
import { useEffect, useState, useContext, useRef } from "react";
import { getTable } from "../../services/database";
import { formatDateToSpanish } from "../../utils/utils";
import { useLocation, Link } from "react-router-dom";
import waitAllImagesCharged from "../../utils/waitAllImagesCharged";
import { SpinnerContext } from "../../context/spinnerContext";

const useQuery = () =>  new URLSearchParams(useLocation().search);     

function Blog() {

    const {showSpinner} = useContext(SpinnerContext);
    const query = useQuery();          
    const [blogRows, setBlogRows] = useState <JSX.Element[]>([]);
    const [paginationNumbers, setpaginationNumbers] = useState <JSX.Element[]>([]);
    const numberOfPagesRef = useRef(0);
    const [changeOrientation, setChangeOrientation] = useState  (false);
    
    const actualPageStr = query.get("page") as string || "";
    let actualPageNumber = parseInt(actualPageStr) || 1;     
    const resultsByPage = 2;

    useEffect(() => {                                                                                                                           //Cambio de estilo del número de página actual
        if (paginationNumbers.length) {
            const blog_paginationNumbers = document.querySelectorAll(".blog_paginationNumber") as NodeListOf <HTMLAnchorElement>;
            blog_paginationNumbers.forEach((paginationNumber) => paginationNumber.classList.remove("blog_paginationNumber_selected"));
            const numberOfPaginationToSelect = document.getElementById(`blog_paginationNumber${actualPageNumber}`);
            if (numberOfPaginationToSelect) numberOfPaginationToSelect.classList.add("blog_paginationNumber_selected");
        }
    }, [actualPageNumber, paginationNumbers]);

    useEffect(() => {                                                                                                                           //Cambio de estilos en linea dinamicos al cambiar la orientacion
        const changeOrientation = () => {
            setChangeOrientation((current) => !current);
        };
        window.addEventListener("orientationchange", changeOrientation);
        return () => {
            window.removeEventListener("orientationchange", changeOrientation);
        };
    }, []);
        
    useEffect(() => {
        (async() => {
            const response1 = await getTable({tableName: "nota", count: true});
            if (response1.success) {

                const numOfPosts = response1.data;                                                  //Número de filas
                const numberOfPages = Math.ceil(numOfPosts / resultsByPage);                        //Número total de páginas existentes
                numberOfPagesRef.current = numberOfPages;
                if (actualPageNumber > numberOfPages) actualPageNumber = numberOfPages;             //Si la página actual es mayor que el número de páginas, se redirige a la última existente
                if (actualPageNumber <= 0) actualPageNumber = 1;                                    //Si la página actual es menor o igual a 0, se redirige a la primera existente
       
                const offset = (actualPageNumber - 1) * resultsByPage;                              //El offeset es a partir de que posición obtiene resultados, para pagina 1 offset es 0

                const paginationNumbersJSX = [];
                for (let i = 0; i < numberOfPages; i ++) {
                    paginationNumbersJSX.push(
                        <Link to={`/blog?page=${i + 1}`} key={i} id={"blog_paginationNumber" + (i + 1)} className="blog_paginationNumber opcionHoverPinkTransition flex">{i + 1}</Link>
                    );
                }
                setpaginationNumbers(paginationNumbersJSX);

                const response2 = await getTable({tableName: "nota", fields: ["titulo", "fecha", "foto", "intro", "slug"], limit: resultsByPage, offset: offset, orderBy: {field: "fecha", order: "desc"}});
                if (response2.success && response2.data && response2.data.length) {
                    const dataFromDB = response2.data;
                    const dataJSX = dataFromDB.map((row: any, index: number) => 
                        <Link to={`/nota/${row.slug}`}  
                            key={index} 
                            className="blog_rowCont flex" 
                            style={window.innerWidth > window.innerHeight ? {flexDirection: index%2 === 0 ? "row": "row-reverse"} : {}}        /*Vamos alternando orden de imagen y texto*/
                        >           
                            <div className="blog_rowImageCont">
                                <img src={row.thumbnail} alt={row.description} className="blog_rowImage"/>                                           
                                <div className={index%2 === 0 ? "blog_rowImageHoverFilter1" : "blog_rowImageHoverFilter2"}></div>               {/*Cambiamos el efecto hover segun posición del post sea par o impar*/}
                            </div>
                            <div className="blog_rowInfoCont flex column">
                                <p className="blog_rowDate">{formatDateToSpanish(row.fecha)}</p>
                                <h2 className="blog_rowTitle opcionHoverPinkTransition">{row.titulo}</h2>
                                <p className="blog_rowIntro">{row.intro}</p>
                                <p className="blog_rowSeeMore opcionHoverPinkTransition">Leer Más »</p>
                            </div>     
                        </Link>
                    );
                    setBlogRows(dataJSX);
                }
            }
        })();
    }, [actualPageNumber, changeOrientation]);

    useEffect(() => {
        if (!blogRows.length) return;
        (async () => {
            showSpinner(true);
            await waitAllImagesCharged();
            showSpinner(false);
        })();
    }, [blogRows]);    
               
    return (
        <div className="pagesContainer faqs_pageContainer blog_pageContainer paddingHorizontalPages flex column">
            <div className="faqs_container flex column">
                <p className="faqs_index">Inicio / <span>Blog</span></p>
                {blogRows}    
            </div>
            <div className="blog_paginationCont flex">
                <Link className="blog_paginationDiv blog_paginationArrow opcionHoverPinkTransition flex" to={actualPageNumber - 1 < 1 ? "/blog?page=1" : `/blog?page=${actualPageNumber - 1}`}>&lt;</Link>
                <div className="blog_paginationDiv flex">{paginationNumbers}</div>
                <Link className="blog_paginationDiv blog_paginationArrow opcionHoverPinkTransition flex" to={actualPageNumber + 1 > numberOfPagesRef.current ? `/blog?page=${numberOfPagesRef.current}` : `/blog?page=${actualPageNumber + 1}`}>&gt;</Link>
            </div>
        </div>
    );
}

export default Blog;