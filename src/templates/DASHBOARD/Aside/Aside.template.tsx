import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import Aside, {
	AsideBody,
	AsideFooter,
	AsideHead,
} from '../../../components/layouts/DASHBOARD/Aside/Aside';
import Nav, {
	NavCollapse,
	NavItem,
	NavSeparator,
	NavTitle,
} from '../../../components/layouts/DASHBOARD/Navigation/Nav';
import { SpinnerContext } from '../../../context/spinnerContext';
import { showModal1 } from '../../../features/modalSlice';
import { syncProducts } from '../../../services/sync';
import DarkModeSwitcherPart from '../../layouts/Asides/_parts/DarkModeSwitcher.part';
import LogoAndAsideTogglePart from '../../layouts/Asides/_parts/LogoAndAsideToggle.part';
import UserTemplate from '../User/User.template';

const AsideTemplate = () => {
	const dispatch = useDispatch();
	const { showSpinner } = useContext(SpinnerContext);

	const syncData = async () => {
		showSpinner(true);
		const response = await syncProducts();
		showSpinner(false);
		dispatch(
			showModal1({
				show: true,
				info: {
					title: `${response.success ? 'Sincronización exitosa' : 'Ocurrió un error durante la sincronización'}`,
					subtitle: `${response.message}`,
					icon: response.success ? 'success' : 'error',
				},
			}),
		);
	};

	return (
		<Aside>
			<AsideHead>
				<LogoAndAsideTogglePart />
			</AsideHead>
			<AsideBody>
				<Nav>
					<NavItem to='/' text='Inicio' icon='HeroHome' />

					<NavSeparator />

					<NavTitle>Administración</NavTitle>

					<NavCollapse text='Usuarios' to='#' icon='HeroUsers'>
						<NavItem
							to='/crm/customer/list'
							text='Listado de usuarios'
							icon='HeroListBullet'
						/>
						{/* <NavItem
							to='/crm/sellers/list'
							text='Listado de vendedores'
							icon='HeroBanknotes'
						/> */}
						<NavItem
							to='/crm/logs/list'
							text='Log de usuarios'
							icon='HeroCircleStack'
						/>
						<NavItem
							to='/crm/leads/list'
							text='Leads potenciales'
							icon='HeroUserPlus'
						/>
						<NavItem
							to='/crm/reviews/list'
							text='Listado de reviews'
							icon='HeroClipboardDocumentList'
						/>
					</NavCollapse>

					<NavCollapse text='Productos' to='#' icon='HeroShoppingBag'>
						<NavItem
							to='/sales/product/list'
							text='Listado de productos'
							icon='HeroListBullet'
						/>
						<NavItem to='/sales/brandsList' text='Listado de marcas' icon='HeroMap' />
						<NavItem
							to='/sales/products/order'
							text='Ordenar productos'
							icon='HeroSquare3Stack3D'
						/>
						<NavItem
							to='/sales/priceMultiplier'
							text='Multiplicador de precios'
							icon='HeroBolt'
						/>
						<NavItem
							to='/sales/pricesGroupsList'
							text='Listado de grupos de precios'
							icon='HeroQueueList'
						/>
						<NavItem
							to='/sales/newsList'
							text='Listado de novedades'
							icon='HeroNewspaper'
						/>
						<NavItem
							to='/sales/clothsList'
							text='Listado de paños'
							icon='HeroTableCells'
						/>
						{/* <NavItem
							// to = '/ai/dashboard'
							text='Sincronizar precios y clientes'
							icon='HeroArrowPath'
							onClick={syncData}
						/> */}
					</NavCollapse>

					<NavCollapse text='Pedidos' to='#' icon='HeroSquare3Stack3D'>
						<NavItem
							to='/orders/list'
							text='Listado de pedidos'
							icon='HeroListBullet'
						/>
						<NavItem
							to='/order/inProcessOrders'
							text='Listado de pedidos en proceso'
							icon='HeroBars4'
						/>
						<NavItem
							to='/orders/shippingMethods/list'
							text='Listado de métodos de envíos'
							icon='HeroTableCells'
						/>
					</NavCollapse>

					<NavCollapse text='Sitio' to='#' icon='HeroHome'>
						<NavItem
							// to = '/ai/dashboard'
							text='Listado de slides Home'
							icon='HeroListBullet'
						/>
						<NavItem
							to='/siteConfiguration/faqsList'
							text='Listado de "cómo funciona"'
							icon='HeroQueueList'
						/>
						<NavItem
							to='/siteConfiguration/messagingsettingslist'
							text='Configuración de mensajería'
							icon='HeroEnvelope'
						/>
						<NavItem
							to='/siteConfiguration/generalSettings'
							text='Configuraciones generales'
							icon='HeroWrenchScrewdriver'
						/>
						<NavItem
							to='/siteConfiguration/report'
							text='Reporte'
							icon='HeroPresentationChartLine'
						/>
						<NavItem
							to='/siteConfiguration/notificationsLogs'
							text='Logs de notificaciones'
							icon='HeroPresentationChartBar'
						/>
						{/* <NavItem
							to='/siteConfiguration/habdesLogs'
							text='Logs de hab/des autom.'
							icon='HeroPresentationChartBar'
						/> */}
						<NavItem
							// to = '/ai/dashboard'
							text='Listado de Notas'
							icon='HeroSquare2Stack'
						/>
					</NavCollapse>

					<NavSeparator />
				</Nav>
			</AsideBody>
			<AsideFooter>
				<UserTemplate />
				<DarkModeSwitcherPart />
			</AsideFooter>
		</Aside>
	);
};

export default AsideTemplate;
