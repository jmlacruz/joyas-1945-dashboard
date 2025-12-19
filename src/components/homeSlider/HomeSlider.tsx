import { waitAllImagesChargedInElement } from "../../utils/waitAllImagesCharged";
import "./homeSlider.css";
import { ReactElement, useEffect, useRef, useState } from "react";

type EffectList = "squares" | "opacityOn" | "opacityOff" | "off" | "on";

const ImageEffect = (props: {children: ReactElement<HTMLImageElement>, effect: EffectList, duration: number, reverse?: boolean}) => {

    const mainContRef = useRef <HTMLDivElement> (null);

    const runSquareEffect = async () => {
        if (!mainContRef.current) return;

        const imageContainer = mainContRef.current.querySelector(".imageEffect_imageCont") as HTMLDivElement;
        const imageEffect_squares = mainContRef.current.querySelectorAll(".imageEffect_square");
        imageEffect_squares?.forEach(square => {
            square.remove();
        });

        await waitAllImagesChargedInElement(imageContainer);
        
        if (!mainContRef.current) return;
        const image = mainContRef.current.querySelector("img") as HTMLImageElement;
          
        const imageHeight = image.offsetHeight;
        const imageWidth = image.offsetWidth;
        const imageAspectRatio = imageWidth / imageHeight;

        const squares: Array<HTMLDivElement> = [];
        const squareWidth = imageWidth / 5;
        const squareHeight = squareWidth / imageAspectRatio;

        // Crear los cuadrados y posicionarlos
        for (let y = 0; y < imageWidth / squareWidth; y++) {
            for (let x = 0; x < imageHeight / squareHeight; x++) {
                const square = document.createElement("div");
                square.classList.add("imageEffect_square");
                square.style.backgroundImage = `url(${image.src})`;
                square.style.width = `${squareWidth + 2}px`;
                square.style.height = `${squareHeight + 2}px`;                                  //El +1 es porque al poner "fill: "forwards"" aparece una linea blanca horizontal que se corrige con el +1
                square.style.backgroundSize = `${imageWidth}px ${imageHeight}px`;
                square.style.backgroundPosition = `-${x * squareWidth}px -${y * squareHeight}px`;
                square.style.left = `${x * squareWidth}px`;
                square.style.top = `${y * squareHeight}px`;
                imageContainer.appendChild(square);
                squares.push(square);
                void square.offsetHeight;                                                        //Con esta linea se espera que se apliquen todos los estilos
            }
        }
        squares.forEach(square => {
            square.animate([
                { transform: "scale(0) translateX(0) translateY(0)", opacity: "0" },
                { transform: "scale(100%) translateX(0) translateY(0)", opacity: "1" }
            ], {
                duration: props.duration * 1000,
                easing: "ease-out",
                direction: props.reverse ? "reverse" : "normal",
                fill: "forwards"
            });
        });
    };

    const on = () => {
        if (!mainContRef.current) return;

        const image = mainContRef.current.querySelector("img");
        if (image) image.style.opacity = "1";
    };  

    const off = () => {
        if (!mainContRef.current) return;

        const image = mainContRef.current.querySelector("img");
        if (image) image.style.opacity = "0";
    }; 

    const opacityOff = () => {
        if (!mainContRef.current) return;
 
        const imageEffect_squares = mainContRef.current.querySelectorAll(".imageEffect_square");
        imageEffect_squares?.forEach(square => {
            square.remove();
        });

        const image = mainContRef.current.querySelector("img");

        image?.animate([
            { opacity:  "1"},
            { opacity: "0" }
        ], {
            duration: props.duration * 1000,
            easing: "ease-out",
            direction: props.reverse ? "reverse" : "normal",
            fill: "forwards"
        });
    };

    useEffect(() => {
        switch (props.effect) {
        case "squares":
            runSquareEffect();
            break;
        case "opacityOff":
            opacityOff();
            break;
        case "on":
            on();
            break;
        case "off":
            off();
            break;
        }
    }, [props]);
               
    return (
        <div className="imageEffect_mainCont flex" ref={mainContRef}>
            <div className="imageEffect_imageCont">
                {props.children}
            </div>
        </div>
    );
};

function HomeSlider () {

    const [animationsData, setAnimationsData] = 
    useState <{
        image1: {
            effect: EffectList,
            duration: number,
            reverse: boolean,
        },
        image2: {
            effect: EffectList,
            duration: number,
            reverse: boolean,
        }
    }> 
    ({
        image1: {
            effect: "squares",
            duration: 1,
            reverse: false,
        },
        image2: {
            effect: "opacityOff",
            duration: 1,
            reverse: false,
        }
    });
    
    const pause = (time: number) => {
        return new Promise(resolve => setTimeout(resolve, time));
    };

    useEffect (() => {
        const loop = async () => {
            await pause(8000);
            setAnimationsData({
                image1: {
                    effect: "opacityOff",
                    duration: 1,
                    reverse: false,
                },
                image2: {
                    effect: "squares",
                    duration: 1,
                    reverse: false,
                }
            });
            await pause(8000);
            setAnimationsData({
                image1: {
                    effect: "squares",
                    duration: 1,
                    reverse: false,
                },
                image2: {
                    effect: "opacityOff",
                    duration: 1,
                    reverse: false,
                }
            });
            loop();
        };
        loop();
    }, []);

    return (
        <div className="loginSliderCont flex">
            <ImageEffect effect={animationsData.image1.effect} duration={animationsData.image1.duration} reverse={animationsData.image1.reverse}>
                <img src="/images/slider/1.jpg" alt="Slider"/>
            </ImageEffect>    
            <ImageEffect effect={animationsData.image2.effect} duration={animationsData.image2.duration} reverse={animationsData.image2.reverse}>
                <img src="/images/slider/2b.jpeg" alt="Slider"/>
            </ImageEffect>  
        </div>
    );
}

export default HomeSlider;