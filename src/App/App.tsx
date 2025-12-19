import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { StreamChat } from 'stream-chat';
import Modal1 from '../components/DASHBOARD/modals/modal1/Modal1';
import Modal2 from '../components/DASHBOARD/modals/modal2/Modal2';
import Wrapper from '../components/layouts/Wrapper/Wrapper';
import AsideRouter from '../components/router/AsideRouter';
import ContentRouter from '../components/router/ContentRouter';
import FooterRouter from '../components/router/FooterRouter';
import HeaderRouter from '../components/router/HeaderRouter';
import { SpinnerContext } from '../context/spinnerContext';
import { StreamChatContext } from '../context/streamChatContext';
import { clearUser, setUser } from '../features/userSlice';
import useFontSize from '../hooks/useFontSize';
import LoginPage from '../pages/DASHBOARD/loginPage/LoginPage';
import { usersLogs } from '../services/database';
import { clearSessionOfLocalStorage, getSessionOfLocalStorage } from '../services/localStorage';
import { isLogged, logOut } from '../services/log';
import { RootState } from '../store';
import getOS from '../utils/getOS.util';
import {
	getClientDevice,
	getClientDeviceInfo,
	getClientIP,
	getLayoutDataFromLocalStorage,
	saveLayoutDataInLocalStorage,
} from '../utils/utils';

const App = () => {
	getOS();

	const { fontSize } = useFontSize();
	dayjs.extend(localizedFormat);

	const { pathname } = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { isAdmin, registered, rememberme, email, userId, streamChatToken } = useSelector(
		(state: RootState) => state.user.value,
	);
	const { spinner } = useContext(SpinnerContext);
	const { streamChat } = useContext(StreamChatContext);
	const connectToStream = useRef(false);

	const getLayout = () => {
		if (pathname !== '/') return;
		const layoutData = getLayoutDataFromLocalStorage(email);
		if (!layoutData) return;
		const { currentPath } = layoutData; //Al entrar navegamos a la ruta guardada en localstorage (si la hay)..
		if (currentPath) navigate(currentPath); //..solo si la ruta de entrada es diferente a la del home ("/") (ya que si se trata de otra ruta es porque el usuario quiere ir a esa ruta especifica y no ser redirigido)
	};

	useEffect(() => {
		/********************************************** WebSockets ****************************************/

		(async () => {
			//Obtención de ensajes del chat de actividad de compra
			if (!registered || connectToStream.current) return;
			connectToStream.current = true;

			try {
				const client = StreamChat.getInstance('p75kvc6t5m5j');
				await client.connectUser(
					{
						id: userId,
						name: email,
					},
					streamChatToken,
				);
				const channel = client.channel('global', 'notifications');
				await channel.watch();

				streamChat.channel = channel; //Seteamos el contexto para compartir el canal de chat en otros componentes
			} catch (err) {
				err instanceof Error ? console.error(err.message) : console.error(err);
			}
		})();

		/******************************** Log de ingreso de admins ****************************************/

		(async () => {
			if (registered) {
				const userIP = await getClientIP();
				const deviceInfo = getClientDeviceInfo();
				const device = getClientDevice();
				await usersLogs({ userIP: userIP || '', deviceInfo, device, origin: 'Dashboard' });
			}
		})();

		/**************************************************************************************************/

		(async () => {
			//Verificación de sesión al recargar o entrar en la web
			const token = localStorage.getItem('dashtoken');
			if (!token) {
				// No hay token guardado, el usuario no está logueado
				clearSessionOfLocalStorage();
				dispatch(clearUser());
				navigate('/');
				return;
			}
			const response = await isLogged({ refreshData: true });
			if (!response.success) {
				clearSessionOfLocalStorage();
				localStorage.removeItem('dashtoken');
				dispatch(clearUser());
				navigate('/');
			} else {
				getLayout();
			}
		})();

		const sessionData = getSessionOfLocalStorage();
		if (sessionData) dispatch(setUser(sessionData));

		const verifySignOut = async () => {
			if (!rememberme) await logOut();
		};
		window.addEventListener('beforeunload', verifySignOut); //Al salir de la web nos deslogueamos si el usuario no tildó "Mantenerme logueado al loguearse"
		return () => window.removeEventListener('beforeunload', verifySignOut);

		// eslint-disable-next-line
	}, [registered]);

	useEffect(() => {
		//Guardamos la ruta actual en el localstorage cada vez que cambiamos de url
		if (email)
			saveLayoutDataInLocalStorage({ data: { currentPath: pathname }, userEmail: email });
		//eslint-disable-next-line
	}, [pathname]);

	return (
		<>
			<style>{`:root {font-size: ${fontSize}px}`}</style>
			<div data-component-name='App' className='flex grow flex-col'>
				{spinner}
				<Modal1 />
				<Modal2 />
				{isAdmin && registered && (
					<>
						<AsideRouter />
						<Wrapper>
							<HeaderRouter />
							<ContentRouter />
							<FooterRouter />
						</Wrapper>
					</>
				)}
				{!registered && (
					<Routes>
						<Route path='*' element={<LoginPage />} />
					</Routes>
				)}
			</div>
		</>
	);
};

export default App;
