import { RouteProps } from 'react-router-dom';
import DefaultFooterTemplate from '../templates/layouts/Footers/DefaultFooter.template';

const footerRoutes: RouteProps[] = [
	{ path: '*', element: <DefaultFooterTemplate /> },
];

export default footerRoutes;
