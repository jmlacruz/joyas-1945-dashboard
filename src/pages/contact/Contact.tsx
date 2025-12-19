import { useContext, useRef, useState } from "react";
import "./contact.css";
import { SpinnerContext } from "../../context/spinnerContext";
import { ContactFormValues } from "../../types";
import { newContact } from "../../services/mails";
import { swalPopUp } from "../../utils/swal";

function Contact() {

    const { showSpinner } = useContext(SpinnerContext);
    const formRef = useRef<HTMLFormElement | null>(null);
    const [contactSend, setContactSend] = useState(false);

    const validateForm = async () => {

        const formData = new FormData(formRef.current as HTMLFormElement);
        const dataOBJ = Object.fromEntries(formData) as ContactFormValues;

        if (dataOBJ.name.trim() !== "" && dataOBJ.email.trim() !== "" && dataOBJ.last_name.trim() !== "" && dataOBJ.message.trim() !== "") {
            sendForm(dataOBJ);
        } else {
            swalPopUp("Ops!", "Falta Ingresar Algún Dato", "warning");
        }
    };

    const sendForm = async (dataOBJ: ContactFormValues) => {

        try {
            showSpinner(true);
            const response = await newContact(dataOBJ);
            if (response.success) {
                const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll(".inputForm");
                inputs.forEach((input) => input.value = "");
                setContactSend(true);
                window.scrollTo({top: 0});
                swalPopUp("Acción completada", "Mensaje enviado con éxito", "success");
            } else {
                swalPopUp("Error", response.message, "error");
            }
            showSpinner(false);

        } catch (err: unknown) {
            showSpinner(false);
            swalPopUp("Error", err instanceof Error ? `No se pudo enviar el mensaje: ${err.message}` : "No se pudo el mensaje: problema desconocido", "error");
        }
        document.body.style.overflow = "initial";
    };

    return (
        <div className="pagesContainer contactPage_container flex column" style={{justifyContent: !contactSend ? "flex-start" : "center"}}>
            <div className="faqs_container contact_container flex column">
                {
                    !contactSend &&
                        <>
                            <p className="faqs_index contact_index">Inicio / <span>Contacto</span></p>
                            <h1 className="contact_title">Contáctenos</h1>
                            <p className="contact_subTitle">SI TIENE CUALQUIER CONSULTA NO DUDE EN MANDARNOS UN MENSAJE</p>
                            <p className="contact_formTitle">Escribe tu mensaje aqui</p>
                            <form className="formGrid" ref={formRef}>
                                <div className="form_name flex column">
                                    <label htmlFor="name">Nombre Completo</label>
                                    <input type="text" name="name"/>
                                </div>
                                <div className="form_lastName flex column">
                                    <label htmlFor="last_name">Apellido</label>
                                    <input type="text" name="last_name"/>
                                </div>
                                <div className="form_email flex column">
                                    <label htmlFor="email">Email</label>
                                    <input type="email" name="email"/>
                                </div>
                                <div className="form_message flex column">
                                    <label htmlFor="message">Mensaje</label>
                                    <textarea name="message"/>
                                </div>    
                            </form>
                            <button className="contact_sendButton flex" onClick={validateForm}>ENVIAR MENSAJE</button>
                        </>
                }   
            </div>
            {
                contactSend ? 
                    <p className="contact_sendText flex">Su mensaje se envío con éxito.</p> :
                    <></>
            }
        </div>
    );
}

export default Contact;