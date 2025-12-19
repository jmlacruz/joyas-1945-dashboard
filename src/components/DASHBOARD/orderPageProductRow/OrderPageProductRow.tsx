import "./orderPageProductRow.css";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Input from '../../form/Input';
import Tooltip from '../../ui/Tooltip';
import Icon from '../../icon/Icon';
import Textarea from "../../form/Textarea";
import WaitImages from "../waitImages/WaitImages";
import { EditOrderNewProductExtraData, EditOrderProductDataModifiableFields } from "../../../types/DASHBOARD";
import { showModal1 } from "../../../features/modalSlice";

const OrderPageProductRow = (props: { 
    imgSrc: string, 
    name: string, 
    price: number, 
    calcPrice: number, 
    quantity?: number, 
    total: number, 
    observations?: string, 
    productID: number, 
    productsDataToUpDate: {productID: number, data: EditOrderProductDataModifiableFields | null, newProductExtraData?: EditOrderNewProductExtraData}[],
    newProductExtraData?: EditOrderNewProductExtraData
}) => {
    const { imgSrc, name: productName, price, calcPrice, quantity, total, observations, productID, productsDataToUpDate, newProductExtraData } = props;
    const rowRef = useRef <HTMLTableRowElement> (null);
    const [productData, setProductData] = useState <EditOrderProductDataModifiableFields> ({ cantidad: quantity || 1 , total, observaciones: observations || ""});
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const dispatch = useDispatch();

    const allowEdit = (opc: boolean) => {                                                                                       //Se habilitan / deshabilitan los inputs y textareas para edicion
        const inputs = rowRef.current?.querySelectorAll(".orderPage_productCard_input") as NodeListOf<HTMLInputElement>;
        if (opc) {
            inputs.forEach(input => {
                input.classList.remove("orderPage_productCard_input_off");
                input.removeAttribute("readOnly");
            });
            setIsEditMode(true);
        } else {
            inputs.forEach(input => {
                input.classList.add("orderPage_productCard_input_off");
                input.setAttribute("readOnly", "true");
            });
            setIsEditMode(false);
        }
    };  

    const saveChanges = (opc: boolean) => {                                                                                     //Se descartan o guardan los cambios del producto en "productData"

        if (opc && productData.cantidad <= 0) {
            dispatch(showModal1({ show: true, info: { icon: "warning", title: "Valores incorrectos", subtitle: "La cantidades tienen que se mayor a 0" }}));
			return;
        }

        if (opc) {
            const totalPrice = Math.ceil(price * calcPrice * productData.cantidad);        
            setProductData((current) => ({...current, total: totalPrice}));                                                     //Al guardar cambios se actualiza el total por si se cambió la cantidad
            const producFoundIndex = productsDataToUpDate.findIndex((product) => product.productID === productID);
            if (producFoundIndex !== -1) {  
                productsDataToUpDate[producFoundIndex].data = {...productData, total: totalPrice};
                productsDataToUpDate[producFoundIndex].newProductExtraData = newProductExtraData;
            } else {
                productsDataToUpDate.push({productID, data: {...productData, total: totalPrice}, newProductExtraData});
            }
        } else {
            setProductData((current) => ({...current, cantidad: quantity || 1, observaciones: observations || ""}));            //Si se descartan los cambios volvemos a los datos iniciales (que estan en "props")
        }
        allowEdit(false);
    };

    useEffect(() => {                                                                                                           //Si es un producto nevo hacemos "saveChanges" paa que se "pushee" en "productsDataToUpDate"
        if(newProductExtraData) saveChanges(true);
        //eslint-disable-next-line
    }, []);    
    
    const handleProductDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProductData((current) => ({ ...current, [name]: value }));
    };

    const deleteRow = () => {
        setIsDeleteMode(true);
        const producFoundIndex = productsDataToUpDate.findIndex((product) => product.productID === productID);
        if (producFoundIndex !== -1) {
            productsDataToUpDate[producFoundIndex].data = null;
        } else {
            productsDataToUpDate.push({productID, data: null});
        }
    };
    
    return (
        !isDeleteMode && 
        <tr ref={rowRef} className="orderPage_productCard_row">
            <td className='orderPage_productCard_img_cont'>
                <WaitImages>
                    <img src={imgSrc} className='orderPage_productCard_img' alt="Product" />
                </WaitImages>
            </td>
            <td className='orderPage_productCard_text_cont orderPage_productCard_nameCont'>
                {productName}
            </td>
            <td>
                {price}
            </td>
            <td>
                {calcPrice}
            </td>
            <td>
                <Input
                    name="cantidad"
                    value={productData.cantidad}
                    onChange={handleProductDataChange}
                    className='orderPage_productCard_input orderPage_productCard_input_off'
                    type="number"
                    readOnly
                />
            </td>
            <td className='px-2'>
                {productData.total}              
            </td>
            <td className='orderPage_productCard_text_cont'>
                <div className="orderPage_productCard_textAareaCont dflex">
                    <Textarea
                        name="observaciones"
                        value={productData.observaciones}
                        onChange={handleProductDataChange}
                        className='orderPage_productCard_input h-full orderPage_productCard_input_off orderPage_productCard_textAarea'
                        readOnly
                    />
                </div>
            </td>
            <td>
                <div className='dflex w-full'>
                    {
                        isEditMode ? 
                        <div className="dflex column">
                            <Tooltip text='Cancelar cambios'>
                                <Icon icon='HeroXCircle' color='red' size='text-4xl' className="trashIconRed mb-4" onClick={() => saveChanges(false)} />
                            </Tooltip> 
                            <Tooltip text='Guardar cambios'>
                                <Icon icon='HeroCheckCircle' color="emerald" size='text-4xl' onClick={() => saveChanges(true)}/>
                            </Tooltip>
                        </div>
                        : 
                        <Tooltip text='Modificar producto'>
                            <Icon icon='HeroPencilSquare' color='blue' size='text-4xl' onClick={() => allowEdit(true)}/>
                        </Tooltip>
                    }
                </div>
            </td>
            <td>
                <div className='dflex w-full'>
                    <Tooltip text='Eliminar producto'>
                        <Icon icon='HeroTrash' color='red' size='text-4xl' className='trashIconRed' onClick={deleteRow}/>
                    </Tooltip>
                </div>
            </td>
        </tr>
    );
};

export default OrderPageProductRow;
