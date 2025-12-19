import { useContext } from 'react';
import Button1 from '../../ui/button1/Button1';
import Modal, { ModalHeader, ModalBody, ModalFooter, ModalFooterChild } from '../../ui/modal1/Modal1';
import Icon from '../../../icon/Icon';
import { Modal2Context } from '../../../../context/modal2Context';
import { Modal2IconList } from '../../../../types/DASHBOARD';
import "./modal2.css";

const iconsList: {[key in Modal2IconList]: JSX.Element} = {
    warning: <Icon icon='HeroExclamationCircle' color='amber' size='text-7xl' className='dashBoard_modal1Icon'/>,
    success: <Icon icon='HeroCheckCircle' color='emerald' size='text-7xl' className='dashBoard_modal1Icon dashBoard_modal1Icon_opDown'/>,
    error: <Icon icon='HeroXCircle' color='red' size='text-7xl' className='dashBoard_modal1Icon dashBoard_modal1Icon_opDown'/>,
    info: <Icon icon='HeroInformationCircle' color='sky' size='text-7xl' className='dashBoard_modal1Icon'/>,
};

const Modal2 = () => {
   
    const {modal2State, setModal2} = useContext(Modal2Context);

    return (
        <Modal isOpen={modal2State.show} setIsOpen={() => setModal2({show: false})} isCentered rounded="rounded" size="sm">
            <ModalHeader className='dflex text-center'>
                {modal2State.icon ? iconsList[modal2State.icon as Modal2IconList] : iconsList.success}
                {modal2State.title}
            </ModalHeader>
            <ModalBody className='text-center my-4'>{modal2State.subtitle}</ModalBody>
            <ModalFooter>
                <ModalFooterChild>
                        <Button1 className='modal2_button' variant='solid' onClick={modal2State.firstButtonFunction}>{modal2State.firstButtonText || "OK"}</Button1>
                        {modal2State.secondButtonText && <Button1 className="modal2_button" variant='solid' color='red' onClick={modal2State.secondButtonFunction}>{modal2State.secondButtonText}</Button1>}
                </ModalFooterChild>
            </ModalFooter>
        </Modal>
    );
};

export default Modal2;