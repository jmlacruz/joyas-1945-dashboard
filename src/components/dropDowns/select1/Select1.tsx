import "./select1.css";
import { useState, useEffect } from "react";

function Select1 (props: {options: string[], defaulOption?: string, class?: string, selectResultFunc?: (opc: number) => void}) {   //A "selectResultFunc" se le pasa el número de opcion seleccionada según su atributo "index"

    const [showOptions, setShowOptions] = useState (false);
    const [selectedOption, setSelectedOption] = useState ("");

    const handleShowOptions = (e: React.MouseEvent) => {                                                     //Si el dropdown esta visible lo ocultamos y viceversa
        e.stopPropagation();
        setShowOptions((current) => !current);
    };

    const handleSelectedOption = (e: React.MouseEvent) => {                                                 //Seteamos la opción seleccionada            
        e.stopPropagation();
        const target = e.target as HTMLElement;
        setSelectedOption(target.textContent as string);    
        setShowOptions(false);

        const optionNumber = target.id;                                                                     //Pasamos a la funcion "selectResultFunc" el número de opción seleccionada para que esta función "haga algo"
        props.selectResultFunc && props.selectResultFunc(Number(optionNumber));
    };

    useEffect(() => {
        document.body.addEventListener("click", () => setShowOptions(false));                               //Listeners para que se cierren los dropdowns al hacer click cualquier parte
        return () => document.body.removeEventListener("click", () => setShowOptions(false));               //Removemos listeners al desmontar el componente
    }, []);
            
    return (
        <div className={`select1Cont flex ${props.class}`} onClick={handleShowOptions}>
            <p className="select1_symbol flex">V</p>
            <p className="select1_selectedOption">{selectedOption || props.defaulOption || props.options[0]}</p>
            {
                showOptions &&
                <div className="select1_optionsCont flex column">
                    {
                        props.options.map((option: string, index: number) => <p key={index} id={index.toString()} onClick={handleSelectedOption}> {option} </p>)
                    }
                </div>
            }
        </div>
    );
}

export default Select1;