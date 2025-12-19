import { Channel, DefaultGenerics } from "stream-chat";
import { ActivityData, StreamChatMessage, StreamChatMessageType } from "../types";
import { getClientDevice } from "../utils/utils";

export const sendActivityToChat = async (data: {
    userName: string, 
    userLastName: string, 
    userCity: string, 
    itemDescription: string, 
    itemImgSrc: string, 
    userEmail: string, 
    productID: number, 
    timestamp: number,
    streamChatChannel: Channel<DefaultGenerics> | null,
    activityType: StreamChatMessageType,
    total: number,
    data?: any
}) => {
    
    if (process.env.REACT_APP_SEND_STREAM_CHAT_GLOBAL_NOTIFICATION) {                                                                  //Solo generamos notificaciones de compras en produccion
        const buyActivityData: ActivityData = {
            name: data.userName,
            lastName: data.userLastName,
            userCity: data.userCity, 
            itemDescription: data.itemDescription, 
            itemImgSrc: data.itemImgSrc, 
            userEmail: data.userEmail, 
            productID: data.productID,
            timestamp: data.timestamp,
            device: getClientDevice(),
            total: data.total,
            data: data.data
        };
        const streamChatMessageType: StreamChatMessageType = data.activityType;
        const streamChatMessage: StreamChatMessage = {type: streamChatMessageType, data: buyActivityData};
        if (!data.streamChatChannel) return;
        const response = await data.streamChatChannel.sendMessage({
            text: JSON.stringify(streamChatMessage),
        });
        return response;
    }
};