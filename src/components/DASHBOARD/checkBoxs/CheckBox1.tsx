import { useFormik } from 'formik';
import { useEffect, useRef } from 'react';
import Checkbox, { CheckboxGroup } from '../../form/Checkbox';
import "./checkBox.css";

const CheckBox1 = (props: {text: string, checkedFunction: (status: boolean, dataOutput?: any) => void, dataInput?: any, defaultValue?: boolean} ) => {
    const {text, checkedFunction, defaultValue, dataInput} = props;

    const initialValue = useRef (defaultValue !== false);

    const formik = useFormik({
        initialValues: {
            optionA: defaultValue !== false,
        },
        onSubmit: () => {},
    });

    useEffect(() => {
        
        if (initialValue.current !== formik.values.optionA) {
            initialValue.current = formik.values.optionA;
            checkedFunction(formik.values.optionA, dataInput);
        }
        // eslint-disable-next-line 
    }, [formik.values.optionA])
              
    return (
        <div>
             <CheckboxGroup isInline>
                <Checkbox
                    label={text}
                    id='optionA'
                    variant='switch'
                    onChange={formik.handleChange}
                    checked={formik.values.optionA}
                    className='checkBox1'
                />
            </CheckboxGroup>
        </div>
    );
};

export default CheckBox1;
