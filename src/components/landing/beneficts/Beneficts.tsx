import { Link } from "react-router-dom";
import "./beneficts.css";

const Beneficts = () => {
    return (
        <Link className="landingPage_home_beneficts_cont flex" id="beneficts" to="/registro">
            <img src="/images/landing/pano.jpg" className="landingPage_home_beneficts_img" />
            <img src="/images/landing/beneficios.jpg" className="landingPage_home_beneficts_img landingPage_home_beneficts_img2" />
        </Link>
    );
};

export default Beneficts;
