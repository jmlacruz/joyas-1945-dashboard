import Swal from "sweetalert2";

type SweetAlertIcon = "success" | "error" | "warning" | "info" | "question";

export const swalPopUp = (title: string, text: string , icon: SweetAlertIcon | undefined, reloadPage?: boolean) : void => {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonColor: "#71706f",
        color: "#71706f",       
        scrollbarPadding: false,     
        allowOutsideClick: false,
        customClass: {      
            confirmButton: "sweetConfirmBoton",        
        },
    }).then(() => {
        if((reloadPage) || text.toLowerCase().includes("tienes que registrarte")) window.location.reload();   //Si "tienes que registrarte" viene en el mensaje recargamos la pagina para que 
    });                                                                                                       // el usuario no siga figurando como logueado  
};