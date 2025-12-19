import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Icon from '../../../components/icon/Icon';
import { NavItem, NavSeparator } from '../../../components/layouts/Navigation/Nav';
import User from '../../../components/layouts/DASHBOARD/User/User';
import { logOut } from '../../../services/log';
import { clearUser } from '../../../features/userSlice';
import { RootState } from '../../../store';
import { saveLayoutDataInLocalStorage } from '../../../utils/utils';
import { clearSessionOfLocalStorage } from '../../../services/localStorage';

const UserTemplate = () => {
	
	const {pathname} = useLocation();
	const dispatch = useDispatch();
	const {name, email} = useSelector((state: RootState) => state.user.value);

	const signOut = () => {																			//Antes de cerrar sesion guardamos la ruta actual en el localstorage (para el usuario a ctual)
		saveLayoutDataInLocalStorage({data: {currentPath: pathname}, userEmail: email});
		clearSessionOfLocalStorage();
		localStorage.removeItem("dashtoken");
		dispatch(clearUser());
		logOut();
	};	

	return (
		<User
			name={name}
			nameSuffix={<Icon icon='HeroCheckBadge' color='blue' />}
			position={email}
			src="/images/icons/admin.png"
		>
			<NavSeparator />
			<NavItem text='Salir' icon='HeroArrowRightOnRectangle' onClick={signOut} />
		</User>
	);
};

export default UserTemplate;
