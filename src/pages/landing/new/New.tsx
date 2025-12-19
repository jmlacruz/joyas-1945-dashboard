import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./new.css";
import { useContext, useEffect, useState } from "react";
import { getTable } from "../../../services/database";
import { Novedad, Producto } from "../../../types/database";
import FinalBanner from "../../../components/landing/finalBanner/FinalBanner";
import FloatingWhatsapp from "../../../components/landing/floatingWhatsapp/FloatingWhatsapp";
import { SpinnerContext } from "../../../context/spinnerContext";
import { scrollWithoffset, showElement } from "../../../utils/utils";
import waitAllImagesCharged from "../../../utils/waitAllImagesCharged";
import { HashLink } from "react-router-hash-link";
import { swalPopUp } from "../../../utils/swal";

const New = () => {

    const {slug} = useParams();
    const navigate = useNavigate();
    const [newsProductData, setNewsProductData] = useState <(Pick<Novedad, "titulo" | "subtitulo" | "descripcion" | "id_producto"> & Pick<Producto, "foto1">) | null> (null);
    const { showSpinner } = useContext(SpinnerContext);
    const  {pathname} = useLocation();
    // const [inStock, setInstock] = useState(true);

    useEffect(() => {
        if (!slug) return (navigate("/landing"));
        (async () => {
            showSpinner(true);
            const conditions: {field: keyof Novedad, value: string}[] = [{field: "slug", value: slug}];
            const fields: (keyof Novedad)[] = ["titulo", "subtitulo", "descripcion", "id_producto"];
            const response = await getTable({tableName: "novedad", conditions, fields});
            if (!response.success || !response.data || !response.data.length) {
                showSpinner(false);
                swalPopUp("Ops!", "Producto no encontrado", "warning");
                return;
            }
            const newsData: Pick<Novedad, "titulo" | "subtitulo" | "descripcion" | "id_producto"> = response.data[0];

            const productConditions: {field: keyof Producto, value: number}[] = [{field: "id", value: newsData.id_producto}];
            const productFields: (keyof Producto)[] = ["foto1"];
            const response2 = await getTable({tableName: "producto", conditions: productConditions, fields: productFields});
            if (!response2.success || !response2.data || !response2.data.length) {
                showSpinner(false);
                swalPopUp("Ops!", "Producto no encontrado", "warning");
                return;
            }
            const productData: Pick<Producto, "foto1"> = response2.data[0];

            // setInstock(productData.stock && typeof productData.stock === "number" ? productData.stock > 0 : false);
            setNewsProductData({...newsData, ...productData});
        })();
    }, [slug]);    

    useEffect(() => {
        if (!newsProductData) return;
        (async () => {
            await waitAllImagesCharged();
            showElement(true);
            showSpinner(false);
        })();
    }, [newsProductData]);
    
    return (
        <div className="pagesContainer elementToShow">
            <div className="newPage_product_details_cont flex">
                <div className="newPage_product_img_cont">
                    <img src={newsProductData?.foto1} className="newPage_product_img" alt={newsProductData?.titulo} />
                </div>
                <div className="newPage_product_text_cont flex column">
                    {/* s */}
                    <h1 className="newPage_product_title">{newsProductData?.titulo}</h1>
                    {newsProductData?.subtitulo && <h2 className="newPage_product_subTitle">{newsProductData?.subtitulo}</h2>}
                    {newsProductData?.descripcion && <div dangerouslySetInnerHTML={{ __html: newsProductData?.descripcion || "" }} className="newPage_product_description_cont"></div>}
                    <p className="newPage_product_question_text">ALGUNA DUDA, CONSULTANOS</p>
                    <HashLink to={`${pathname}#form`} scroll={(e) => scrollWithoffset(e)}>
                        <button className="customButton1 newPageButtons">HACER CONSULTA</button>
                    </HashLink>
                </div>
            </div>
            <div className="landingPage_home_beneficts_cont landingPage_home_beneficts_cont_news flex" id="beneficts">
                <img src="/images/landing/pano.jpg" className="landingPage_home_beneficts_img" />
                <form className="newPage_beneficts_form_cont flex column" id="form">
                    <p>HACER CONSULTA</p>
                    <textarea name="message" placeholder="Mensaje*" required/>
                    <input type="text" placeholder="Nombre*" name="name" required />
                    <input type="email" placeholder="Correo electrónico*" name="email" required />
                    <button className="customButton1 newPageButtons newPage_beneficts_form_button">ENVIAR MENSAJE</button>
                </form>
            </div>
            <FinalBanner className="finalBannerClass"/>
            <FloatingWhatsapp/>
        </div>
    );
};

export default New;
