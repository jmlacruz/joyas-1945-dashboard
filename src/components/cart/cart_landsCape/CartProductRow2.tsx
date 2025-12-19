import "./cart.css";

function CartProductRow2 (props: {description: string, unitPrice: string, totalPrice: string, code: number, quantity: number}) {
    
    return (
        <tr className="cartTable_productRow">
            <td className="product-info">
                <p className="cartTable_descriptionText cartTable2_descriptionText">{props.description} / <span>{props.code}</span></p>
            </td>
            <td className="cartTable_prices_texts">${props.unitPrice}</td>
            <td>{props.quantity}</td>
            <td className="cartTable_prices_texts">${props.totalPrice}</td>
        </tr>
    );
}

export default CartProductRow2;