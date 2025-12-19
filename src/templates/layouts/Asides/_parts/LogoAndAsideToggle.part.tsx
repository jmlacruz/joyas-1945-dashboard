import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Visible from '../../../../components/utils/Visible';
import Icon from '../../../../components/icon/Icon';
import useAsideStatus from '../../../../hooks/useAsideStatus';
import LogoTemplate from '../../Logo/Logo.template';
import { RootState } from '../../../../store';
import { getLayoutDataFromLocalStorage, saveLayoutDataInLocalStorage } from '../../../../utils/utils';

const LogoAndAsideTogglePart = () => {

	const { asideStatus, setAsideStatus } = useAsideStatus();
	const { email } = useSelector((state: RootState) => state.user.value);
	
	/***************** Logica para guardar el estado del sidebar (expandido o colapsao) en el localstorage (por usuario) y restablecerlo con el inicio de sesion *****************/
	
	const saveAsideStatus = () => {
		const newValue = !asideStatus;
		setAsideStatus(newValue);
		saveLayoutDataInLocalStorage({data: {sideBarExpanded: newValue}, userEmail: email},);
	};

	useEffect(() => {
		const layoutDataOBJ = getLayoutDataFromLocalStorage(email);
		if (layoutDataOBJ) setAsideStatus(layoutDataOBJ.sideBarExpanded);
		//eslint-disable-next-line
	}, [email]);
		
	/***************************************************************************************************************************************************************************/

	return (
		<>
			<Visible is={asideStatus}>
				<Link to='/' aria-label='Logo'>
					<LogoTemplate className='h-12' />
				</Link>
			</Visible>
			<button
				type='button'
				aria-label='Toggle Aside Menu'
				onClick={saveAsideStatus}
				className='flex h-12 w-12 items-center justify-center'>
				<Icon
					icon={asideStatus ? 'HeroBars3BottomLeft' : 'HeroBars3'}
					className='text-2xl'
				/>
			</button>
		</>
	);
};

export default LogoAndAsideTogglePart;
