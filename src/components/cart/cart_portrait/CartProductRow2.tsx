import "./cart.css";

function CartProductRow2 (props: {description: string, unitPrice: string, totalPrice: string, code: number, quantity: number}) {
    
    return (
        <table className="cart-table cart-table_portrait cart-table_portrait_finalDetails">
            <tbody>
                <tr className="cartTable_productRow">
                    <td>Nombre del Producto</td>
                    <td>{props.description}</td>
                </tr>
                <tr>
                    <td>Precio + IVA</td>
                    <td>$ <span className="cartTablePortrait_prices">{(parseFloat(props.unitPrice) * 1.21).toFixed(2)}</span></td>
                </tr>
                <tr>
                    <td>Cantidad</td>
                    <td>{props.quantity}</td>
                </tr>
                <tr>
                    <td>Total</td>
                    <td>$ <span className="cartTablePortrait_prices">{(parseFloat(props.unitPrice) * 1.21 * props.quantity).toFixed(2)}</span></td>
                </tr>
            </tbody>
        </table>
    );
}

export default CartProductRow2;