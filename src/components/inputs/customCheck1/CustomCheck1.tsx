import "./customCheck1.css";
import { useState, useEffect } from "react";
import { Rubro } from "../../../types/database";

function CustomCheck1 (props: {text: string, styles?: object, name?: Rubro | "newsletter", onCheckedFunction?: (name: Rubro) => void, checked?: boolean}) {

    const [checked, setChecked] = useState(props.checked || false);

    useEffect(() => {
        setChecked(props.checked || false);
    }, [props]);
    
    const handleChecked = (e: React.ChangeEvent) => {
        const input = e.target as HTMLInputElement;
        setChecked((current) => !current);
        props.onCheckedFunction && props.onCheckedFunction(input.name as Rubro);
    };   

    return (
        <div className="customCheck1_Cont flex" style={props.styles}>
            <div className="customCheck1_checkBox flex">
                <input type="checkbox" className="customCheck1_checkBoxHidden" name={props.name} checked={checked} onChange={handleChecked}/>
                <div className="customCheck1_checkBoxShown flex"></div>
            </div>
            <p className="customCheck1_checkBoxText">{props.text}</p>
        </div>
    );
}

export default CustomCheck1;