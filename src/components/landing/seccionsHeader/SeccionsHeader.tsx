import { Link } from "react-router-dom";
import "./seccionsHeader.css";

const SeccionsHeader = (props: {title: string, pathName: string}) => {
    const {title, pathName} = props;

    return (
        <div className="landingPageNews_header_cont">
            <img src="/images/landing/news_header.jpg" className="landingPageNews_header_bgImg" alt="Header" />
            <div className="landingPageNews_header_text_cont flex column">
                <p><Link to="/landing">Inicio</Link> / {pathName}</p>
                <h1 className="landingPageNews_header_title flex">{title}</h1>
            </div>
        </div>
    );
};

export default SeccionsHeader;
