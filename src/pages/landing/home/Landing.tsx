import { useEffect, useContext, useState } from "react";
import "./landing.css";
import FloatingWhatsapp from "../../../components/landing/floatingWhatsapp/FloatingWhatsapp";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { scrollWithoffset, showElement } from "../../../utils/utils";
import Beneficts from "../../../components/landing/beneficts/Beneficts";
import FinalBanner from "../../../components/landing/finalBanner/FinalBanner";
import { Novedad, Producto, Reviews } from "../../../types/database";
import { getProductsByIDs, getTable } from "../../../services/database";
import { SpinnerContext } from "../../../context/spinnerContext";
import waitAllImagesCharged from "../../../utils/waitAllImagesCharged";
import { swalPopUp } from "../../../utils/swal";

/************************************ Logica slider reviews ***************************************/

let reviewsSliderInMovement = false;

const reviewsSliderhandleMove = (direction: "left" | "right") => {
    if (reviewsSliderInMovement) return;
    reviewsSliderInMovement = true;
    const sliderCont =  document.querySelector(".landingPage_home_reviews_slider_internal_cont") as HTMLDivElement;

    const distanceToMove = (sliderCont.querySelector(".landingPage_home_reviews_slider_item") as HTMLDivElement).offsetWidth;
    document.documentElement.style.setProperty("--slider2translateDistance", `${distanceToMove}px`);

    if (direction === "left") {
        sliderCont.classList.add("landingPage_home_jewelrySlider2_toLeftAnimation");
        const animation = sliderCont.getAnimations()[0];

        const reviewsSliderAndControlsCont = document.querySelector(".landingPage_home_reviews_sliderAndControls_cont") as HTMLDivElement;      //Transicion a la altura del slider al cambiar de texto
        reviewsSliderAndControlsCont.style.height = (sliderCont.childNodes[1] as HTMLDivElement).offsetHeight + "px";

        animation.addEventListener("finish", () => {
            sliderCont.classList.remove("landingPage_home_jewelrySlider2_toLeftAnimation");
            const firstChild = sliderCont.firstChild;
            if (!firstChild) return;
            sliderCont.appendChild(firstChild);
            reviewsSliderInMovement = false;
        });
    } else {
        sliderCont.classList.add("landingPage_home_jewelrySlider2_toRightAnimation");
        const animation = sliderCont.getAnimations()[0];
        const lastChild = sliderCont.lastChild;
        if (!lastChild) return;
        sliderCont.prepend(lastChild);

        const reviewsSliderAndControlsCont = document.querySelector(".landingPage_home_reviews_sliderAndControls_cont") as HTMLDivElement;      //Transicion a la altura del slider al cambiar de texto
        reviewsSliderAndControlsCont.style.height = (sliderCont.childNodes[0] as HTMLDivElement).offsetHeight + "px";

        animation.addEventListener("finish", () => {
            sliderCont.classList.remove("landingPage_home_jewelrySlider2_toRightAnimation");
            reviewsSliderInMovement = false;
        });
    }
};

/************************************ Cambio de card en primer slider ***************************************/

const selectSliderElement = (indexToSliderElement: number) => {
    const sliderElements = document.querySelectorAll(".landingPage_home_seccion2_slider_imgAndText_cont") as NodeListOf<HTMLDivElement>;
    const landingPage_opacity1 = document.querySelector(".landingPage_home_seccion2_slider_cont")?.querySelector(".landingPage_opacity1") as HTMLDivElement;        //Selecciona el elemento activo
    landingPage_opacity1.classList.remove("fadeInBottomAnimation");
    landingPage_opacity1.classList.add("opacityOffAnimation");                                                                                                      //Le grega animacion para desvanecerse

    const animation = landingPage_opacity1.getAnimations()[0];
    animation.onfinish = () => {                                                                                                                                    //Cuanto termina de desvanecerse se avtiva la animacion del elemento entrante
        animation.cancel();
        landingPage_opacity1.classList.remove("opacityOffAnimation");
        landingPage_opacity1.classList.remove("landingPage_opacity1");
        const newElement = Array.from(sliderElements)[indexToSliderElement];
        newElement.classList.add("fadeInBottomAnimation");
        newElement.classList.add("landingPage_opacity1");
    };
};

/************************************ Logica segundo slider ***************************************/

let sliderInMovement = false;

const slider2handleMove = (direction: "left" | "right", slider: "slider2" | "slider3") => {
    if (sliderInMovement) return;
    sliderInMovement = true;
    const sliderCont = slider === "slider2" ? 
        document.querySelector(".landingPage_home_jewelrySlider2_slider_internalCont") as HTMLDivElement :
        document.querySelector(".landingPage_home_jewelrySlider3_slider_internalCont") as HTMLDivElement;
    const distanceToMove = sliderCont.querySelector("img")?.offsetWidth;
    document.documentElement.style.setProperty("--slider2translateDistance", `${distanceToMove}px`);

    if (direction === "left") {
        sliderCont.classList.add("landingPage_home_jewelrySlider2_toLeftAnimation");
        const animation = sliderCont.getAnimations()[0];
        animation.addEventListener("finish", () => {
            sliderCont.classList.remove("landingPage_home_jewelrySlider2_toLeftAnimation");
            const firstChild = sliderCont.firstChild;
            if (!firstChild) return;
            sliderCont.appendChild(firstChild);
            sliderInMovement = false;
        });
    } else {
        sliderCont.classList.add("landingPage_home_jewelrySlider2_toRightAnimation");
        const animation = sliderCont.getAnimations()[0];
        const lastChild = sliderCont.lastChild;
        if (!lastChild) return;
        sliderCont.prepend(lastChild);
        animation.addEventListener("finish", () => {
            sliderCont.classList.remove("landingPage_home_jewelrySlider2_toRightAnimation");
            sliderInMovement = false;
        });
    }
};

const Landing = () => {

    const {showSpinner} = useContext(SpinnerContext);
    const [reviewsJSX, setReviewsJSX] = useState <JSX.Element[] | null> (null);
    const [newsJSX, setNewsJSX] = useState <JSX.Element[] | null> (null);
        
    useEffect(() => {

        /************************************ Se obtienen las novedades de la base de datos ***************************************/

        (async() => {
            showSpinner(true);

            const newsConditions: {"field": keyof Novedad, value: string | number}[] = [{field: "habilitada", value: "1"}];
            const newsFields: (keyof Novedad)[] = ["id_producto", "id"];
            const response0 = await getTable({tableName: "novedad", conditions: newsConditions, fields: newsFields});
            if (response0.success && response0.data && response0.data.length) {
                const newsProductsDataFromDB: Pick<Novedad, "id_producto" | "id">[] = response0.data;
                const newsProductsIDsArr: number[] = newsProductsDataFromDB.map((productData) => productData.id_producto);
                      
                const productsFieldsArr: (keyof Producto)[] = ["foto1", "id"];
                const response2 = await getProductsByIDs({iDsArr: newsProductsIDsArr, fieldsArr: productsFieldsArr});
                
                if (!response2.success || !response2.data) {
                    swalPopUp ("Error", `No se pudieron obtener las novedades de la base de datos: ${response0.message}`, "error");
                    showSpinner(false);
                    showElement(true);
                    return;
                } else if (!response2.data.length) {
                    swalPopUp ("Ops!", "No se encontraron novedades", "info");
                    showSpinner(false);
                    showElement(true);
                    return;
                }   

                const newsProductsData: Pick<Producto, "foto1" | "id">[] = response2.data;
                const newsProductsDataWithNewID = newsProductsData.map((product) => ({
                    ...product, 
                    id_novedad: newsProductsDataFromDB.find((productData) => productData.id_producto === product.id)?.id || 0
                }));
                         
                setNewsJSX(
                    newsProductsDataWithNewID.sort((a, b) => b.id_novedad - a.id_novedad).map((product, index) => <img src={product.foto1} alt="Slider item" key={index}/>)
                );
            }    

            /************************************ Se obtienen las reviews de la base de datos ***************************************/

            const conditions: {field: keyof Reviews, value: string | number}[] = [{field: "show", value: "1"}];
            const fields: (keyof Reviews)[] = ["added", "text", "rating", "author_name", "id", "time"];
            
            const response = await getTable({tableName: "reviews", conditions, fields});
            if (!response.success || !response.data || !response.data.length) {
                showSpinner(false);
                showElement(true);
                swalPopUp("Error", `No se pudieron obtener las reseñas: ${response.message}`, "error");
                return;
            }
            const reviewsData: (Pick<Reviews, "added" | "text" | "rating" | "author_name" | "id" | "time">)[] = response.data;   
            reviewsData.sort((a, b) => b.time - a.time);
            setReviewsJSX(reviewsData.map((review, index) => 
                <div className="landingPage_home_reviews_slider_item flex column" key={index}>
                    <img src="/images/icons/quote.png" className="landingPage_home_reviews_quote" alt="Quote" />
                    <p className="landingPage_home_reviews_slider_item_text flex">{review.text}</p>
                    <p className="landingPage_home_reviews_slider_item_name flex">{review.author_name}</p>
                </div>
            ));
        })();
        
        /************************************ Logica primer slider ***************************************/

        const toBold = (e: MouseEvent) => {                                                                     //Lógica para poner en negrita el texto seleccionado
            const target = e.target as HTMLDivElement;
            const targetID = target.id;
            selectSliderElement(parseInt(targetID));

            const seccions2Texts = document.querySelectorAll(".landingPage_home_seccion2_text") as NodeListOf<HTMLParagraphElement>;
            seccions2Texts.forEach((element) => {
                element.classList.remove("landingPage_home_text_stroke");
            });
            const seccions2ArrowIcons = document.querySelectorAll(".landingPage_home_seccion2_icon") as NodeListOf<HTMLImageElement>;
            seccions2ArrowIcons.forEach((element) => {
                element.classList.remove("landingPage_opacity1");
            });

            const text = target.querySelector("p") as HTMLParagraphElement;
            text.classList.add("landingPage_home_text_stroke");
            const img = target.querySelector("img") as HTMLImageElement;
            img.classList.add("landingPage_opacity1");
        };

        const seccion2LineTextConts = document.querySelectorAll(".landingPage_home_seccion2_text_line_cont") as NodeListOf<HTMLDivElement>;
        seccion2LineTextConts.forEach((element) => {
            element.addEventListener("click", toBold);
        });

        /********************* Control de color del navbar (landing) segun scroll  ***********************/

        const setMenuScrollColor = () => {
            const menu = document.querySelector(".landingNavBar_contMenu") as HTMLDivElement;
            if (window.scrollY > 0) {
                menu.classList.remove("navbar_bgGray");
                menu.classList.add("navbar_bgWhite");
            } else {
                menu.classList.add("navbar_bgGray");
                menu.classList.remove("navbar_bgWhite");
            }
        };
        setMenuScrollColor();

        window.addEventListener("scroll", setMenuScrollColor);

        /************************************ Efecto parallax home ***************************************/

        const setParallaxEffect = () => {
            const scrollPosition = window.scrollY;
            document.documentElement.style.setProperty("--scroll-position", `${scrollPosition}px`);                             //Actualiza la variable CSS --scroll-position con el valor de scroll
        };

        window.addEventListener("scroll", setParallaxEffect);

        /*************************************************************************************************/

        return () => {
            window.removeEventListener("scroll", setMenuScrollColor);
            window.removeEventListener("scroll", setParallaxEffect);
        };  
        
    }, []);

    useEffect(() => {
        if(!reviewsJSX || !newsJSX) return;

        (async() => {
            await waitAllImagesCharged();
            showElement(true);
            showSpinner(false);
        })();
   
        const sliderCont =  document.querySelector(".landingPage_home_reviews_slider_internal_cont") as HTMLDivElement;         //Asigna un valor inicial de altura al contenedor del slider para que al setear por primera vez su altura con javascript este cambie de altura con transicion
        const reviewsSliderAndControlsCont = document.querySelector(".landingPage_home_reviews_sliderAndControls_cont") as HTMLDivElement;
        reviewsSliderAndControlsCont.style.height = (sliderCont.childNodes[0] as HTMLDivElement).offsetHeight + "px";
    }, [reviewsJSX, newsJSX]);    
    
    return (
        <div className="pagesContainer landingPage_home_container elementToShow">
            {/*Encabezado*/}
            <div className="landingPage_home_seccion_cont flex column">
                <h1 className="landingPage_home_title">Joyas</h1>
                <h2 className="landingPage_home_subTitle1">POR MAYOR</h2>
                <p className="landingPage_home_subTitle2">Sitio web exclusivo</p>
                <p className="landingPage_home_subTitle3">para joyeros y joyerías</p>
                <div className="landingPage_home_header_buttons_cont flex">
                    <Link to="/registro">
                        <button className="landingPage_button1 landingPage_button1_account">CREAR CUENTA GRATUITA</button>
                    </Link>
                    <div className="landingPage_button1_beneficts_cont">
                        <HashLink to="/landing#beneficts" scroll={(e) => scrollWithoffset(e)}>
                            <button className="landingPage_button1 landingPage_button1_beneficts">CONOCÉ NUESTROS BENEFICIOS</button>
                        </HashLink>
                        <p  className="landingPage_button1_beneficts_text">Paño para joyeros gratis con tu primera compra</p>
                    </div>
                </div>
            </div>
            {/*Primer Slider*/}
            <div className="landingPage_home_seccion_cont landingPage_home_seccion2_cont flex">
                <div className="landingPage_home_seccion2_div flex column">
                    <div className="landingPage_home_seccion2_text_cont flex column">
                        <div className="landingPage_home_seccion2_text_line_cont flex" id="0">
                            <img src="/images/icons/toLeft.png" className="landingPage_home_seccion2_icon landingPage_home_icon_opacity1" alt="Arrow" />
                            <p className="landingPage_home_seccion2_text landingPage_home_text_stroke">Precios exclusivos por mayor</p>
                        </div>
                        <div className="landingPage_home_seccion2_text_line_cont flex" id="1">
                            <img src="/images/icons/toLeft.png" className="landingPage_home_seccion2_icon" alt="Arrow" />
                            <p className="landingPage_home_seccion2_text">Pedidos online</p>
                        </div>
                        <div className="landingPage_home_seccion2_text_line_cont flex" id="2">
                            <img src="/images/icons/toLeft.png" className="landingPage_home_seccion2_icon" alt="Arrow" />
                            <p className="landingPage_home_seccion2_text">Desde cualquier dispositivo</p>
                        </div>
                        <div className="landingPage_home_seccion2_text_line_cont flex" id="3">
                            <img src="/images/icons/toLeft.png" className="landingPage_home_seccion2_icon" alt="Arrow" />
                            <p className="landingPage_home_seccion2_text">Envíos a toda Argentina</p>
                        </div>
                        <div className="landingPage_home_seccion2_text_line_cont flex" id="4">
                            <img src="/images/icons/toLeft.png" className="landingPage_home_seccion2_icon" alt="Arrow" />
                            <p className="landingPage_home_seccion2_text">Atención personalizada</p>
                        </div>
                    </div>
                </div>
                <div className="landingPage_home_seccion2_div landingPage_home_seccion2_slider_cont flex column">
                    <p className="landingPage_home_seccion2_div_ADJ_text">A D J</p>
                    <div className="landingPage_home_seccion2_slider_imgAndText_cont landingPage_opacity1 flex column" id="0">
                        <img src="/images/landing/slider1.png" className="landingPage_home_seccion2_slider_img" alt="Slider element" />
                        <Link className="landingPage_home_seccion2_slider_text_cont flex column" to="/registro">
                            <p className="landingPage_home_seccion2_slider_text_title">Miles de productos</p>
                            <p className="landingPage_home_seccion2_slider_text_subTitle">Con precios mayoristas y en pesos pensados</p>
                            <p className="landingPage_home_seccion2_slider_text_subTitle">para que <b>obtenga la mejor rentabilidad</b></p>
                        </Link>
                        <Link to="/registro">
                            <button className="contact_sendButton landingPage_home_seccion2_slider_button flex">UNIRSE</button>
                        </Link>
                    </div>
                    <div className="landingPage_home_seccion2_slider_imgAndText_cont flex column" id="1">
                        <img src="/images/landing/slider2.png" className="landingPage_home_seccion2_slider_img" alt="Slider element" />
                        <Link className="landingPage_home_seccion2_slider_text_cont flex column" to="/registro">
                            <p className="landingPage_home_seccion2_slider_text_title">Fácil y Rápido</p>
                            <p className="landingPage_home_seccion2_slider_text_subTitle">Muy fácil de usar.</p>
                            <p className="landingPage_home_seccion2_slider_text_subTitle">Podrás realizar un pedido <b>en sólo dos pasos.</b></p>
                        </Link>
                        <Link to="/registro">
                            <button className="contact_sendButton landingPage_home_seccion2_slider_button flex">UNIRSE</button>
                        </Link>
                    </div>
                    <div className="landingPage_home_seccion2_slider_imgAndText_cont flex column" id="2">
                        <img src="/images/landing/slider3.png" className="landingPage_home_seccion2_slider_img" alt="Slider element" />
                        <Link className="landingPage_home_seccion2_slider_text_cont flex column" to="/registro">
                            <p className="landingPage_home_seccion2_slider_text_title">En cualquier lugar</p>
                            <p className="landingPage_home_seccion2_slider_text_subTitle">Cómodo y práctico, accede desde tu celular, tablet o PC</p>
                        </Link>
                        <Link to="/registro">
                            <button className="contact_sendButton landingPage_home_seccion2_slider_button flex">REGISTRO GRATUITO</button>
                        </Link>
                    </div>
                    <div className="landingPage_home_seccion2_slider_imgAndText_cont flex column" id="3">
                        <img src="/images/landing/slider4.png" className="landingPage_home_seccion2_slider_img" alt="Slider element" />
                        <Link className="landingPage_home_seccion2_slider_text_cont flex column" to="/registro">
                            <p className="landingPage_home_seccion2_slider_text_title">Llegamos a toda Argentina</p>
                            <p className="landingPage_home_seccion2_slider_text_subTitle">Hacemos envíos de nuestros productos a todo Argentina.</p>
                        </Link>
                        <Link to="/registro">
                            <button className="contact_sendButton landingPage_home_seccion2_slider_button flex">REGISTRO GRATUITO</button>
                        </Link>
                    </div>
                    <div className="landingPage_home_seccion2_slider_imgAndText_cont flex column" id="4">
                        <img src="/images/landing/slider5.png" className="landingPage_home_seccion2_slider_img" alt="Slider element" />
                        <Link className="landingPage_home_seccion2_slider_text_cont flex column" to="/registro">
                            <p className="landingPage_home_seccion2_slider_text_title">Usted es importante</p>
                            <p className="landingPage_home_seccion2_slider_text_subTitle">Atención personalizada para cada uno de nuestros</p>
                            <p className="landingPage_home_seccion2_slider_text_subTitle">cientes. Garantía de satisfacción.</p>
                        </Link>
                        <Link to="/registro">
                            <button className="contact_sendButton landingPage_home_seccion2_slider_button flex">UNIRTE GRATIS</button>
                        </Link>
                    </div>
                </div>
            </div>
            {/*Segundo Slider*/}
            <div className="landingPage_home_jewelrySlider2_cont flex">
                <div className="landingPage_home_jewelrySlider2_controlDiv flex">
                    <div className="landingPage_home_jewelrySlider2_controlDiv_internal_cont flex column">
                        <Link className="landingPage_home_jewelrySlider2_title" to="/registro">Material & elementos <br /> para nuestros clientes</Link>
                        <p className="landingPage_home_jewelrySlider2_subTitle">De forma gratuita entregamos material promocional para la ayuda comercial de nuestros clientes, entre los cuales se destacan displays, folletos y paños de primera línea.</p>
                        <Link to="/registro">
                            <button className="customButton1 landingPage_home_jewelrySlider2_button button_transition_to_blue">COMENZÁ A VENDER</button>
                        </Link>
                        <div className="landingPage_home_jewelrySlider2_controls_cont flex">
                            <img src="/images/icons/toLeft_white.png" className="landingPage_home_jewelrySlider2_control" alt="Slider left" onClick={() => slider2handleMove("right", "slider2")}/>
                            <img src="/images/icons/toLeft_white.png" className="landingPage_home_jewelrySlider2_control" alt="Slider right" onClick={() => slider2handleMove("left", "slider2")} />
                        </div>
                    </div>
                </div>
                <div className="landingPage_home_jewelrySlider2_controls_cont_PORTRAIT flex">
                    <img src="/images/icons/toLeft_white.png" className="landingPage_home_jewelrySlider2_control" alt="Slider left" onClick={() => slider2handleMove("right", "slider2")} />
                    <img src="/images/icons/toLeft_white.png" className="landingPage_home_jewelrySlider2_control" alt="Slider right" onClick={() => slider2handleMove("left", "slider2")} />
                </div>
                <div className="landingPage_home_jewelrySlider2_slider_cont">
                    <div className="landingPage_home_jewelrySlider2_slider_internalCont flex">
                        <img src="/images/landing/slider2/1.jpg" alt="Slider item" />
                        <img src="/images/landing/slider2/2.jpg" alt="Slider item" />
                        <img src="/images/landing/slider2/3.jpg" alt="Slider item" />
                        <img src="/images/landing/slider2/4.jpg" alt="Slider item" />
                        <img src="/images/landing/slider2/5.jpg" alt="Slider item" />
                        <img src="/images/landing/slider2/6.jpg" alt="Slider item" />
                    </div>
                </div>
            </div>
            <Beneficts/>       
            {/*tercer slider*/}
            <div className="landingPage_home_jewelrySlider2_cont flex">
                <div className="landingPage_home_jewelrySlider2_slider_cont">
                    <div className="landingPage_home_jewelrySlider3_slider_internalCont flex">
                        {newsJSX}
                    </div>
                    <div className="landingPage_home_jewelrySlider2_controls_cont_PORTRAIT flex">
                        <img src="/images/icons/toLeft_white.png" className="landingPage_home_jewelrySlider2_control" alt="Slider left" onClick={() => slider2handleMove("right", "slider3")} />
                        <img src="/images/icons/toLeft_white.png" className="landingPage_home_jewelrySlider2_control" alt="Slider right" onClick={() => slider2handleMove("left", "slider3")} />
                    </div>
                </div>
                <div className="landingPage_home_jewelrySlider2_controlDiv flex">
                    <div className="landingPage_home_jewelrySlider2_controlDiv_internal_cont flex column">
                        <Link className="landingPage_home_jewelrySlider2_title" to="/landing/news">Nuevas & mejores <br /> piezas, todo el tiempo</Link>
                        <p className="landingPage_home_jewelrySlider2_subTitle">Periódicamente estamos sumando nuevas piezas de joyería en nuestra tienda, piezas clásicas y modernas adaptadas a las nuevas tendencias del mercado.</p>
                        <Link to="/landing/news">
                            <button className="customButton1 landingPage_home_jewelrySlider2_button button_transition_to_blue">VER LISTADO DE NOVEDADES</button>
                        </Link>
                        <div className="landingPage_home_jewelrySlider2_controls_cont flex">
                            <img src="/images/icons/toLeft_white.png" className="landingPage_home_jewelrySlider2_control" alt="Slider left" onClick={() => slider2handleMove("right", "slider3")}/>
                            <img src="/images/icons/toLeft_white.png" className="landingPage_home_jewelrySlider2_control" alt="Slider right" onClick={() => slider2handleMove("left", "slider3")} />
                        </div>
                    </div>
                </div>
            </div>
            {/*Reviews*/}
            <div className="landingPage_home_reviews_cont flex column">
                <div className="landingPage_home_reviews_sliderAndControls_cont flex">
                    <div className="landingPage_home_reviews_control_cont flex">
                        <img src="/images/icons/arrow.png" className="landingPage_home_reviews_control_img landingPage_home_reviews_control_img_left" alt="Left" onClick={() => reviewsSliderhandleMove("right")}/>
                    </div>
                    <div className="landingPage_home_reviews_slider_cont flex">
                        <div className="landingPage_home_reviews_slider_internal_cont flex">
                            {reviewsJSX}
                        </div>
                    </div>
                    <div className="landingPage_home_reviews_control_cont flex">
                        <img src="/images/icons/arrow.png" className="landingPage_home_reviews_control_img" alt="Right" onClick={() => reviewsSliderhandleMove("left")}/>
                    </div>
                </div>
                <Link to="/landing/reviews">
                    <button className="customButton1 landingPage_home_jewelrySlider2_button landingPage_home_jewelrySlider2_reviewsButton button_transition_to_blue">VER TESTIMONIOS</button>
                </Link>
            </div>
            <FinalBanner/>               
            {/*Whatsapp flotante*/}
            <FloatingWhatsapp/>
        </div>
    );
};

export default Landing;
