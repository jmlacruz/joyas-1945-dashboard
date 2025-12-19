import { OrderForMailData } from "../../types";
import "./orderForMail.css";
import { insertDotsInPrice } from "../../utils/utils";
import { getTable } from "../../services/database";
import { System_config } from "../../types/database";

const OrderForMail = async (props: {orderDataFromWeb?: OrderForMailData}) => {

    let orderData: OrderForMailData | null = null;

    const response = await getTable({ tableName: "system_config", conditions: [{ field: "config", value: "banco_datos" }] });
    const transferData: System_config = response.data[0];
    const bankData = transferData.value;


    if (!props.orderDataFromWeb) {
        const orderDataJSON = localStorage.getItem("order");
        if (orderDataJSON) {
            const orderDataOBJ: OrderForMailData = JSON.parse(orderDataJSON);
            orderData = orderDataOBJ;
        }
    } else {
        orderData = props.orderDataFromWeb;
    }
   
    return (
        <div className="orderForMailCont flex">
            <div className="order-details">
                <div className="orderForMail-headCell flex column">
                    <h1>NUEVO PEDIDO</h1>
                    <p>Hemos registrado su nuevo pedido, nos pondremos en contacto a la brevedad.</p>

                    <div className="order-info flex column">
                        <p><strong>Fecha:</strong> {orderData?.currentDate}</p>
                        <p><strong>Total:</strong> {orderData?.total ? insertDotsInPrice(orderData.total) : "No se pudo calcular"}</p>
                        <p><strong>Método de envío:</strong> {orderData?.shippingMethod}</p>
                    </div>
                </div>
               
                <div className="product-details flex column">
                    <h2><strong>Detalle del pedido:</strong></h2>
                    <table>
                        <thead>
                            <tr>
                                <th className="product-details-productNameHead">Producto</th>
                                <th>Foto</th>
                                <th>Observaciones</th>
                                <th>Precio</th>
                                <th>Cantidad</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderData?.productsDataArr.map((itemData, index) => 
                                <tr className="orderForMail_productRow" key={index}>
                                    <td className="orderForMail_productRow_desc">{itemData.description} <br /> {itemData.code}</td>
                                    <td><img src={itemData.imgSrc} alt="Product" className="orderForMail_productRow_image"/></td>
                                    <td>{itemData.itemObservations}</td>
                                    <td>{insertDotsInPrice(itemData.unitPrice)}</td>
                                    <td>{itemData.quantity}</td>
                                    <td>{insertDotsInPrice(itemData.total)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {
                    orderData?.paymentMethod === "Transferencia o depósito bancario" &&
                    <>
                        <div className="bank-details flex column">
                            <strong>Datos bancarios</strong>
                            <p style={{whiteSpace: "pre-line"}}>{bankData}</p>
                        </div>

                        <div className="total-details">
                            <div className="total-details-headCont">
                                <table className="total-details-head">
                                    <thead>
                                        <tr>
                                            <th className="total-details-productNameHead">Nombre del Producto</th>
                                            <th>Precio</th>
                                            <th>Cantidad</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderData.productsDataArr.map((itemData, index) =>
                                            <tr className="total-details-productRow" key={index}>
                                                <td className="orderForMail_productRow_desc">{itemData.description} / {itemData.code}</td>
                                                <td>{insertDotsInPrice(itemData.unitPrice)}</td>
                                                <td>{itemData.quantity}</td>
                                                <td>{insertDotsInPrice(itemData.total)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                                                       
                            <table className="total-details-resume">
                                <tbody>
                                    <tr>
                                        <td colSpan={3}>Total Neto</td>
                                        <td>{insertDotsInPrice(orderData.total)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3}>21% por IVA</td>
                                        <td>{insertDotsInPrice(orderData.total * 0.21)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3}>Total con IVA</td>
                                        <td>{insertDotsInPrice(orderData.total * 1.21)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3}>Si abonas ahora, obtenés un 10% de descuento</td>
                                        <td>{insertDotsInPrice(orderData.total * 1.21 * 0.9)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                }                    
            </div>
        </div>
    );
};

export default OrderForMail;

