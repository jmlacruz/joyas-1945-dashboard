import { lazy } from 'react';
import { RouteProps } from 'react-router-dom';
import { appPages, componentsPages, examplePages } from '../config/pages.config';
import UsersActivityPage from '../pages/DASHBOARD/usersActivity/UsersActivity.page';
import NotFoundPage from '../pages/NotFound.page';
import CustomerJoyasNewPage from '../pages/crm/customer/CustomerJoyasNewPage/CustomerJoyasNew.page';
import CustomerJoyasListPage from '../pages/crm/customer/CustomerListPage/CustomerJoyasList.page';
import LeadNewPage from '../pages/crm/customer/LeadNewPage/LeadNew.page';
import LeadEditPage from '../pages/crm/customer/LeadPage/Lead.page';
import LeadsListPage from '../pages/crm/customer/LeadsListPage/LeadsList.page';
import ReviewPage from '../pages/crm/customer/ReviewPage/Review.page';
import ReviewsListPage from '../pages/crm/customer/ReviewsListPage/ReviewsList.page';
import SellerNewPage from '../pages/crm/customer/SellerNewPage/SellerNew.page';
import SellerPage from '../pages/crm/customer/SellerPage/Seller.page';
import UsersLogsPage from '../pages/crm/customer/UsersLogsPage/UsersLogs.page';
import InProcessOrdersListPage from '../pages/orders/InProcessOrdersListPage/InProcessOrdersListPage';
import OrderPage from '../pages/orders/OrderPage/Order.page';
import OrderViewPage from '../pages/orders/OrderViewPage/OrderView.page';
import OrdersListPage from '../pages/orders/OrdersListPage/OrdersList.page';
import ShippingMethodNewPage from '../pages/orders/ShippingMethodNewPage/ShippingMethodNew.page';
import ShippingMethodPage from '../pages/orders/ShippingMethodPage/ShippingMethod.page';
import ShippingMethodsListPage from '../pages/orders/ShippingMethodsListPage/ShippingMethodsList.page';
import BrandNewPage from '../pages/sales/products/BrandNewPage/BrandNew.page';
import BrandPage from '../pages/sales/products/BrandPage/Brand.page';
import BrandsListPage from '../pages/sales/products/BrandsListPage/BrandsList.page';
import ClothNewPage from '../pages/sales/products/ClothNewPage/ClothNew.page';
import ClothPage from '../pages/sales/products/ClothPage/Cloth.page';
import ClothsListPage from '../pages/sales/products/ClothsListPage/ClothsList.page';
import NewsListPage from '../pages/sales/products/NewsListPage/NewsList.page';
import NewsPage from '../pages/sales/products/NewsPage/News.page';
import PriceMultiplierPage from '../pages/sales/products/PriceMultiplierPage/PriceMultiplier.page';
import PricesGroupNewPage from '../pages/sales/products/PricesGroupNewPage/PricesGroupNew.page';
import PricesGroup from '../pages/sales/products/PricesGroupPage/PricesGroup.page';
import PricesGroupsListPage from '../pages/sales/products/PricesGroupsListPage/PricesGroupsList.page';
import ProductJoyasNewpage from '../pages/sales/products/ProductJoyasNewPage/ProductJoyasNew.page';
import ProductJoyasListPage from '../pages/sales/products/ProductListPage/ProductJoyasList.page';
import ProductsOrderPage from '../pages/sales/products/ProductsOrder/ProductsOrder.page';
import FaqPage from '../pages/siteConfiguration/Faq/Faq';
import FaqsListPage from '../pages/siteConfiguration/FaqsList/FaqsList.page';
import NewFaqPage from '../pages/siteConfiguration/NewFaq/NewFaq';
import NotificationsLogsPage from '../pages/siteConfiguration/NotificationsLogsPage/NotificationsLogs.page';
import ReportListPage from '../pages/siteConfiguration/Report/ReportList.page';
import GeneralSettingsPage from '../pages/siteConfiguration/generalSettings/General.settings.page';
import MessagingsettingsPage from '../pages/siteConfiguration/messagingsettings/Messagingsettings.page';
import MessagingsettingsListPage from '../pages/siteConfiguration/messagingsettings/MessagingsettingsList.page';

/**
 * UI
 */
const AlertPage = lazy(() => import('../pages/componentsAndTemplates/ui/AlertPage/Alert.page'));
const BadgePage = lazy(() => import('../pages/componentsAndTemplates/ui/BadgePage/Badge.page'));
const ButtonPage = lazy(() => import('../pages/componentsAndTemplates/ui/ButtonPage/Button.page'));
const ButtonGroupPage = lazy(
	() => import('../pages/componentsAndTemplates/ui/ButtonGroup/ButtonGroup.page'),
);
const CardPage = lazy(() => import('../pages/componentsAndTemplates/ui/CardPage/Card.page'));
const CollapsePage = lazy(
	() => import('../pages/componentsAndTemplates/ui/CollapsePage/Collapse.page'),
);
const DropdownPage = lazy(
	() => import('../pages/componentsAndTemplates/ui/DropdownPage/Dropdown.page'),
);
const ModalPage = lazy(() => import('../pages/componentsAndTemplates/ui/ModalPage/Modal.page'));
const OffcanvasPage = lazy(
	() => import('../pages/componentsAndTemplates/ui/OffcanvasPage/Offcanvas.page'),
);
const ProgressPage = lazy(
	() => import('../pages/componentsAndTemplates/ui/ProgressPage/Progress.page'),
);
const TablePage = lazy(() => import('../pages/componentsAndTemplates/ui/TablePage/Table.page'));
const TooltipPage = lazy(
	() => import('../pages/componentsAndTemplates/ui/TooltipPage/Tooltip.page'),
);

/**
 * FORM
 */
const FieldWrapPage = lazy(
	() => import('../pages/componentsAndTemplates/form/FieldWrapPage/FieldWrap.page'),
);
const CheckboxPage = lazy(
	() => import('../pages/componentsAndTemplates/form/CheckboxPage/Checkbox.page'),
);
const CheckboxGroupPage = lazy(
	() => import('../pages/componentsAndTemplates/form/CheckboxGroupPage/CheckboxGroup.page'),
);
const InputPage = lazy(() => import('../pages/componentsAndTemplates/form/InputPage/Input.page'));
const LabelPage = lazy(() => import('../pages/componentsAndTemplates/form/LabelPage/Label.page'));
const RadioPage = lazy(() => import('../pages/componentsAndTemplates/form/RadioPage/Radio.page'));
const RichTextPage = lazy(
	() => import('../pages/componentsAndTemplates/form/RichTextPage/RichText.page'),
);
const SelectPage = lazy(
	() => import('../pages/componentsAndTemplates/form/SelectPage/Select.page'),
);
const SelectReactPage = lazy(
	() => import('../pages/componentsAndTemplates/form/SelectReactPage/SelectReact.page'),
);
const TextareaPage = lazy(
	() => import('../pages/componentsAndTemplates/form/TextareaPage/Textarea.page'),
);
const ValidationPage = lazy(
	() => import('../pages/componentsAndTemplates/form/ValidationPage/Validation.page'),
);

/**
 * Integrated
 */
const ReactDateRangePage = lazy(
	() =>
		import('../pages/componentsAndTemplates/integrated/ReactDateRangePage/ReactDateRange.page'),
);
const FullCalendarPage = lazy(
	() => import('../pages/componentsAndTemplates/integrated/FullCalendarPage/FullCalendarPage'),
);
const ApexChartsPage = lazy(
	() => import('../pages/componentsAndTemplates/integrated/ApexChartsPage/ApexCharts.page'),
);
const ReactSimpleMapsPage = lazy(
	() =>
		import(
			'../pages/componentsAndTemplates/integrated/ReactSimpleMapsPage/ReactSimpleMaps.page'
		),
);
const WaveSurferPage = lazy(
	() => import('../pages/componentsAndTemplates/integrated/WaveSurferPage/WaveSurfer.page'),
);

/**
 * Icons
 */
const IconPage = lazy(() => import('../pages/componentsAndTemplates/icons/IconPage/Icon.page'));
const HeroiconsPage = lazy(
	() => import('../pages/componentsAndTemplates/icons/HeroiconsPage/Heroicons.page'),
);
const DuotoneIconsPage = lazy(
	() => import('../pages/componentsAndTemplates/icons/DuotoneIconsPage/DuotoneIcons.page'),
);

/**
 * SALES
 */
// const SalesDashboardPage = lazy(
// 	() => import('../pages/sales/SalesDashboardPage/SalesDashboard.page'),
// );
// const ProductListPage = lazy(
// 	() => import('../pages/sales/products/ProductListPage/ProductList.page'),

// );
// const ProductListJoyasPage = lazy(
// 	() => import('../pages/sales/products/ProductListPage/ProductJoyasList.page'),
// );
// const ProductPage = lazy(() => import('../pages/sales/products/ProductPage/Product.page'));
const ProductJoyasPage = lazy(
	() => import('../pages/sales/products/ProductPage/ProductJoyas.page'),
);
const CategoryListPage = lazy(
	() => import('../pages/sales/categories/CategoryListPage/CategoryList.page'),
);
const CategoryPage = lazy(() => import('../pages/sales/categories/CategoryPage/Category.page'));

/**
 * CRM
 */
const CustomerDashboardPage = lazy(
	() => import('../pages/crm/CustomerDashboardPage/CustomerDashboard.page'),
);
// const CustomerListPage = lazy(
// 	() => import('../pages/crm/customer/CustomerListPage/CustomerJoyasList.page'),
// );
// const CustomerPage = lazy(() => import('../pages/crm/customer/CustomerPage/Customer.page'));
const CustomerPage = lazy(() => import('../pages/crm/customer/CustomerPage/CustomerJoyas.page'));
const RoleListPage = lazy(() => import('../pages/crm/role/RoleListPage/RoleList.page'));
const RolePage = lazy(() => import('../pages/crm/role/RolePage/Role.page'));

/**
 * Project
 */
const ProjectDashboardPage = lazy(
	() => import('../pages/project/ProjectDashboardPage/ProjectDashboard.page'),
);
const ProjectBoardPage = lazy(() => import('../pages/project/ProjectBoardPage/ProjectBoard.page'));

const ExamplesPage = lazy(() => import('../pages/ExamplePage/Examples.page'));
// const ProfilePage = lazy(() => import('../pages/Profile.page'));

/**
 * AI
 */
const AiDashboardPage = lazy(() => import('../pages/ai/AiDashboardPage/AiDashboard.page'));
const ChatPhotoPage = lazy(() => import('../pages/ai/chat/ChatPhotoPage/ChatPhoto.page'));
const ChatVideoPage = lazy(() => import('../pages/ai/chat/ChatVideoPage/ChatVideo.page'));
const ChatAudioPage = lazy(() => import('../pages/ai/chat/ChatAudioPage/ChatAudio.page'));
const ChatCodePage = lazy(() => import('../pages/ai/chat/ChatCodePage/ChatCode.page'));

/**
 * CHAT
 */
const ChatPage = lazy(() => import('../pages/ChatPage/Chat.page'));

/**
 * Other
 */
const UnderConstructionPage = lazy(() => import('../pages/UnderConstruction.page'));

const contentRoutes: RouteProps[] = [
	/**
	 * SALES::BEGIN
	 */
	{
		path: appPages.salesAppPages.subPages.salesDashboardPage.to,
		element: <UsersActivityPage />,
	},
	{
		path: appPages.salesAppPages.subPages.productPage.subPages.newProductPage.to,
		element: <ProductJoyasNewpage />,
	},
	{
		path: `${appPages.salesAppPages.subPages.productPage.subPages.listPage.to}/:id?`,
		element: <ProductJoyasListPage />,
	},
	{
		path: `${appPages.salesAppPages.subPages.productPage.subPages.editPageLink.to}/:id`,
		element: <ProductJoyasPage />,
	},
	{
		path: appPages.salesAppPages.subPages.productPage.subPages.priceMultiplierPage.to,
		element: <PriceMultiplierPage />,
	},
	{
		path: appPages.salesAppPages.subPages.productPage.subPages.pricesGroupsListPage.to,
		element: <PricesGroupsListPage />,
	},
	{
		path: `${appPages.salesAppPages.subPages.productPage.subPages.pricesGroupEditPage.to}/:id`,
		element: <PricesGroup />,
	},
	{
		path: appPages.salesAppPages.subPages.productPage.subPages.pricesGroupNewPage.to,
		element: <PricesGroupNewPage />,
	},
	{
		path: appPages.salesAppPages.subPages.productPage.subPages.BrandsListPage.to,
		element: <BrandsListPage />,
	},
	{
		path: `${appPages.salesAppPages.subPages.productPage.subPages.BrandEditPage.to}/:id`,
		element: <BrandPage />,
	},
	{
		path: appPages.salesAppPages.subPages.productPage.subPages.BrandNewPage.to,
		element: <BrandNewPage />,
	},
	{
		path: appPages.salesAppPages.subPages.productPage.subPages.NewsListPage.to,
		element: <NewsListPage />,
	},
	{
		path: `${appPages.salesAppPages.subPages.productPage.subPages.NewsEditPage.to}/:id`,
		element: <NewsPage />,
	},

	{
		path: appPages.salesAppPages.subPages.productPage.subPages.ClothsListPage.to,
		element: <ClothsListPage />,
	},
	{
		path: `${appPages.salesAppPages.subPages.productPage.subPages.ClothEditPage.to}/:id`,
		element: <ClothPage />,
	},
	{
		path: appPages.salesAppPages.subPages.productPage.subPages.ClothNewPage.to,
		element: <ClothNewPage />,
	},
	{
		path: appPages.salesAppPages.subPages.productPage.subPages.OrderPage.to,
		element: <ProductsOrderPage />,
	},
	{
		path: appPages.salesAppPages.subPages.categoryPage.subPages.listPage.to,
		element: <CategoryListPage />,
	},
	{
		path: `${appPages.salesAppPages.subPages.categoryPage.subPages.editPageLink.to}/:id`,
		element: <CategoryPage />,
	},
	/**
	 * SALES::END
	 */

	/**
	 * CRM::BEGIN
	 */
	{
		path: appPages.crmAppPages.subPages.crmDashboardPage.to,
		element: <CustomerDashboardPage />,
	},

	{
		path: appPages.crmAppPages.subPages.customerPage.subPages.listPage.to,
		element: <CustomerJoyasListPage />,
	},
	{
		path: appPages.crmAppPages.subPages.customerPage.subPages.newUserPage.to,
		element: <CustomerJoyasNewPage />,
	},
	{
		path: `${appPages.crmAppPages.subPages.customerPage.subPages.editPageLink.to}/:id`,
		element: <CustomerPage />,
	},
	{
		path: `${appPages.crmAppPages.subPages.customerPage.subPages.sellerEditPage.to}/:id`,
		element: <SellerPage />,
	},
	{
		path: appPages.crmAppPages.subPages.customerPage.subPages.sellerNewPage.to,
		element: <SellerNewPage />,
	},
	{
		path: appPages.crmAppPages.subPages.customerPage.subPages.usersLogsPage.to,
		element: <UsersLogsPage />,
	},
	{
		path: appPages.crmAppPages.subPages.customerPage.subPages.reviewsListPage.to,
		element: <ReviewsListPage />,
	},
	{
		path: `${appPages.crmAppPages.subPages.customerPage.subPages.reviewEditPage.to}/:id`,
		element: <ReviewPage />,
	},
	{
		path: appPages.crmAppPages.subPages.customerPage.subPages.leadsListPage.to,
		element: <LeadsListPage />,
	},
	{
		path: `${appPages.crmAppPages.subPages.customerPage.subPages.leadEditPage.to}/:id`,
		element: <LeadEditPage />,
	},
	{
		path: appPages.crmAppPages.subPages.customerPage.subPages.leadNewPage.to,
		element: <LeadNewPage />,
	},

	{
		path: appPages.crmAppPages.subPages.rolePage.subPages.listPage.to,
		element: <RoleListPage />,
	},
	{
		path: `${appPages.crmAppPages.subPages.rolePage.subPages.editPageLink.to}/:id`,
		element: <RolePage />,
	},

	{
		path: appPages.siteConfigurationAppPages.subPages.siteConfigurationPage.subPages
			.messagingsettingsListPage.to,
		element: <MessagingsettingsListPage />,
	},
	{
		path: `${appPages.siteConfigurationAppPages.subPages.siteConfigurationPage.subPages.messagingsettingsPage.to}/:id`,
		element: <MessagingsettingsPage />,
	},
	{
		path: `${appPages.siteConfigurationAppPages.subPages.siteConfigurationPage.subPages.faqsListPage.to}`,
		element: <FaqsListPage />,
	},
	{
		path: `${appPages.siteConfigurationAppPages.subPages.siteConfigurationPage.subPages.faqPage.to}/:id`,
		element: <FaqPage />,
	},
	{
		path: appPages.siteConfigurationAppPages.subPages.siteConfigurationPage.subPages.newFaqPage
			.to,
		element: <NewFaqPage />,
	},
	{
		path: appPages.siteConfigurationAppPages.subPages.siteConfigurationPage.subPages
			.generalSettingsPage.to,
		element: <GeneralSettingsPage />,
	},
	{
		path: appPages.siteConfigurationAppPages.subPages.siteConfigurationPage.subPages.reportPage
			.to,
		element: <ReportListPage />,
	},
	{
		path: appPages.siteConfigurationAppPages.subPages.siteConfigurationPage.subPages
			.notificationsLogsPage.to,
		element: <NotificationsLogsPage />,
	},

	/**
	 * CRM::END
	 */

	/**
	 * ORDERS::BEGIN
	 */

	{
		path: appPages.ordersAppPage.subPages.ordersPages.shippingMethodsListPage.to,
		element: <ShippingMethodsListPage />,
	},
	{
		path: appPages.ordersAppPage.subPages.ordersPages.shippingMethodNewPage.to,
		element: <ShippingMethodNewPage />,
	},
	{
		path: `${appPages.ordersAppPage.subPages.ordersPages.shippingMethodEditPage.to}/:id`,
		element: <ShippingMethodPage />,
	},
	{
		path: appPages.ordersAppPage.subPages.ordersPages.ordersListPage.to,
		element: <OrdersListPage />,
	},
	{
		path: `${appPages.ordersAppPage.subPages.ordersPages.orderEditPage.to}/:id`,
		element: <OrderPage />,
	},
	{
		path: `${appPages.ordersAppPage.subPages.ordersPages.orderViewPage.to}/:id/:print?`,
		element: <OrderViewPage />,
	},
	{
		path: appPages.ordersAppPage.subPages.ordersPages.processedOrdersListPage.to,
		element: <InProcessOrdersListPage />,
	},

	/**
	 * ORDERS::END
	 */

	/**
	 * Project::BEGIN
	 */

	{
		path: appPages.projectAppPages.subPages.projectDashboardPage.to,
		element: <ProjectDashboardPage />,
	},
	{
		path: `${appPages.projectAppPages.subPages.projectBoardPageLink.to}/:id`,
		element: <ProjectBoardPage />,
	},
	/**
	 * Project::END
	 */

	/**
	 * AI::BEGIN
	 */
	{
		path: appPages.aiAppPages.subPages.chatPages.subPages.photoPage.to,
		element: <ChatPhotoPage />,
	},
	{
		path: appPages.aiAppPages.subPages.chatPages.subPages.videoPage.to,
		element: <ChatVideoPage />,
	},
	{
		path: appPages.aiAppPages.subPages.chatPages.subPages.audioPage.to,
		element: <ChatAudioPage />,
	},
	{
		path: appPages.aiAppPages.subPages.chatPages.subPages.codePage.to,
		element: <ChatCodePage />,
	},
	/**
	 * AI::END
	 */

	/**
	 * EDUCATION::BEGIN
	 */
	{
		path: appPages.educationAppPages.to,
		element: <UnderConstructionPage />,
	},
	/**
	 * EDUCATION::END
	 */

	/**
	 * RESERVATION::BEGIN
	 */
	{
		path: appPages.reservationAppPages.to,
		element: <UnderConstructionPage />,
	},
	/**
	 * RESERVATION::END
	 */

	/**
	 * MAIL::BEGIN
	 */
	{
		path: appPages.mailAppPages.to,
		element: <UnderConstructionPage />,
	},
	/**
	 * MAIL::END
	 */

	/**
	 * CHAT::BEGIN
	 */
	{
		path: `${appPages.chatAppPages.to}/:id`,
		element: <ChatPage />,
	},
	/**
	 * CHAT::END
	 */

	{ path: examplePages.examplesPage.to, element: <ExamplesPage /> },

	/**
	 * UI::BEGIN
	 */
	{ path: componentsPages.uiPages.subPages.alertPage.to, element: <AlertPage /> },
	{ path: componentsPages.uiPages.subPages.badgePage.to, element: <BadgePage /> },
	{ path: componentsPages.uiPages.subPages.buttonPage.to, element: <ButtonPage /> },
	{ path: componentsPages.uiPages.subPages.buttonGroupPage.to, element: <ButtonGroupPage /> },
	{ path: componentsPages.uiPages.subPages.cardPage.to, element: <CardPage /> },
	{ path: componentsPages.uiPages.subPages.collapsePage.to, element: <CollapsePage /> },
	{ path: componentsPages.uiPages.subPages.dropdownPage.to, element: <DropdownPage /> },
	{ path: componentsPages.uiPages.subPages.modalPage.to, element: <ModalPage /> },
	{ path: componentsPages.uiPages.subPages.offcanvasPage.to, element: <OffcanvasPage /> },
	{ path: componentsPages.uiPages.subPages.progressPage.to, element: <ProgressPage /> },
	{ path: componentsPages.uiPages.subPages.tablePage.to, element: <TablePage /> },
	{ path: componentsPages.uiPages.subPages.tooltipPage.to, element: <TooltipPage /> },
	/**
	 * UI::END
	 */

	/**
	 * FORM::BEGIN
	 */
	{ path: componentsPages.formPages.subPages.fieldWrapPage.to, element: <FieldWrapPage /> },
	{ path: componentsPages.formPages.subPages.checkboxPage.to, element: <CheckboxPage /> },
	{
		path: componentsPages.formPages.subPages.checkboxGroupPage.to,
		element: <CheckboxGroupPage />,
	},
	{ path: componentsPages.formPages.subPages.inputPage.to, element: <InputPage /> },
	{ path: componentsPages.formPages.subPages.labelPage.to, element: <LabelPage /> },
	{ path: componentsPages.formPages.subPages.radioPage.to, element: <RadioPage /> },
	{ path: componentsPages.formPages.subPages.richTextPage.to, element: <RichTextPage /> },
	{ path: componentsPages.formPages.subPages.selectPage.to, element: <SelectPage /> },
	{
		path: componentsPages.formPages.subPages.selectReactPage.to,
		element: <SelectReactPage />,
	},
	{ path: componentsPages.formPages.subPages.textareaPage.to, element: <TextareaPage /> },
	{ path: componentsPages.formPages.subPages.validationPage.to, element: <ValidationPage /> },
	/**
	 * FORM::END
	 */

	/**
	 * INTEGRATED::BEGIN
	 */
	{
		path: componentsPages.integratedPages.subPages.reactDateRangePage.to,
		element: <ReactDateRangePage />,
	},
	{
		path: componentsPages.integratedPages.subPages.fullCalendarPage.to,
		element: <FullCalendarPage />,
	},
	{
		path: componentsPages.integratedPages.subPages.apexChartsPage.to,
		element: <ApexChartsPage />,
	},
	{
		path: componentsPages.integratedPages.subPages.reactSimpleMapsPage.to,
		element: <ReactSimpleMapsPage />,
	},
	{
		path: componentsPages.integratedPages.subPages.waveSurferPage.to,
		element: <WaveSurferPage />,
	},
	/**
	 * INTEGRATED::BEGIN
	 */

	/**
	 * ICONS::BEGIN
	 */
	{ path: componentsPages.iconsPage.to, element: <IconPage /> },
	{ path: componentsPages.iconsPage.subPages.heroiconsPage.to, element: <HeroiconsPage /> },
	{
		path: componentsPages.iconsPage.subPages.duotoneIconsPage.to,
		element: <DuotoneIconsPage />,
	},
	/**
	 * ICONS::BEGIN
	 */
	{ path: '*', element: <NotFoundPage /> },
];

export default contentRoutes;
