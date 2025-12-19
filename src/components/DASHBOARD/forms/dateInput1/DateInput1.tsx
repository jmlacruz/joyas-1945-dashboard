import React, { useState, useRef, useEffect } from 'react';
import "./dateInput1.css";
import Input from '../../../form/Input';

const DateInput1 = (props: {inputChangeFunction: (date: string) => void, defaultValue?: string, setValue?: string}) => {
    const {inputChangeFunction, defaultValue, setValue} = props;
    const [date, setDate] = useState('');
    const dateInputRef = useRef <HTMLInputElement | null> (null);

    useEffect(() => {
        inputChangeFunction(date);
        //eslint-disable-next-line
    }, [date])

    useEffect(() => {
        if (!setValue) return;
        setDate(setValue);
        //eslint-disable-next-line
    }, [setValue])
    
    const formatDateToDisplay = (dateString: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;                                                       //Formato que se muestra en el input
    };

    const handleDateChange = (e: React.ChangeEvent <HTMLInputElement> ) => {
        const inputDate = e.target.value;
        setDate(formatDateToDisplay(inputDate));
    };

    const formatDateToISO = (dateString: string) => {
        if (!dateString) return '';
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;                                                       //Formato aceptado por la base de datos
    };

    const handleInputClick = () => {
        if(!dateInputRef.current) return;
        if (date) {
            dateInputRef.current.value = formatDateToISO(date);
        }
        dateInputRef.current.showPicker();
    };

    return (
        <div className='dateInput1_mainCont'>
            <Input
                name=""
                type='date'
                className='dateInput1_originalInput'
                readOnly
            />
            <div className='dateInput1Cont'>
                <input
                    type="text"
                    value={date || defaultValue}
                    onClick={handleInputClick}
                    onChange={() => {}}
                    className='dateInput1_inputShowed'
                />
                <input
                    type="date"
                    ref={dateInputRef}
                    onChange={handleDateChange}
                    className='dateInput1_inputHidden'
                />
            </div>
        </div>
        
    );
};

export default DateInput1;