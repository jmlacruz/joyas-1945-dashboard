import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomButton2 from "../../components/buttons/customButton2/CustomButton2";
import CustomCheck1 from "../../components/inputs/customCheck1/CustomCheck1";
import { SpinnerContext } from "../../context/spinnerContext";
import { setUser } from "../../features/userSlice";
import { getTable, updateTable } from "../../services/database";
import { isLogged } from "../../services/log";
import { RootState } from "../../store";
import { SessionUserData } from "../../types";
import { Rubro, Usuario } from "../../types/database";
import { swalPopUp } from "../../utils/swal";
import { validateEmail } from "../../utils/validations";
import "./myAccount.css";

function MyAccount () {

    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.value);
    const [userData, setUserData] = useState <Usuario> ({});
    const initialData = useRef <Usuario> ({});
    const [checksStatus, setCheckStatus] = useState <{[key in Rubro]: boolean}> ({
        particular: false,
        comerciante: false,
        Revendedor: false,
    });
    const initialEmail = useRef("");
    const initialName = useRef("");
    const [handleReloadForm, setHandleReloadForm ] = useState (false);
    const {showSpinner} = useContext(SpinnerContext);

    const [aditionalInput, setAditionalInput] = useState ({
        password2: "",
        email2: ""
    });

    useEffect(() => {
      
        (async () => {
            showSpinner(true);
            const response = await getTable({tableName: "usuario", conditions: [{field: "email", value: user.email}]});
            if (response.success && response.data && response.data.length) {
                const userDataFromDB: Usuario = response.data[0];
                delete userDataFromDB.password;
                delete userDataFromDB.fecha_alta;                                                                           //Se borran campos que no se necesitan
                delete userDataFromDB.fecha_login_adj2;
                delete userDataFromDB.dolar;
                setUserData(userDataFromDB);
                setCheckStatus((current) => ({...current, [userDataFromDB.rubro as keyof Rubro]: true}));                   //Seteamos los checkbox del formulario segun vienen de la base de datos
                initialEmail.current = userDataFromDB.email as string;
                initialName.current = userDataFromDB.nombre as string;
                initialData.current = structuredClone(userDataFromDB);
                aditionalInput.email2 = "";
                aditionalInput.password2 = "";
            }
            showSpinner(false);
        })();

    }, [handleReloadForm]);

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
        if (!userData) return;  

        if ((JSON.stringify(initialData.current) === JSON.stringify(userData)) && !aditionalInput.email2.trim() && !aditionalInput.password2.trim()) return swalPopUp("Ops!", "No se han realizado cambios", "info");

        if (initialEmail.current !== userData.email) {
            if (userData.email !== aditionalInput.email2) return swalPopUp("Ops!", "Los emails no coinciden", "warning");
            if (!validateEmail(userData.email)) return swalPopUp("Ops!", "E-mail inválido", "warning");
        }
        if (!userData.email && !aditionalInput.email2) return swalPopUp("Ops!", "Debe completar los campos de E-mail", "warning");
        if (userData.email && aditionalInput.email2 && userData.email !== aditionalInput.email2) return swalPopUp("Ops!", "Los campos de E-mail no coinciden", "warning");
        if (!validateEmail(userData.email)) return swalPopUp("Ops!", "E-mail inválido", "warning");

        if ((userData.password || aditionalInput.password2) && userData.password !== aditionalInput.password2) return swalPopUp("Ops!", "Los passwords no coinciden", "warning");
        if (!userData.password || !aditionalInput.password2) delete userData.password;                                              //Si los campos de password estan vacios borramos el campo "password" para que no se setee como string vacio en la base de datos

        const response = await updateTable({tableName: "usuario", conditions: [{field: "email", value: user.email}], data: userData});
        if (response.success && initialName.current !== userData.nombre) {                                                          //Si el nombre cambió hacemos un isLogged con refresco de nombre
            const response = await isLogged({ refreshData: true });
                        
            if (response.success && response.data ) {
                const data: SessionUserData = response.data;
                dispatch(setUser(data));
                swalPopUp("Acción completada", "Datos de usuario actualizados", "success");
            }
        } else if (response.success && initialName.current === userData.nombre) {
            setHandleReloadForm((current) => !current);
            swalPopUp("Acción completada", "Datos de usuario actualizados", "success");
        } else if (!response.success) {
            swalPopUp("Error", response.message, "error");
        }
    };
            
    return (
        <div className="pagesContainer myAccount_pageContainer flex column">
            <div className="faqs_container myAccount_container flex column">
                <p className="faqs_index">Inicio / <span>Mi Cuenta</span></p>
                <h1 className="myAccount_title">Datos del usuario / Configuración de la cuenta</h1>
                <p className="myAccount_indications">Para actualizar la información simplemente debes reescribir los campos que presenta el siguiente formulario y luego presionar el botón &quot;guardar datos&quot;</p>

                <table className="myAccount_table">
                    <tbody>
                        <tr>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="nombre">Nombe Completo</label>
                                    <input type="text" name="nombre" value={userData?.nombre || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="apellido">Apellido Completo</label>
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
                                    <label htmlFor="pais">País</label>
                                    <input type="text" name="pais" value={userData?.pais || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="provincia">Provincia</label>
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
                                    <label htmlFor="celular">Celular</label>
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
                                    <label htmlFor="email">Correo electrónico</label>
                                    <input type="email" name="email" value={userData?.email || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="email2">Repetir correo</label>
                                    <input type="email" name="email2" value={aditionalInput.email2} onChange={handleChangeAditionalInput}/>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="password">Contraseña</label>
                                    <input type="password" name="password" value={userData?.password || ""} onChange={handleChangeInput}/>
                                </div>
                            </td>
                            <td>
                                <div className="myAccount_table_tdInternalDiv flex column">
                                    <label htmlFor="password2">Repetir contraseña</label>
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
                    <CustomButton2 text="GUARDAR DATOS" onClickFunction={saveData}/>
                </div>
            </div>
        </div>
    );
}

export default MyAccount;