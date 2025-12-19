import React, { useState, useContext } from 'react';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FieldWrap from '../../form/FieldWrap';
import Icon from '../../icon/Icon';
import Input from '../../form/Input';
import Button from '../../ui/Button';
import Validation from '../../form/Validation';
import "./loginForm.css";
import { loginUser } from '../../../services/log';
import { setUser, clearUser } from '../../../features/userSlice';
import { SessionUserData } from '../../../types/DASHBOARD';
import { showModal1 } from '../../../features/modalSlice';
import { saveSessionDataInLocalStorage, clearSessionOfLocalStorage } from '../../../services/localStorage';
import Card from '../../ui/Card';
import ThemeContext from '../../../context/themeContext';
import { getClientDevice, getClientDeviceInfo, getClientIP } from '../../../utils/utils';
import { usersLogs } from '../../../services/database';

type TValues = {
    email: string;
    password: string;
};

const LoginForm = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [passwordShowStatus, setPasswordShowStatus] = useState <boolean> (false);
    const { isDarkTheme } = useContext(ThemeContext); 
            
    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validate: (values: TValues) => {
            const errors: Partial<TValues> = {};

            if (!values.email) {
                errors.email = 'Campo requerido';
            } 

            if (!values.password) {
                errors.password = 'Campo requerido';
            } 

            return errors;
        },
        onSubmit: async () => { 
            const response = await loginUser({email: formik.values.email, password: formik.values.password, rememberme: true});      
            if (response.success && response.data) {
                const sessionData = response.data as SessionUserData;
                if (sessionData.isAdmin) {
                    saveSessionDataInLocalStorage(sessionData);
                    localStorage.setItem("dashtoken", sessionData.token);
                    dispatch(setUser(sessionData));
                    navigate("/");
                } else {
                    clearSessionOfLocalStorage();
                    localStorage.removeItem("dashtoken");
                    dispatch(clearUser());
                    dispatch(showModal1({show: true, info: {title: "Credenciales Inválidas", subtitle: "Intente Nuevamente", icon: "warning"}}));          
                }
            } else {
                const userIP = await getClientIP();                                                                                                                              //Log de usuario con error de ingreso (email y/o contraseña incorrectos)
                const deviceInfo = getClientDeviceInfo();
                const device = getClientDevice();
                await usersLogs({userIP: userIP || "", deviceInfo, device, loginError: {email: formik.values.email, password: formik.values.password}, origin: "Dashboard"});    //Solo ponemos el objeto "loginError" si hay error de login, de lo contrario no ponemos nada

                clearSessionOfLocalStorage();
                dispatch(clearUser());
                dispatch(showModal1({show: true, info: {title: "Credenciales Inválidas", subtitle: "Intente Nuevamente", icon: "warning"}}));                   
            }
        },
    });

    return (
        <Card className='dashBoard_loginForm_cardCont p-16'>
            <form className='flex flex-col gap-4 dashBoard_loginFormCont' noValidate>
                <img src={`/images/logos/${isDarkTheme ? "white.png" : "black.png"}`} alt="Logo" className='w-1/3 object-contain mb-3'/>
                <p className='font-medium mb-0 text-lg text-zinc-500'>Inicia sesión en tu cuenta</p>
                <div>
                    <Validation
                        isValid={formik.isValid}
                        isTouched={formik.touched.email}
                        invalidFeedback={formik.errors.email}
                        validFeedback='Good'>
                        <FieldWrap firstSuffix={<Icon icon='HeroEnvelope' className='mx-2' />}>
                            <Input
                                dimension='lg'
                                id='email'
                                autoComplete='email'
                                name='email'
                                placeholder='Email'
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </FieldWrap>
                    </Validation>
                </div>

                <div>
                    <Validation
                        isValid={formik.isValid}
                        isTouched={formik.touched.password}
                        invalidFeedback={formik.errors.password}
                        validFeedback='Good'>
                        <FieldWrap
                            firstSuffix={<Icon icon='HeroKey' className='mx-2' />}
                            lastSuffix={
                                <Icon
                                    className='mx-2 cursor-pointer'
                                    icon={passwordShowStatus ? 'HeroEyeSlash' : 'HeroEye'}
                                    onClick={() => {
                                        setPasswordShowStatus(!passwordShowStatus);
                                    }}
                                />
                            }>
                            <Input
                                dimension='lg'
                                type={passwordShowStatus ? 'text' : 'password'}
                                autoComplete='current-password'
                                id='password'
                                name='password'
                                placeholder='Password'
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </FieldWrap>
                    </Validation>
                </div>

                <div>
                    <Button
                        size='lg'
                        variant='solid'
                        className='w-full font-semibold'
                        onClick={() => formik.handleSubmit()}>
                        Iniciar sesión
                    </Button>
                </div>
                <span className='text-zinc-500 text-sm mt-3'>
                    Este sitio está protegido por reCAPTCHA y la Política de Privacidad de Google.
                </span>
            </form>
        </Card>
    );
};

export default LoginForm;
