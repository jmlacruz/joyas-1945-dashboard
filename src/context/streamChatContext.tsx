import { createContext } from "react";
import { Channel, DefaultGenerics } from "stream-chat";

const StreamChatContext = createContext <{streamChat: {channel: Channel<DefaultGenerics> | null}}> ({streamChat: {channel: null}});

const StreamChatProvider = ({children}: {children: JSX.Element}) => {
        
    const streamChat = {channel: null};

    return (      
        <StreamChatContext.Provider value={{streamChat}}>
            {children}
        </StreamChatContext.Provider>
    );
};

export {StreamChatContext, StreamChatProvider};
