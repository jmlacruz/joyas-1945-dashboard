import { waitAllImagesChargedInElement } from "../../utils/waitAllImagesCharged";
import "./buyActivityPopUp.css";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const BuyActivityPopUp = (props: {userCity: string, itemDescription: string, itemImgSrc: string, userEmail: string, productID: number, closePopUp: () => void}) => {

    const popUpRef = useRef<HTMLAnchorElement | null>(null);
    
    useEffect(() => {
        (async () => {
            if (!popUpRef.current) return;

            await waitAllImagesChargedInElement(popUpRef.current);
            popUpRef.current.style.animationName = "buyActivityPopUpCont";
            const animation = popUpRef.current.getAnimations()[0];
            animation.onfinish = () => {
                props.closePopUp();
            };
        })();
    }, [props]);
    
    return (
        <Link className="buyActivityPopUpCont flex" ref={popUpRef} to={`/productDetail/${props.productID}`}>
            <img src={props.itemImgSrc} alt={props.itemDescription} className="buyActivityPopUpImg"/>
            <div className="buyActivityPopUpTextCont flex column">
                {   
                    !props.userCity || props.userCity === "undefined" ?                                                     //Si el campo ciudad no fue seteado por el cliente viene como string "undefined"
                        <p className="buyActivityPopUpTextBold">Un cliente acaba de elegir</p>
                        :
                        <>
                            <p className="buyActivityPopUpTextBold buyActivityPopUpTextCity">{`En ${props.userCity}`}</p>
                            <p className="buyActivityPopUpTextBold">Eligieron</p>
                        </>
                        
                }   
                <p>{(props.itemDescription).substring(0, 45)}...</p>
            </div>
        </Link>
    );
};

export default BuyActivityPopUp;
