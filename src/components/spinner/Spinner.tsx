// https://www.npmjs.com/package/react-spinners
// https://www.davidhu.io/react-spinners/

import PuffLoader from "react-spinners/PuffLoader";
import FadeLoader from "react-spinners/FadeLoader";
import "./spinner.css";

export const Spinner = () => {
    return (
        <div className="contSpinners dflex">
            <PuffLoader color="rgb(59, 130, 246)" size={100} className="pr"/>
        </div>
    );
};

export const ImageSpinner = () => {
    return (
        <div className="imageSpinner dflex">
            <FadeLoader color="rgb(59, 130, 246)"/>
        </div>
    );
};

