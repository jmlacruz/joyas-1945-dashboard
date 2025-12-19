import OrderForMail from "./OrderForMail";
import { OrderForMailData } from "../../types";
import { useEffect, useState } from "react";

const OrderHTML = () => {
    const [order, setOrder] = useState <JSX.Element> (<></>); 
    
    useEffect(() => {
        (async() => {
            const orderDataJSON = localStorage.getItem("order");
            if (orderDataJSON)  {
                const orderDataOBJ: OrderForMailData = JSON.parse(orderDataJSON);
                setOrder(await OrderForMail({orderDataFromWeb: orderDataOBJ}));
            }
        })();
    }, []);
    
    return (
        order
    );
};

export default OrderHTML;
