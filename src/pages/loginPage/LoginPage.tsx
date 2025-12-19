import HomeSlider from "../../components/homeSlider/HomeSlider";
import LoginComponent from "../../components/loginComponent/LoginComponent";
import "./loginPage.css";

function LoginPage () {

    return (
        <div className="loginPageCont flex">
            <LoginComponent/>
            <HomeSlider/> 
        </div>
    );
}

export default LoginPage;