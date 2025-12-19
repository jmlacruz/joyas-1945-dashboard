import { useContext, useRef } from "react";
import { sendPassword } from "../../services/mails";
import "./recoveryPassword.css";
import { validateEmail } from "../../utils/validations";
import { swalPopUp } from "../../utils/swal";
import { SpinnerContext } from "../../context/spinnerContext";

export default function RecoveryPassword() {
    const inputRef = useRef <HTMLInputElement | null> (null);
    const {showSpinner} = useContext(SpinnerContext);

    const send = async () => {
        showSpinner(true);

        const email = inputRef.current?.value || "";

        if (!validateEmail(email) || !inputRef.current) {
            showSpinner(false);
            return swalPopUp("Ops!", "E-mail inválido", "warning");
        }

        const response = await sendPassword(email);
        if (response.success) {
            inputRef.current.value = "";
            swalPopUp("Acción completada", `Se envió un correo con sus datos de acceso a la cuenta ${email}`, "success");
        } else {
            swalPopUp("Error", response.message, "error");
        }
        showSpinner(false);
    };

    return (
        <div className="pagesContainer paddingHorizontalPages revoveryPassword_container flex column">
            <div className="faqs_container flex column">
                <p className="faqs_index">Inicio / <span>Recuperar contraseña</span></p>
            </div>
            <h1>Recupere su contraseña</h1>
            <h2>Ingrese el email con el cual se registro en el sitio.</h2>
            <h3>Si usted ya se registró ingrese su usuario o su email para recuperar la contraseña.</h3>

            <input type="email" required={true} placeholder="Correo electrónico" ref={inputRef}/>
            <button className="contact_sendButton flex" onClick={send}>RECUPERAR</button>
        </div>
    );
}
