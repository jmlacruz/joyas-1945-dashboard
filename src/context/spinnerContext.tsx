import { createContext, useState } from "react";
import { Spinner } from "../components/spinner/Spinner";
import { SpinnerContextType } from "../types/spinner";

const SpinnerContext = createContext <SpinnerContextType> ({showSpinner: () => {}, spinner: <></>});

const SpinnerProvider = ({children}: {children: JSX.Element}) => {
    const [spinner, setSpinner] = useState <JSX.Element> (<></>);
     
    const showSpinner = (opc: boolean) => {
        opc ? setSpinner(<Spinner/>) : setSpinner(<></>);
    };
    
    return (      
        <SpinnerContext.Provider value={{spinner, showSpinner}}>
            {children}
        </SpinnerContext.Provider>
    );
};

export {SpinnerContext, SpinnerProvider};
