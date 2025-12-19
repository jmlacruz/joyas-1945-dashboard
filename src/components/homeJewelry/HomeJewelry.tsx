import "./homeJewelry.css";
import { useEffect, useRef, useState } from "react";

function HomeJewelry() {

    const jewelryAnimationHalfTurnDuration = 200;                                                                                    //Tiene que ser la mitad del tiempo de las animaciones "homeJewelryImageTurnOn" y "homeJewelryImageTurnOff" en el css
    const [jewelryIamges, setJewelryIamges] = useState <JSX.Element[]> ([]);
    const jewelryImagesAnimationIntervalId = useRef <number | NodeJS.Timer> (0);
    const imagesQuantity = useRef({columns: 0, rows: 0}).current;                                                                    //Esta variable indica la cantidad de filas y columnas de imagenes de joyas

    /************************* Ajuste de imagenes de joyas al su contenedor general ***************************/

    const adjustJewelryImages = () => {
        const homeJewelryCont = document.querySelector(".homeJewelryCont") as HTMLDivElement;
        const homeJewelryCont_width = homeJewelryCont.offsetWidth;
        const homeJewelryCont_height = homeJewelryCont.offsetHeight;
        const homeJewelryImageConts = document.querySelectorAll(".homeJewelryImageCont") as NodeListOf<HTMLDivElement>;              //Las imágenes miden 120x120
        homeJewelryImageConts.forEach((imageCont) => {                                                                               //Si el ancho del contenedor es mayor al ancho de 6 imágenes      
            if ((homeJewelryCont_width / 120) >= 6) {                                                                                // (6 x 120px) cada imagen ocupa una sexta parte
                imagesQuantity.columns = 6;                                                                        
                imageCont.style.width = `${(homeJewelryCont_width / imagesQuantity.columns) - 1}px`;                                 //-1 sino en vez de 6 pone 5
            } else {            
                imagesQuantity.columns = Math.floor(homeJewelryCont_width / 120);
                imageCont.style.width = `${(homeJewelryCont_width / imagesQuantity.columns) - 1}px`;                                 // de lo contrario se colocan las imagenes que entren por su ancho de 120px     
            }

            if ((homeJewelryCont_height / 120) >= 3) {                                                                               //Misma lógica para el alto pero con 3 espacios
                imagesQuantity.rows = 3;
                imageCont.style.height = `${(homeJewelryCont_height / imagesQuantity.rows) - 1}px`;
            } else {
                imagesQuantity.rows = Math.floor(homeJewelryCont_height / 120);
                imageCont.style.height = `${(homeJewelryCont_height / imagesQuantity.rows) - 1}px`;
            }

        });
    };

    /************************** Animaciones automaticas de imagenes de joyas ****************************/

    const handleJewelryImageTargetAnimation = (imageTarget: HTMLImageElement) => {
        if (imageTarget.getAttribute("class")?.includes("homeJewelryImageTurnOn")) {
            imageTarget.classList.remove("homeJewelryImageTurnOn"),
            imageTarget.classList.add("homeJewelryImageTurnOff");
            const imageName = imageTarget.id;
            setTimeout(() => {
                imageTarget.src = `/images/pages/home/jewelry/${imageName}.jpg`;
            }, jewelryAnimationHalfTurnDuration);
        } else if (imageTarget.getAttribute("class")?.includes("homeJewelryImageTurnOff")) {
            imageTarget.classList.remove("homeJewelryImageTurnOff"),
            imageTarget.classList.add("homeJewelryImageTurnOn");
            const imageName = imageTarget.id;
            setTimeout(() => {
                imageTarget.src = `/images/pages/home/jewelry/${imageName}b.jpg`;
            }, jewelryAnimationHalfTurnDuration);
        } else {
            imageTarget.classList.add("homeJewelryImageTurnOn");
            const imageName = imageTarget.id;
            setTimeout(() => {
                imageTarget.src = `/images/pages/home/jewelry/${imageName}b.jpg`;
            }, jewelryAnimationHalfTurnDuration);
        }
    };

    const autoAnimateImages = () => {
        jewelryImagesAnimationIntervalId.current = setInterval(() => {
            const homeJewelryImageConts = document.querySelectorAll(".homeJewelryImageCont") as NodeListOf<HTMLDivElement>;
            const homeJewelryImageContArr = Array.from(homeJewelryImageConts);
            const quantityOfImages = imagesQuantity.rows * imagesQuantity.columns;
            const randomIndex1 = Math.floor(Math.random() * quantityOfImages);
            let randomIndex2 = Math.floor(Math.random() * quantityOfImages);
            if (randomIndex2 === randomIndex1) randomIndex2 ++;
            if (randomIndex2 > quantityOfImages - 1) randomIndex2 = 0;
            const imageContTarget1 = homeJewelryImageContArr[randomIndex1] as HTMLDivElement;
            const imageTarget1 = imageContTarget1.firstChild as HTMLImageElement;
            const imageContTarget2 = homeJewelryImageContArr[randomIndex2] as HTMLDivElement;
            const imageTarget2 = imageContTarget2.firstChild as HTMLImageElement;
            handleJewelryImageTargetAnimation(imageTarget1);
            handleJewelryImageTargetAnimation(imageTarget2);
        }, 5000);
    };
    
    useEffect(() => {

        /****************** Animaciones de imagenes de joyas al pasar el puntero por arriba ******************/

        let ti = 0;
        let timeOutId: NodeJS.Timeout;
        
        const jewelryHandleAnimation = (e: React.MouseEvent, over: boolean) => {

            const turnImage = () => {
                const imageContainer = e.target as HTMLDivElement;
                const image = imageContainer.firstChild as HTMLImageElement;
                if (image.getAttribute("class")?.includes("homeJewelryImageTurnOn"))  {
                    image.classList.remove("homeJewelryImageTurnOn");
                    image.classList.add("homeJewelryImageTurnOff");
                    const imageName = image.id;
                    setTimeout(() => {
                        image.src = `/images/pages/home/jewelry/${imageName}.jpg`;
                    }, jewelryAnimationHalfTurnDuration);
                } else if (image.getAttribute("class")?.includes("homeJewelryImageTurnOff")) {
                    image.classList.remove("homeJewelryImageTurnOff");
                    image.classList.add("homeJewelryImageTurnOn");
                    const imageName = image.id;
                    setTimeout(() => {
                        image.src = `/images/pages/home/jewelry/${imageName}b.jpg`;
                    }, jewelryAnimationHalfTurnDuration);
                } else {
                    image.classList.add("homeJewelryImageTurnOn");
                    const imageName = image.id;
                    setTimeout(() => {
                        image.src = `/images/pages/home/jewelry/${imageName}b.jpg`;
                    }, jewelryAnimationHalfTurnDuration);
                }
            };

            if (over) {                                                 //Lógica que impide que las animaciones se inicien si el puntero permanece menos de 100ms sobre las cards
                ti = Date.now();                                        // para evitar que al mover el puntero muy rapido sobre las cards estas no giren todas juntas
                timeOutId = setTimeout(() => {
                    turnImage();
                }, 100);
            } else {
                clearTimeout(timeOutId);
                const elapsedTime = Date.now() - ti;
                if (elapsedTime < 100) {
                    return;
                } else {
                    turnImage();
                }
            }
        };

        /********************************* Seteo de array JSX de imagenes ***********************************/

        const jewelryJSXArr = []; 
        for (let i = 1; i <= 18; i ++) {                                                                                             //Seteamos imagenes de joyas (hay 18 en la carpeta de imagenes de joyas)           
            jewelryJSXArr.push(
                <div className="homeJewelryImageCont flex" key={i.toString()} onMouseOver={(e) => jewelryHandleAnimation(e, true)} onMouseLeave={(e) => jewelryHandleAnimation(e, false)}>
                    <img src={`/images/pages/home/jewelry/${i}.jpg`} alt="Jewelry" className="homeJewelryImage" id={i.toString()}/>
                </div>
            );
        }
        setJewelryIamges(jewelryJSXArr);
      
        /********************* Ajuste de imagenes de joyas al su contenedor general **********************/
                
        window.addEventListener("resize", adjustJewelryImages);   
        window.addEventListener("orientationchange", adjustJewelryImages);   
        return () => {
            window.removeEventListener("resize", adjustJewelryImages);
            window.removeEventListener("orientationchange", adjustJewelryImages);
            clearInterval(jewelryImagesAnimationIntervalId.current);
        };   
                                    
    }, []);

    useEffect(() => {                                                                                                              //Ajustamos imagenes de joyeria despues que se ejecute el set
        if (!jewelryIamges.length) return;                                                                                         //En el primer render "jewelryIamges" es un array vacio y retornamos
        adjustJewelryImages();
        autoAnimateImages();
    }, [jewelryIamges]);
        
    return (
        <div className="homeJewelryCont flex wrap"> 
            {jewelryIamges}
        </div>
    );
}

export default HomeJewelry;