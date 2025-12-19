import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { SpinnerContext } from "../../context/spinnerContext";
import { StreamChatContext } from "../../context/streamChatContext";
import { clearUser } from "../../features/userSlice";
import { saveCart } from "../../services/database";
import { clearSessionOfLocalStorage } from "../../services/localStorage";
import { logOut } from "../../services/log";
import { sendActivityToChat } from "../../services/streamChat";
import { RootState } from "../../store";
import "./userOptions.css";

function UserOptions () {
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {showSpinner} = useContext(SpinnerContext);
    const { email, city, lastName, name } = useSelector((state: RootState) => state.user.value);
    const cart = useSelector((state: RootState) => state.cart.value);
    const { streamChat } = useContext(StreamChatContext);
    
    const out = async () => {
        showSpinner(true);
        await saveCart({userEmail: email, cartData: cart});
        
        await sendActivityToChat({                                                                //Enviamos evento de LogOut al canal websocket para que lo tome el dashboard
            activityType: "out",
            itemDescription: "",
            itemImgSrc: "",
            userEmail: email,
            userCity: city,
            productID: 0,
            streamChatChannel: streamChat.channel,
            timestamp: Date.now(),
            userLastName: lastName,
            userName: name,
            total: 0,
        });

        const response = await logOut();
        showSpinner(false);
        clearSessionOfLocalStorage();
        dispatch(clearUser());          

        if (response.success) {
            localStorage.removeItem("webtoken");
            // Limpiar la URL navegando a /home sin parámetros
            navigate("/home", { replace: true });
        }
    };

    return (
        <div className="userOptions_cont dropDownAnimation1_in flex column">
            <Link to="/micuenta" className="userOptions_optionCont flex">
                <img src="/images/icons/config.png" alt="Configuración" className="userOptions_optionImg"/>
                <p className="userOptions_optionText">Configuración</p>
            </Link>
            <div className="userOptions_optionCont flex" onClick={out}>   
                <img src="/images/icons/logOut.png" alt="Log Out" className="userOptions_optionImg"/>
                <p className="userOptions_optionText">Log Out</p>
            </div>
        </div>
    );
}

export default UserOptions;