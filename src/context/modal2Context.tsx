import { createContext, useState } from "react";
import { Modal2ContextOptionType, Modal2ContextType, Modal2IconList } from "../types/DASHBOARD";

const Modal2Context = createContext <Modal2ContextType> ({
    modal2State: {
        show: false,
        title: "",
        subtitle: "",
        firstButtonText: "",
        secondButtonText: "",
        icon: "",
        firstButtonFunction: () => {},
        secondButtonFunction: () => {}
    },
    setModal2: (options: Modal2ContextOptionType) => {}
});

const Modal2Provider = ({children}: {children: JSX.Element}) => {

    const [modal2State, setModal2State] = useState <{
        show: boolean,
        title: string,
        subtitle: string,
        firstButtonText: string,
        secondButtonText: string,
        icon: Modal2IconList | "",
        firstButtonFunction: () => void,
        secondButtonFunction: () => void
    }
    > ({
        show: false,
        title: "",
        subtitle: "",
        firstButtonText: "",
        secondButtonText: "",
        icon: "",
        firstButtonFunction: () => {},
        secondButtonFunction: () => {}
    });
            
    const setModal2 = (options: Modal2ContextOptionType) => {
        setModal2State({
            show: options.show,
            title: options.title || modal2State.title,
            subtitle: options.subtitle || modal2State.subtitle,
            icon: options.icon || modal2State.icon,
            firstButtonText: options.firstButtonText || modal2State.firstButtonText,
            secondButtonText: options.secondButtonText || modal2State.secondButtonText,
            firstButtonFunction: options.firstButtonFunction || (() => setModal2({show: false})),
            secondButtonFunction: options.secondButtonFunction || (() => {})
        });
    };
       
    return (      
        <Modal2Context.Provider value={{setModal2, modal2State}}>
            {children}
        </Modal2Context.Provider>
    );
};

export {Modal2Context, Modal2Provider};
