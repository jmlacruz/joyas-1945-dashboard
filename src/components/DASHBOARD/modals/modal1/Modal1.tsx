import { useDispatch, useSelector } from 'react-redux';
import { useContext, useEffect } from 'react';
import Button1 from '../../ui/button1/Button1';
import Modal, { ModalHeader, ModalBody, ModalFooter, ModalFooterChild } from '../../ui/modal1/Modal1';
import { RootState } from '../../../../store';
import { showModal1, closeModal1 } from '../../../../features/modalSlice';
import Icon from '../../../icon/Icon';
import { Modal2Context } from '../../../../context/modal2Context';

const iconsList = {
    warning: <Icon icon='HeroExclamationCircle' color='amber' size='text-7xl' className='dashBoard_modal1Icon'/>,
    success: <Icon icon='HeroCheckCircle' color='emerald' size='text-7xl' className='dashBoard_modal1Icon dashBoard_modal1Icon_opDown'/>,
    error: <Icon icon='HeroXCircle' color='red' size='text-7xl' className='dashBoard_modal1Icon dashBoard_modal1Icon_opDown'/>,
    info: <Icon icon='HeroInformationCircle' color='sky' size='text-7xl' className='dashBoard_modal1Icon'/>,
};

const Modal1 = () => {
    const dispatch = useDispatch();
    const { show, info } = useSelector((state: RootState) => state.modal1.value); 
    const { setModal2 } = useContext(Modal2Context);

    useEffect(() => {
        setModal2({show: false});                                                                       //Cerramos el modal de opciones por si esta abierto, antes de abrir el otro modal1
        //eslint-disable-next-line
    }, [show]);
    
    const closeModal = () => {
        dispatch(closeModal1());
    };

    const isAcceptedAction = () => {
        dispatch(showModal1({show: false, isAccepted: true, isCanceled: false}));
    };

    const isCanceledAction = () => {
        dispatch(showModal1({show: false, isCanceled: true, isAccepted: false}));
    };

    return (
        <Modal isOpen={show} setIsOpen={closeModal} isCentered rounded="rounded" size="sm">
            <ModalHeader className='dflex text-center'>
                {info ? iconsList[info.icon] : ""}
                {info?.title}
            </ModalHeader>
            <ModalBody className='text-center'>{info?.subtitle}</ModalBody>
            <ModalFooter>
                <ModalFooterChild>
                        <Button1 variant='solid' onClick={info?.showCancelButton ? isAcceptedAction : closeModal}>{info && info.acceptButtonText ? info.acceptButtonText : "OK"}</Button1>
                        {info?.showCancelButton && <Button1 variant='solid' onClick={isCanceledAction}>{info.cancelButtonText || "CANCELAR"}</Button1>}
                </ModalFooterChild>
            </ModalFooter>
        </Modal>
    );
};

export default Modal1;