import { Link, useLocation, useNavigate } from "react-router-dom";
import "./news.css";
import { useContext, useEffect, useRef, useState } from "react";
import { getProductsByIDs, getTable } from "../../../services/database";
import { NewsProducto, Novedad, Producto } from "../../../types/database";
import waitAllImagesCharged from "../../../utils/waitAllImagesCharged";
import { showElement } from "../../../utils/utils";
import { SpinnerContext } from "../../../context/spinnerContext";
import Beneficts from "../../../components/landing/beneficts/Beneficts";
import FinalBanner from "../../../components/landing/finalBanner/FinalBanner";
import FloatingWhatsapp from "../../../components/landing/floatingWhatsapp/FloatingWhatsapp";
import SeccionsHeader from "../../../components/landing/seccionsHeader/SeccionsHeader";
import { swalPopUp } from "../../../utils/swal";

const setNumberOfPageOn = (numberOfPage: number) => {
    const allNumberOfPages = document.querySelectorAll(".landingPageNews_slider_pagination_number_cont") as NodeListOf<HTMLDivElement>;
    allNumberOfPages.forEach((element) => element.classList.remove("landingPageNews_slider_pagination_number_cont_active"));
    const currentPageElement = Array.from(allNumberOfPages).find((element) => element.id === numberOfPage.toString());
    currentPageElement?.classList.add("landingPageNews_slider_pagination_number_cont_active");
};

const useQuery = () =>  new URLSearchParams(useLocation().search);

const News = () => {
    const query = useQuery();
    const page = query.get("page");
    const pageParsed = page ? parseInt(page || "") || 1 : null;
    const navigate = useNavigate();

    const numberOfProductsNewsByPage = 3;
    const [newsProductsJSX, setNewsProductsJSX] = useState <JSX.Element[] | null> (null);
    const [newsPaginationDataJSX, setNewsPaginationDataJSX] = useState <JSX.Element[] | null> (null);
    const newsProductsDataRef = useRef <(NewsProducto & {titulo: string, slug: string, id_novedad: number})[] | null> (null);
    const {showSpinner} = useContext(SpinnerContext);

    const setNewsProductsCards = (data: {pageNumber: number}) => {
        if (!newsProductsDataRef.current) return;
        showSpinner(true);
        const {pageNumber} = data;
        const initialIndex = (pageNumber - 1) * numberOfProductsNewsByPage;
        const finalIndex = initialIndex + 3;
        const newsProductsDataHTML: JSX.Element[] = newsProductsDataRef.current.slice(initialIndex, finalIndex).map((product, index) => {
            return (
                <Link to={`/landing/novedad/${product.slug}`} key={index} className="landingPageNews_slider_product_card_cont flex column" title={product.titulo.toUpperCase()}>
                    <div className="landingPageNews_slider_product_card_eye_cont flex">
                        <img src="/images/landing/eye.png" className="landingPageNews_slider_product_card_eye" alt="Eye" />
                        <p>VER PRODUCTO</p>
                    </div>
                    <img src={product.foto1} className="landingPageNews_slider_product_card_img" alt={product.titulo} />
                    <p className="landingPageNews_slider_product_card_text">{product.titulo.length > 70 ? `${product.titulo.substring(0, 70)}...` : product.titulo}</p>
                </Link>
            );
        });    
        setNewsProductsJSX(newsProductsDataHTML);
        setNumberOfPageOn(pageNumber);
    };
 
    useEffect(() => {
        (async() => {
            showSpinner(true);
            const newsConditions: {"field": keyof Novedad, value: string | number}[] = [{field: "habilitada", value: "1"}];
            const newsFields: (keyof Novedad)[] = ["id_producto", "titulo", "slug", "id"];
            const response = await getTable({tableName: "novedad", conditions: newsConditions, fields: newsFields});
            if (response.success && response.data && response.data.length) {
                const newsProductsDataFromDB: Pick<Novedad, "id_producto" | "titulo" | "slug" | "id">[] = response.data;
                const newsProductsIDsArr: number[] = newsProductsDataFromDB.map((productData) => productData.id_producto);
                const numberOfProductsNews = newsProductsIDsArr.length;
                const numberOfPages = Math.ceil(numberOfProductsNews / numberOfProductsNewsByPage);
                
                const productsFieldsArr: (keyof Producto)[] = ["id", "foto1", "nombre"];
                const response2 = await getProductsByIDs({iDsArr: newsProductsIDsArr, fieldsArr: productsFieldsArr});
                
                if (!response2.success || !response2.data) {
                    swalPopUp ("Error", `No se pudieron obtener las novedades de la base de datos: ${response.message}`, "error");
                    showSpinner(false);
                    return;
                } else if (!response2.data.length) {
                    swalPopUp ("Ops!", "No se encontraron novedades", "info");
                    showSpinner(false);
                    return;
                }   
              
                const newsProductsData: NewsProducto[] = response2.data;
                const newsProductsDataWithAditionalInfo = newsProductsData.map((product) => {
                    const productData = newsProductsDataFromDB.find((productData) => productData.id_producto === product.id);
                    return {...product, titulo: productData?.titulo || "", slug: productData?.slug || "", id_novedad: 0};                   //Agregamos id_novedad = 0 para cumplir con la definicion de tipos, luego se agregará el valor
                });
                newsProductsDataRef.current = structuredClone(newsProductsDataWithAditionalInfo);
                
                if(!newsProductsDataRef.current) {
                    swalPopUp ("Error", `No se pudieron obtener los productos de la base de datos: ${response2.message}`, "error");
                    showSpinner(false);
                    return;
                }
                
                newsProductsDataRef.current = newsProductsDataRef.current.map((product) => ({
                    ...product,
                    id_novedad: newsProductsDataFromDB.find((productData) => productData.id_producto === product.id)?.id || 0
                }));                    
                newsProductsDataRef.current?.sort((a, b) => b.id_novedad - a.id_novedad);                                                  //Ordenamos productos por novedad mas reciente a mas antigua                 
                
                const paginationDataHTML: JSX.Element[] = [];                                                                              //Seteo inicial de numeros de paginacion
                for(let i = 1; i <= numberOfPages; i++) {
                    paginationDataHTML.push(
                        <div key={i} className="landingPageNews_slider_pagination_number_cont flex" id={i.toString()} onClick={() => navigate(`/landing/news?page=${i}`)}>
                            <p className="landingPageNews_slider_pagination_number">{i}</p>
                        </div>
                    );
                }
                setNewsPaginationDataJSX(paginationDataHTML);

                if (!pageParsed) setNewsProductsCards({pageNumber: 1});     

            } else {
                swalPopUp ("Error", `No se pudieron obtener las novedades de la base de datos: ${response.message}`, "error");
                showSpinner(false);
            }
        })();  
    }, []);    

    useEffect(() => {
        if (!pageParsed && newsPaginationDataJSX && newsProductsDataRef.current) {
            setNewsProductsCards({pageNumber: 1}); 
            return;
        }
        if (!pageParsed || !newsPaginationDataJSX || !newsProductsDataRef.current) return;
        setNewsProductsCards({pageNumber: pageParsed});  
    }, [pageParsed, newsProductsDataRef.current, newsPaginationDataJSX]);
    
    useEffect(() => {
        if (!newsProductsJSX || !newsPaginationDataJSX) return;
        (async () => {
            await waitAllImagesCharged();
            showElement(true);
            showSpinner(false);
        })();
    }, [newsProductsJSX, newsPaginationDataJSX]);
          
    return (
        <div className="pagesContainer landingPageNews_cont elementToShow flex column">
            <SeccionsHeader pathName="Novedades" title="Últimos lanzamientos"/>
            <div className="landingPageNews_optionsBar_cont flex">
                <div className="landingPageNews_optionsBar_internal_cont flex">
                    <div className="landingPageNews_optionsBar_img_cont flex column">
                        <img src="/images/icons/prices_landing_blue.png" alt="Prices" />
                        <p>Precios exclusivos</p>
                    </div>
                    <div className="landingPageNews_optionsBar_img_cont flex column">
                        <img src="/images/icons/orders_landing_blue.png" alt="Prices" />
                        <p>Pedidos online</p>
                    </div>
                    <div className="landingPageNews_optionsBar_img_cont flex column">
                        <img src="/images/icons/gift_landing_blue.png" alt="Prices" />
                        <p>Regalo por tu compra</p>
                    </div>
                    <div className="landingPageNews_optionsBar_img_cont flex column">
                        <img src="/images/icons/warranty_landing_blue.png" alt="Prices" />
                        <p>100% Garantizado</p>
                    </div>
                </div>
            </div>
            <div className="landingPageNews_sliderCont flex column">
                <div className="landingPageNews_slider_internal_cont flex">
                    {newsProductsJSX}
                </div>
            </div>
            <div className="landingPageNews_slider_pagination_cont flex wrap">
                {newsPaginationDataJSX}
            </div>
            <Beneficts/>
            <FinalBanner className="finalBannerClass"/>
            <FloatingWhatsapp/>
        </div>
    );
};

export default News;
