import "./addButton.css";

function AddButton (props: {width?: number, bgColor?: string, quantity: number, addFunction: () => void, susFunction: () => void})  {

    return (
        <div className="addButtonCont flex" style={{width: `${props.width}rem`, backgroundColor: props.bgColor}}>
            <p className="addButton_control addButton_control_sus flex" onClick={() => props.susFunction()}>-</p>
            <div className="addButton_quantity flex">{props.quantity}</div>
            <p className="addButton_control addButton_control_add flex" onClick={() => props.addFunction()}>+</p>
        </div>
    );
}

export default AddButton;