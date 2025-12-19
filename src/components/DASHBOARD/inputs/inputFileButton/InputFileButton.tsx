import React from "react";
import Button from "../../../ui/Button";

const InputFileButton = (props: {handleInputFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void}) => {
    const { handleInputFileChange } = props;
    const inputRef = React.useRef<HTMLInputElement>(null);

    const attach = () => inputRef.current?.click();

    return (
        <Button icon="HeroPlusSmall" style={{backgroundColor: "var(--color-web-1)"}} className="h-10 min-w-56 rounded-lg !text-white cursor-pointer" onClick={attach}>
                <span className="text-white !pointer-events-none">Agregar imagen</span>
                <input
                    id='foto1'
                    name='foto1'
                    type='file'
                    className='sr-only'
                    onChange={handleInputFileChange}
                    accept="image/*"
                    ref={inputRef}
                />
        </Button>
    );
};

export default InputFileButton;