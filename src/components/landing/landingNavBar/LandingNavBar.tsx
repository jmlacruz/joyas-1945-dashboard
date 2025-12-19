import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./landingNavBar.css";

const LandingNavBar = () => {
   
    const [isMenuHidden, setIsMenuHidden] = useState (false);
    const thisLocation = useLocation();
        
    useEffect(() => {   
            
        /******************************** NavBar dinamic colorizer per route **************************/

        const navBarNamesRef = [
            ["/home", "inicio"], ["/como", "cómo funciona"], ["/faqs", "faqs"], ["/blog", "blog"], ["/contact", "contactenos"]  //Posicion 0: texto que tiene que tener la ruta, posicion 1: texto que tiene que tener la opcion del navbar
        ];    

        const actualOptionsArray = navBarNamesRef.find((el) => thisLocation.pathname.includes(el[0]));
        const navBarOptions = document.querySelectorAll(".opcion");
        for (const option of navBarOptions) {
            option.classList.remove("navBarOptionColorOn");
        }
        if (actualOptionsArray) {
            for (const option of navBarOptions) {
                if (option.innerHTML.toString().toLowerCase().includes(actualOptionsArray[1])) {
                    option.classList.add("navBarOptionColorOn");
                }
            }
        } else {                                                                                                                   //Si no hay coincidencias estamos en home
            navBarOptions[0].classList.add("navBarOptionColorOn");
        }        
        
        /*************************** Se hace scroll top al cambiar de ruta ************************/

        window.scrollTo({top: 0, behavior: "smooth"});
        
    }, [thisLocation.pathname]);
    

    /***********************************************************************************************/
            
    useEffect(() => {

        const iconoMenu = document.querySelector(".iconoMenu");
        iconoMenu?.setAttribute("name", "iconoMenu");
        const menu = document.querySelector(".menu") as HTMLDivElement;
        menu?.setAttribute("name", "menu");
        const opciones = document.getElementsByClassName("opcion");
        const contMenu = document.querySelector(".contMenu") as HTMLDivElement;
        const navBarNetWorkIcons = document.querySelectorAll(".navBarNetWorkIcons") as NodeListOf<HTMLImageElement>;
        const menuOptionsCont = document.querySelector(".menuOptionsCont") as HTMLDivElement;
        const opcionMenuCont = document.querySelector(".opcionMenuCont") as HTMLDivElement;
        const menuCloseIcon = document.querySelector(".menuCloseIcon") as HTMLImageElement;
        let initialWidth = window.innerWidth;
        let REM: number;
        let breakPoint = 0;
        let menuBajo = false;
        let flagEnterMenuToggle = true;

        const handleMenu = () => {
            if (flagEnterMenuToggle) {
                flagEnterMenuToggle = false;
                if (!menuBajo) {
                    menu?.classList.remove("menuSube", "menuBaja");
                    menu?.classList.add("menuBaja");
                    menu?.addEventListener("click", handleMenu);
                    window.addEventListener("click", handleMenu);
                    menuOptionsCont.style.flexDirection = "column";
                    menuBajo = !menuBajo;    
                    const animations = menu?.getAnimations() as Animation[];
                    animations[0].addEventListener("finish", () => {
                        flagEnterMenuToggle = true;
                    });
                } else {
                    menu?.classList.remove("menuBaja", "menuSube");
                    menu?.classList.add("menuSube");
                    menu?.removeEventListener("click", handleMenu);
                    window.removeEventListener("click", handleMenu);
                    menuOptionsCont.style.flexDirection = "column";
                    menuBajo = !menuBajo;  
                    const animations = menu?.getAnimations() as Animation[];
                    animations[0].addEventListener("finish", () => {
                        flagEnterMenuToggle = true;
                    });
                }
            }
        };

        iconoMenu?.addEventListener("click", handleMenu);
        menuCloseIcon?.addEventListener("click", handleMenu);
          
        const calcularREM = () => {
            if (window.innerWidth >= window.innerHeight) REM = 0.01 * window.innerHeight + 10;
            if (window.innerWidth < window.innerHeight) REM = 0.01 * window.innerWidth + 10;
            breakPoint = 55 * REM;
        };
         
        calcularREM();
        if(window.innerWidth < breakPoint) {                                                    //Cargamos página con un ancho menor a BreakPoint
            contMenu.classList.add("contMenu_menuHidden");                
            navBarNetWorkIcons.forEach((icon) => icon.style.display = "none");                  //Ocultamos iconos de redes
            menuOptionsCont.style.flexDirection = "column";
            menuOptionsCont.style.height = "fit-content";
            opcionMenuCont.style.display = "initial";
            menu.classList.add("iconoMenuON", "menuOFF");
            iconoMenu?.classList.add("iconoMenuON");
            for (const opcion of opciones) {
                opcion.classList.add("opcion2");
            }
            setIsMenuHidden(true);
        }
        
        const check = () => {
            calcularREM();           
            if(initialWidth <= breakPoint && window.innerWidth > breakPoint) {                  //Pasamos de un ancho de pantalla menor a breakPoint a uno mayor
                menu.classList.remove("menuSube", "menuBaja", "menuOFF");
                contMenu.classList.remove("contMenu_menuHidden");
                navBarNetWorkIcons.forEach((icon) => icon.style.display = "initial");
                menuOptionsCont.style.flexDirection = "row";
                menuOptionsCont.style.height = "100%";
                opcionMenuCont.style.display = "none";
                iconoMenu?.classList.remove("iconoMenuON");
                for (const opcion of opciones) {
                    opcion.classList.remove("opcion2");
                }
                menuBajo = false;
                initialWidth = window.innerWidth;
                setIsMenuHidden(false);
            }     
            if(initialWidth > breakPoint && window.innerWidth < breakPoint) {                      //Pasamos de un ancho de pantalla mayor a breakPoint a uno menor
                menu.classList.add("menuOFF");
                contMenu.classList.add("contMenu_menuHidden");           
                navBarNetWorkIcons.forEach((icon) => icon.style.display = "none");                 //Ocultamos iconos de redes
                menuOptionsCont.style.flexDirection = "column";
                menuOptionsCont.style.height = "fit-content";
                opcionMenuCont.style.display = "flex";
                iconoMenu?.classList.add("iconoMenuON");
                for (const opcion of opciones) {
                    opcion.classList.add("opcion2");
                }
                initialWidth = window.innerWidth;
                setIsMenuHidden(true);
            }     
        };        

        window.addEventListener("resize", () => check());                                          //Manejo de clases al hacer resize o cambio de orientacion
        check();

        // window.addEventListener("click", (e) => {                                               //Cerramos en menu desplegado al hacer click en cualquier lado menos en el icono de menu
        //     const sameElement = e.target as HTMLElement;
        //     if (sameElement.getAttribute("name") !== "iconoMenu" && menuBajo === true) {
        //         menu?.classList.remove("menuBaja", "menuSube");
        //         menuBajo = false;
        //     }
        // });
                
        // eslint-disable-next-line
    }, [isMenuHidden]);    
        
    return (
        <div className="contMenu landingNavBar_contMenu flex opacityOnCharge">
            {   
                isMenuHidden &&
                <Link to="/landing" className="navBarContLogo navBarContLogo_left landingNavBar_navBarContLogo flex">
                    <img src="/images/logos/logo_black.png" alt="Logo Joyas 1945" className="navBarLogo" />
                </Link>
            }
            <img className="iconoMenu iconHoverBlackToPinkTransition" src="/images/icons/menu.png" alt="Icono Menu"/>
            <div className="tapaMenu"></div>
            <div className="menu flex">
                <div className="menuOptionsCont flex">
                    <div className="opcion opcionMenuCont flex">
                        <p className="opcionMenuText">Menu</p>
                        <img src="/images/icons/close.png" alt="Menu Close" className="menuCloseIcon iconHoverWhiteToPinkTransition" />
                    </div>
                    <Link className="opcion opcionHoverBlueTransition landingNavBar_opcion flex" to="/landing">Inicio</Link>
                    <Link className="opcion opcionHoverBlueTransition landingNavBar_opcion flex" to="/landing/faqs">FAQS</Link>
                    <Link className="opcion opcionHoverBlueTransition landingNavBar_opcion flex" to="/landing/blog">Blog</Link>
                    <Link className="opcion opcionHoverBlueTransition landingNavBar_opcion flex" to="/landing/contact">Contacto</Link>
                    {
                        isMenuHidden && 
                        <>
                            <Link className="opcion opcionHoverBlueTransition landingNavBar_opcion flex" to="/registro">UNIRSE GRATIS</Link>
                            <Link className="opcion opcionHoverBlueTransition landingNavBar_opcion flex" to="/home">ACCESO CLIENTES</Link>
                        </>
                    }
                    <img src="/images/icons/facebook_blue.png" alt="Facebook" className="navBarNetWorkIcons landingNavBar_navBarNetWorkIcons iconHoverBlackToPinkTransition" />
                    <img src="/images/icons/instagram_blue.png" alt="Instagram" className="navBarNetWorkIcons landingNavBar_navBarNetWorkIcons iconHoverBlackToPinkTransition"/>
                </div>
                <Link to="/landing" className="navBarContLogo landingNavBar_navBarContLogo flex">
                    <img src="/images/logos/logo_black.png" alt="Logo Joyas 1945" className="navBarLogo" />
                </Link>
                {   
                    !isMenuHidden &&
                    <div className="landingNavBar_buttonsCont flex">
                        <Link to="/registro">
                            <button className="navbarRegisterCont customButton1 button_transition_to_blue flex">UNIRSE GRATIS</button>
                        </Link>
                        <Link to="/home">
                            <button className="navbarRegisterCont customButton1 button_transition_to_blue flex">ACCESO CLIENTES</button> 
                        </Link>
                    </div>
                }
            </div>
        </div>
    );  
};   

export default LandingNavBar;
