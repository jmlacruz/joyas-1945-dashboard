import { RouteProps } from 'react-router-dom';
import AsideTemplate from '../templates/DASHBOARD/Aside/Aside.template';

const asideRoutes: RouteProps[] = [
	{ path: '*', element: <AsideTemplate /> },
];

export default asideRoutes;
