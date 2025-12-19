import CartLandscape from "../../components/cart/cart_landsCape/Cart";
import CartPortrait from "../../components/cart/cart_portrait/Cart";
import { useState, useEffect } from "react";

const Cart = () => {

    const [cart, setCart] = useState <JSX.Element | null> (null);

    const showProductDetail = () => {
        (window.innerWidth > window.innerHeight) && window.innerWidth > 1200 ?
            setCart(<CartLandscape/>)
            :
            setCart(<CartPortrait/>);
    };

    useEffect(() => {
        showProductDetail();
        window.addEventListener("resize", showProductDetail);
        window.addEventListener("orientationchange", showProductDetail);
        return () => {
            window.removeEventListener("resize", showProductDetail);
            window.removeEventListener("orientationchange", showProductDetail);
        };
    }, []);
        
    return (
        cart
    );
};

export default Cart;
