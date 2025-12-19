import { createContext } from "react";
import { SpinnerContextType } from "../types/spinner";

const SpinnerContext = createContext <SpinnerContextType> ({showSpinner: () => {}, spinner: <></>});

const SpinnerProvider = ({children}: {children: JSX.Element}) => {
    
    return (      
        <div>
            {children}
        </div>
    );
};

export { SpinnerContext, SpinnerProvider };

