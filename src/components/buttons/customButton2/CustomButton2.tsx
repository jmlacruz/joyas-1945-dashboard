import "./customButton2.css";

function CustomButton2 (props: {text: string, onClickFunction?: () => void, styles?: object}) {
    return (
        <button onClick={props.onClickFunction} className="customButton2 flex" style={props.styles}>
            {props.text}
        </button>
    );
}

export default CustomButton2;