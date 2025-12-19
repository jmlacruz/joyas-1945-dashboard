import { Link } from "react-router-dom";
import "./finalBanner.css";

const FinalBanner = (props: {className?: string}) => {
    const {className} = props;
    return (
        <div className="landingPage_home_finalBanner_main_cont flex">
            <div className={`landingPage_home_finalBanner_cont flex ${className || ""}`}>
                <div className="landingPage_home_finalBanner_text_cont flex column">
                    <p className="landingPage_home_finalBanner_subTitle">Tenemos la experiencia de hacer buenos negocios</p>
                    <p className="landingPage_home_finalBanner_title">Más de 50 años en el gremio</p>
                </div>
                <Link to="/contact">
                    <button className="customButton1 landingPage_home_finalBanner_button">¿ALGUNA CONSULTA?</button>
                </Link>
            </div>
        </div>
    );
};

export default FinalBanner;
