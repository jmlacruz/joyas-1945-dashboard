import "./register.css";
import CustomButton2 from "../../components/buttons/customButton2/CustomButton2";
import CustomCheck1 from "../../components/inputs/customCheck1/CustomCheck1";
import { createUser } from "../../services/database";
import { useState, useContext } from "react";
import { Usuario, Rubro } from "../../types/database";
import { validateEmail } from "../../utils/validations";
import { newRegister } from "../../services/mails";
import { SpinnerContext } from "../../context/spinnerContext";
import { swalPopUp } from "../../utils/swal";

function Register () {

    const {showSpinner} = useContext(SpinnerContext);

    const usuarioInitialState: Partial<Usuario> ={
        nombre: "",
        apellido: "",
        empresa: "",
        pais: "",
        provincia: "",
        ciudad: "",
        direccion: "",
        celular: "",
        telefono: "",
        "donde_conociste": "",
        email: "",
        password: ""
    };

    const checksInitialState: {[key in Rubro]: boolean} = {
        particular: true,
        comerciante: false,
        Revendedor: false,
    };

    const [userData, setUserData] = useState <Usuario> (usuarioInitialState);

    const [checksStatus, setCheckStatus] = useState <{[key in Rubro]: boolean}> (checksInitialState);

    const requiredFields: Array<[keyof Usuario, string]> = [
        ["nombre", "Nombre"], 
        ["apellido", "Apellido"], 
        ["pais", "País"], 
        ["provincia", "Provincia"], 
        ["celular", "Celular"], 
    ];

    const [aditionalInput, setAditionalInput] = useState ({
        password2: "",
        email2: ""
    });
 
    const handleChecksFunction = (inputSelectedName?: Rubro) => {
        setCheckStatus(({...{particular: false, comerciante: false, Revendedor: false}, [inputSelectedName as keyof Rubro]: true}));
        setUserData((current) => ({...current, rubro: inputSelectedName}));
    };

    const handleCheckNewsletterFunction = () => {
        setUserData((current) => ({...current, newsletter: userData && userData.newsletter === 1 ? 0 : 1}));                //El campo "newsletter" de la tabla "usuario" puede valer 1 o 0 (números)
    };

    const handleChangeInput = (e: React.ChangeEvent) => {
        const input = e.target as HTMLInputElement;
        setUserData((current) => ({...current, [input.name]: input.value}));
    };

    const handleChangeAditionalInput = (e: React.ChangeEvent) => {
        const input = e.target as HTMLInputElement;
        setAditionalInput((current) => ({...current, [input.name]: input.value}));
    };

    const saveData = async () => {
        showSpinner(true); 

        const emptyData = Object.entries(userData).filter((data) => !data[1] || (data[1] && typeof data[1] === "string" && data[1].trim() === ""));
        const emptyFields = emptyData.map((data) => data[0]);
        const emptyRequiredFields = requiredFields.filter((field) => emptyFields.find((emptyFiled) => emptyFiled === field[0]));
        const emptyRequiredFiledsParsed = emptyRequiredFields.map((data) => data[1]);
        if (emptyRequiredFields.length) {
            showSpinner(false);
            return swalPopUp("Ops", `Los siguientes campos son obligatorios: ${emptyRequiredFiledsParsed.join(", ")}`, "warning");
        }
        
        if (userData.email !== aditionalInput.email2) {
            showSpinner(false);
            return swalPopUp("Ops","Los emails no coinciden", "warning");
        }
        
        if (!validateEmail(userData.email)) {
            showSpinner(false);
            return swalPopUp("Ops","E-mail inválido", "warning");
        }
           
        if (userData.password !== aditionalInput.password2) {
            showSpinner(false);
            return swalPopUp("Ops","Los passwords no coinciden", "warning");
        }
              
        if (!userData.nombre || !userData.apellido || !userData.celular) {
            showSpinner(false);
            return swalPopUp("Ops","No puede haber campos obligatorios vacíos", "warning");
        }
      
        const response1 = await createUser({data: userData});
        if (response1.success) {                                                                                                                //Si el nombre cambió hacemos un isLogged con refresco de nombre
            const response2 = await newRegister(userData);
            setUserData(usuarioInitialState);
            setAditionalInput({
                password2: "",
                email2: ""
            });
            setCheckStatus(checksInitialState);
            showSpinner(false);
            response2.success ? 
                swalPopUp("Acción completada", "Cuenta creada exitosamente. La misma se encuentra pendiente de habilitación", "success") : 
                swalPopUp("Acción no completada", `Cuenta creada exitosamente. Ocurrió un error al enviar notificaciones por e-mail. Envíe un mensaje al e-mail info@almacendejoyas.com para solicitar la habilitación de la cuenta. (${response2.message})`, "error");
        } else {
            showSpinner(false);
            swalPopUp("Error", response1.message, "error");
        }
    };
            
    return (
        <div className="pagesContainer myAccount_pageContainer flex column">
            <div className="faqs_container myAccount_container flex column">
                <p className="faqs_index">Inicio / <span>Mi Cuenta</span></p>
                <h1 className="myAccount_title">FORMULARIO DE REGISTRO</h1>
                <p className="myAccount_indications">Si aún no está registrado complete el formulario.</p>

                <table className="myAccount_table">
                    <tbody>
                        <tr>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="nombre">Nombe Completo *</label>
                                    <input type="text" name="nombre" value={userData?.nombre || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="apellido">Apellido Completo *</label>
                                    <input type="text" name="apellido" value={userData?.apellido || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="empresa">Empresa</label>
                                    <input type="text" name="empresa" value={userData?.empresa || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="pais">País *</label>
                                    <input type="text" name="pais" value={userData?.pais || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="provincia">Provincia *</label>
                                    <input type="text" name="provincia" value={userData?.provincia || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="ciudad">Ciudad</label>
                                    <input type="text" name="ciudad" value={userData?.ciudad || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="direccion">Dirección</label>
                                    <input type="text" name="direccion" value={userData?.direccion || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="celular">Celular *</label>
                                    <input type="text" name="celular" value={userData?.celular || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="telefono">Teléfono Fijo</label>
                                    <input type="text" name="telefono" value={userData?.telefono || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="donde_conociste">¿Dónde nos conociste?</label>
                                    <input type="text" name="donde_conociste" value={userData?.donde_conociste || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="email">Correo electrónico *</label>
                                    <input type="email" name="email" value={userData?.email || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="email2">Repetir correo *</label>
                                    <input type="email" name="email2" value={aditionalInput.email2} onChange={handleChangeAditionalInput}/>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="password">Contraseña *</label>
                                    <input type="password" name="password" value={userData?.password || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="password2">Repetir contraseña *</label>
                                    <input type="password" name="password2" value={aditionalInput.password2} onChange={handleChangeAditionalInput}/>
                                </div>
                            </td>
                        </tr>
                        <tr className="myAccount_table_finalRow">
                            <td colSpan={2}>
                                <div className="myAccount_table_tdInternalDiv flex column">

                                    <p className="myAccount_table_finalRowTitle">Categoria</p>

                                    <div className="myAccount_checksCont flex">
                                        <CustomCheck1 text="Particular" name="particular" checked={checksStatus.particular} onCheckedFunction={handleChecksFunction}/>
                                        <CustomCheck1 text="Comerciante" name="comerciante"  checked={checksStatus.comerciante} onCheckedFunction={handleChecksFunction}/>
                                        <CustomCheck1 text="Revendedor" name="Revendedor" checked={checksStatus.Revendedor} onCheckedFunction={handleChecksFunction}/>
                                    </div> 

                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="myAccount_saveButtonCont flex">
                    <CustomCheck1 text="Recibir novedades de AlmacendeJoyas en mi correo" name="newsletter" checked={userData && userData.newsletter === 1} onCheckedFunction={handleCheckNewsletterFunction}/>     {/*Si el campo "newsletter" vale 1 (número) es porque el usuario quiere recibir novedades*/}
                    <CustomButton2 text="REGISTRARSE" onClickFunction={saveData}/>
                </div>
            </div>
        </div>
    );
}

export default Register;