import "./loginPage.css";
import { useContext, useEffect } from "react";
import { SpinnerContext } from "../../../context/spinnerContext";
import LoginForm from "../../../components/DASHBOARD/loginForm/LoginForm";

const LoginPage = () => {

    const {showSpinner} = useContext(SpinnerContext);

    useEffect(() => {
        showSpinner(false);                                                         //Cerramos el spinner por si quedo abierto en alguna redireccióm
        //eslint-disable-next-line
    }, []);
    
    return (
        <div className="pageContainer dflex column">
            <LoginForm />
        </div>
    );
};

export default LoginPage;
