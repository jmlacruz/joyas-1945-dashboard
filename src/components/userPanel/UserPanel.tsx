import "./userPanel.css";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import React, { useEffect, useState } from "react";
import CartDropDown from "../cart/cartDropDown/CartDropDown";
import UserOptions from "../userOptions/UserOptions";
import { Link } from "react-router-dom";

function UserPanel (props: {isMenuHidden: boolean}) {

    const {registered, name, } = useSelector((state: RootState) => state.user.value);
    const cart = useSelector((state: RootState) => state.cart.value);
    const carTotalQuantity = cart.cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const [showDropDown, setShowDropDown] = useState(false);
    const [showUserOptions, setShowUserOptions] = useState(false);

    const handleCartDropDown = (e: React.MouseEvent) => {
        if (!cart.cartItems.length) return;
        e.stopPropagation();                                                                            //Para que no se active el listener del body que cierra el dropdown
        setShowDropDown((currentState) => !currentState);
    };

    const handleUserOptions = (e: React.MouseEvent) => {                                                //Mostramos y ocultamos las opciones de usuario (Logout, Configuracion)
        e.stopPropagation();
        setShowUserOptions((currentState) => !currentState);
    };

    useEffect(() => {
        
        document.body.addEventListener("click", () => setShowDropDown(false));
        document.body.addEventListener("click", () => setShowUserOptions(false));
        return () => {                                                                                  //Eliminamos listeners al salir de la web
            document.body.removeEventListener("click", () => setShowDropDown(false));
            document.body.removeEventListener("click", () => setShowUserOptions(false));
        };

    }, []);    
           
    return (
        registered ?
            <div className="userNavbarOptions_Cont flex">
                {
                    props.isMenuHidden 
                    && 
                    <p className="userNavbarOptions_nameCont">Hola <span className="userNavbarOptions_name">{name}!</span></p>
                }
                <div className="userNavbarOptions_cartIconCont flex" onClick={(e) => handleCartDropDown(e)}>
                    <img src="/images/icons/cart.png" alt="Carito" className="userNavbarOptions_cartIcon iconHoverBlackToPinkTransition" />
                    <div className="userNavbarOptions_cartCount flex">{carTotalQuantity}</div>
                    {showDropDown && <CartDropDown />}
                </div>
                {
                    props.isMenuHidden && 
                    <div className="userNavbarOptions_userIconCont" onClick={(e) => handleUserOptions(e)}>
                        <img src="/images/icons/user2.png" alt="Usuario" className="userNavbarOptions_userIcon iconHoverBlackToPinkTransition" />
                        {showUserOptions && <UserOptions />}
                    </div>
                }
            </div>
            
            :

            <Link to="/registro">
                <button className="navbarRegisterCont customButton1 flex">Registrarse</button>
            </Link>
    );
}

export default UserPanel;