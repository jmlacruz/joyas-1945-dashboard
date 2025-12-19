import categoriesDb from '../mocks/db/categories.db';
import rolesDb from '../mocks/db/roles.db';
import projectsDb from '../mocks/db/projects.db';

export const examplePages = {
	examplesPage: {
		id: 'examplesPage',
		to: '/examples-page',
		text: 'Examples Page',
		icon: 'HeroBookOpen',
	},
	duotoneIconsPage: {
		id: 'duotoneIconsPage',
		to: '/duotone-icons',
		text: 'Duotone Icons',
		icon: 'HeroCubeTransparent',
	},
};

export const appPages = {
	aiAppPages: {
		id: 'aiApp',
		to: '/ai',
		text: 'AI',
		icon: 'HeroRocketLaunch',
		subPages: {
			aiDashboardPage: {
				id: 'aiDashboardPage',
				to: '/ai/dashboard',
				text: 'Inicio',
				icon: 'HeroHome',
			},
			chatPages: {
				id: 'customerPage',
				to: '/ai/chat',
				text: 'Chat Pages',
				icon: 'HeroChatBubbleLeft',
				subPages: {
					photoPage: {
						id: 'photoPage',
						to: '/ai/chat/photo',
						text: 'Photo Editing',
						icon: 'HeroPhoto',
					},
					videoPage: {
						id: 'videoPage',
						to: '/ai/chat/video',
						text: 'Video Generation',
						icon: 'HeroFilm',
					},
					audioPage: {
						id: 'audioPage',
						to: '/ai/chat/audio',
						text: 'Audio Generation',
						icon: 'HeroMusicalNote',
					},
					codePage: {
						id: 'audioPage',
						to: '/ai/chat/code',
						text: 'Code Generation',
						icon: 'HeroCommandLine',
					},
				},
			},
		},
	},
	salesAppPages: {
		id: 'salesApp',
		to: '/sales',
		text: 'Sales',
		icon: 'HeroBanknotes',
		subPages: {
			salesDashboardPage: {
				id: 'salesDashboardPage',
				to: '/',
				text: 'Sales Dashboard',
				icon: 'HeroRectangleGroup',
			},
			productPage: {
				id: 'productPage',
				to: '/sales/product',
				text: 'Products',
				icon: 'HeroRectangleStack',
				subPages: {
					listPage: {
						id: 'productsListPage',
						to: '/sales/product/list',
						text: 'Products List',
						icon: 'HeroQueueList',
					},
					newProductPage: {
						id: 'productNewPage',
						to: `/sales/product/new`,
						text: `New Product`,
						icon: 'HeroUser',
					},
					editPage: {
						id: 'productPage',
						to: `/sales/product`,
						text: `Product Edit`,
						icon: 'HeroTicket',
					},
					priceMultiplierPage: {
						id: 'priceMultiplierPage',
						to: `/sales/priceMultiplier`,
						text: `Price Multiplier`,
						icon: 'HeroTicket',
					},
					pricesGroupsListPage: {
						id: 'pricesGroupsListPage',
						to: `/sales/pricesGroupsList`,
						text: `Prices Groups List`,
						icon: 'HeroTicket',
					},
					pricesGroupEditPage: {
						id: 'pricesGroupEditPage',
						to: `/sales/pricesGroup`,
						text: `Prices Group Edit`,
						icon: 'HeroTicket',
					},
					pricesGroupNewPage: {
						id: 'pricesGroupNewPage',
						to: `/sales/pricesGroup/new`,
						text: `New Prices Group`,
						icon: 'HeroTicket',
					},
					BrandsListPage: {
						id: 'brandsListPage',
						to: `/sales/brandsList`,
						text: `Brands List`,
						icon: 'HeroTicket',
					},
					BrandEditPage: {
						id: 'brandEditPage',
						to: `/sales/brand`,
						text: `Brand Edit`,
						icon: 'HeroTicket',
					},
					BrandNewPage: {
						id: 'brandNewPage',
						to: `/sales/newBrand`,
						text: `Brand Edit`,
						icon: 'HeroTicket',
					},
					NewsListPage: {
						id: 'newsListPage',
						to: `/sales/newsList`,
						text: `News List`,
						icon: 'HeroTicket',
					},
					NewsEditPage: {
						id: 'newsEditPage',
						to: `/sales/news`,
						text: `News Edit`,
						icon: 'HeroTicket',
					},
					ProminentsListPage: {
						id: 'prominentsListPage',
						to: `/sales/prominentsList`,
						text: `Prominents List`,
						icon: 'HeroTicket',
					},
					ClothsListPage: {
						id: 'clothsListPage',
						to: `/sales/clothsList`,
						text: `Cloths List`,
						icon: 'HeroTicket',
					},
					ClothEditPage: {
						id: 'clothEditPage',
						to: `/sales/cloth`,
						text: `Cloth Edit`,
						icon: 'HeroTicket',
					},
					ClothNewPage: {
						id: 'clothNewPage',
						to: `/sales/newCloth`,
						text: `New Cloth`,
						icon: 'HeroTicket',
					},
					OrderPage: {
						id: 'orderPage',
						to: `/sales/products/order`,
						text: `Products Order`,
						icon: 'HeroTicket',
					},
					editPageLink: {
						id: 'editPageLink',
						to: '/sales/product',
					},
				},
			},
			categoryPage: {
				id: 'categoryPage',
				to: '/sales/category',
				text: 'Category',
				icon: 'HeroSquare2Stack',
				subPages: {
					listPage: {
						id: 'categoryListPage',
						to: '/sales/category/list',
						text: 'Category List',
						icon: 'HeroQueueList',
					},
					editPage: {
						id: 'productPage',
						to: `/sales/category/${categoriesDb[0].id}`,
						text: `Category #${categoriesDb[0].id}`,
						icon: 'HeroStop',
					},
					editPageLink: {
						id: 'editPageLink',
						to: '/sales/category',
					},
				},
			},
		},
	},
	crmAppPages: {
		id: 'crmApp',
		to: '/crm',
		text: 'CRM',
		icon: 'HeroUserGroup',
		subPages: {
			crmDashboardPage: {
				id: 'crmDashboardPage',
				to: '/crm/dashboard',
				text: 'CRM Dashboard',
				icon: 'HeroUserCircle',
			},
			customerPage: {
				id: 'customerPage',
				to: '/crm/customer',
				text: 'Customers',
				icon: 'HeroUserGroup',
				subPages: {
					listPage: {
						id: 'crmListPage',
						to: '/crm/customer/list',
						text: 'Customers List',
						icon: 'HeroQueueList',
					},
					newUserPage: {
						id: 'customerNewPage',
						to: `/crm/customer/new`,
						text: `Creación de Usuario`,
						icon: 'HeroUser',
					},
					editPage: {
						id: 'customerPage',
						to: `/crm/customer/`,
						text: `Edición de usuario`,
						icon: 'HeroUser',
					},
					editPageLink: {
						id: 'editPageLink',
						to: '/crm/customer',
					},
					sellersListPage: {
						id: 'sellersListPage',
						to: `/crm/sellers/list`,
						text: `Lista de vendedores`,
						icon: 'HeroUser',
					},
					sellerEditPage: {
						id: 'sellerEditPage',
						to: `/crm/seller`,
						text: `Edición de vndedor`,
						icon: 'HeroUser',
					},
					sellerNewPage: {
						id: 'sellerNewPage',
						to: `/crm/seller/new`,
						text: `Añadir vendedor`,
						icon: 'HeroUser',
					},
					usersLogsPage: {
						id: 'usersLogsPage',
						to: `/crm/logs/list`,
						text: `Log de usuarios`,
						icon: 'HeroUser',
					},
					reviewsListPage: {
						id: 'reviewsListPage',
						to: `/crm/reviews/list`,
						text: `Listado de reseñas`,
						icon: 'HeroUser',
					},
					reviewEditPage: {
						id: 'reviewEditPage',
						to: `/crm/review`,
						text: `Edición de reseña`,
						icon: 'HeroUser',
					},
					leadsListPage: {
						id: 'leadsListPage',
						to: `/crm/leads/list`,
						text: `Listado de leads`,
						icon: 'HeroUser',
					},
					leadEditPage: {
						id: 'leadEditPage',
						to: `/crm/lead`,
						text: `Edición de lead`,
						icon: 'HeroUser',
					},
					leadNewPage: {
						id: 'leadNewPage',
						to: `/crm/lead/new`,
						text: `Añadir lead`,
						icon: 'HeroUser',
					},
				},
			},
			rolePage: {
				id: 'rolePage',
				to: '/crm/role',
				text: 'Roles',
				icon: 'HeroShieldCheck',
				subPages: {
					listPage: {
						id: 'crmListPage',
						to: '/crm/role/list',
						text: 'Role List',
						icon: 'HeroQueueList',
					},
					editPage: {
						id: 'customerPage',
						to: `/crm/role/${rolesDb[0].id}`,
						text: `Role @${rolesDb[0].id}`,
						icon: 'HeroShieldExclamation',
					},
					editPageLink: {
						id: 'editPageLink',
						to: '/crm/role',
					},
				},
			},
		},
	},
	ordersAppPage: {
		subPages: {
			ordersDashboardPage: {
				id: 'ordersDashboardPage',
				to: '/orders/dashboard',
				text: 'Orders Dashboard',
				icon: 'HeroUserCircle',
			},
			ordersPages: {
				shippingMethodsListPage: {
					id: 'shippingMethodsListPage',
					to: '/orders/shippingMethods/list',
					text: 'Shipping Methods List',
					icon: 'HeroQueueList',
				},
				shippingMethodNewPage: {
					id: 'shippingMethodNewPage',
					to: '/orders/shippingMethod/new',
					text: 'New Shipping Method',
					icon: 'HeroQueueList',
				},
				shippingMethodEditPage: {
					id: 'shippingMethodEditPage',
					to: '/orders/shippingMethod/edit',
					text: 'Edit Shipping Method',
					icon: 'HeroQueueList',
				},
				ordersListPage: {
					id: 'ordersListPage',
					to: '/orders/list',
					text: 'Orders List',
					icon: 'HeroQueueList',
				},
				orderEditPage: {
					id: 'orderEditPage',
					to: '/order/edit',
					text: 'Edit Order',
					icon: 'HeroQueueList',
				},
				orderViewPage: {
					id: 'orderViewPage',
					to: '/order/view',
					text: 'View Order',
					icon: 'HeroQueueList',
				},
				processedOrdersListPage: {
					id: 'processedOrdersListPage',
					to: '/order/inProcessOrders',
					text: 'Processed Orders',
					icon: 'HeroQueueList',
				},
			},
		},
	},
	siteConfigurationAppPages: {
		id: 'siteConfigurationApp',
		to: '/siteConfiguration',
		text: 'Configuración de sitio',
		icon: 'HeroUserGroup',
		subPages: {
			siteConfigurationDashboardPage: {
				id: 'siteConfigurationDashboardPage',
				to: '/siteConfiguration/dashboard',
				text: 'Configuración de sitio',
				icon: 'HeroUserCircle',
			},
			siteConfigurationPage: {
				id: 'siteConfigurationPage',
				to: '/siteConfiguration',
				text: 'Configuración de sitio',
				icon: 'HeroUserGroup',
				subPages: {
					messagingsettingsListPage: {
						id: 'messagingsettingsListPage',
						to: '/siteConfiguration/messagingsettingslist',
						text: 'Configuración de Mensajería',
						icon: 'HeroQueueList',
					},
					messagingsettingsPage: {
						id: 'messagingsettingsPage',
						to: '/siteConfiguration/messagingsettings',
						text: 'Configuración de Mensajería',
						icon: 'HeroQueueList',
					},
					faqsListPage: {
						id: 'faqsListPage',
						to: '/siteConfiguration/faqsList',
						text: 'Listado de "Como funciona"',
						icon: 'HeroQueueList',
					},
					faqPage: {
						id: 'faqPage',
						to: '/siteConfiguration/faqEdit',
						text: 'Edición de "Como funciona"',
						icon: 'HeroQueueList',
					},
					newFaqPage: {
						id: 'newFaqPage',
						to: '/siteConfiguration/newFaq',
						text: 'Creación de "Como funciona"',
						icon: 'HeroQueueList',
					},
					generalSettingsPage: {
						id: 'generalSettingsPage',
						to: '/siteConfiguration/generalSettings',
						text: 'Configuraciones generales"',
						icon: 'HeroQueueList',
					},
					reportPage: {
						id: 'reportPage',
						to: '/siteConfiguration/report',
						text: 'Reporte"',
						icon: 'HeroQueueList',
					},
					notificationsLogsPage: {
						id: 'notificationsLogsPage',
						to: '/siteConfiguration/notificationsLogs',
						text: 'Log de envíos"',
						icon: 'HeroQueueList',
					},
					habDesLogsPage: {
						id: 'habDesLogsPage',
						to: '/siteConfiguration/habdesLogs',
						text: 'Log de hab / des de autom."',
						icon: 'HeroQueueList',
					},
				},
			},
		},
	},

	projectAppPages: {
		id: 'projectApp',
		to: '/project',
		text: 'Project',
		icon: 'HeroClipboardDocumentCheck',
		subPages: {
			projectDashboardPage: {
				id: 'projectDashboardPage',
				to: '/project/dashboard',
				text: 'Projects Dashboard',
				icon: 'HeroClipboardDocumentCheck',
			},
			projectBoardPage: {
				id: 'projectBoardPage',
				to: `/project/board/${projectsDb[0].id}`,
				text: `Board ${projectsDb[0].name}`,
				icon: 'HeroQrCode',
			},
			projectBoardPageLink: {
				id: 'projectBoardPageLink',
				to: '/project/board',
			},
		},
	},
	educationAppPages: {
		id: 'educationApp',
		to: '/education',
		text: 'Education',
		icon: 'HeroBookOpen',
		subPages: {},
	},
	reservationAppPages: {
		id: 'reservationApp',
		to: '/reservation',
		text: 'Reservation',
		icon: 'HeroCalendarDays',
		subPages: {},
	},
	mailAppPages: {
		id: 'mailApp',
		to: '/mail',
		text: 'Mail',
		icon: 'HeroEnvelope',
		subPages: {
			inboxPages: {
				id: 'inboxPages',
				to: '/mail/inbox',
				text: 'Inbox',
				icon: 'HeroEnvelope',
			},
		},
	},
	chatAppPages: {
		id: 'chatApp',
		to: '/chat',
		text: 'Chat',
		icon: 'HeroChatBubbleLeftRight',
	},
};

export const componentsPages = {
	uiPages: {
		id: 'uiPages',
		to: '/ui',
		text: 'UI',
		icon: 'HeroPuzzlePiece',
		subPages: {
			alertPage: {
				id: 'alertPage',
				to: '/ui/alert',
				text: 'Alert',
				icon: 'HeroBell',
			},
			badgePage: {
				id: 'badgePage',
				to: '/ui/badge',
				text: 'Badge',
				icon: 'HeroSparkles',
			},
			buttonPage: {
				id: 'buttonPage',
				to: '/ui/button',
				text: 'Button',
				icon: 'HeroRectangleStack',
			},
			buttonGroupPage: {
				id: 'buttonGroupPage',
				to: '/ui/button-group',
				text: 'Button Group',
				icon: 'HeroRectangleStack',
			},
			cardPage: {
				id: 'cardPage',
				to: '/ui/card',
				text: 'Card',
				icon: 'HeroSquare2Stack',
			},
			collapsePage: {
				id: 'collapsePage',
				to: '/ui/collapse',
				text: 'Collapse',
				icon: 'HeroBarsArrowDown',
			},
			dropdownPage: {
				id: 'dropdownPage',
				to: '/ui/dropdown',
				text: 'Dropdown',
				icon: 'HeroQueueList',
			},
			modalPage: {
				id: 'modalPage',
				to: '/ui/modal',
				text: 'Modal',
				icon: 'HeroChatBubbleBottomCenter',
			},
			offcanvasPage: {
				id: 'offcanvasPage',
				to: '/ui/offcanvas',
				text: 'Offcanvas',
				icon: 'HeroBars3BottomRight',
			},
			progressPage: {
				id: 'progressPage',
				to: '/ui/progress',
				text: 'Progress',
				icon: 'HeroChartBar',
			},
			tablePage: {
				id: 'tablePage',
				to: '/ui/table',
				text: 'Table',
				icon: 'HeroTableCells',
			},
			tooltipPage: {
				id: 'tooltipPage',
				to: '/ui/tooltip',
				text: 'Tooltip',
				icon: 'HeroChatBubbleLeftEllipsis',
			},
		},
	},
	formPages: {
		id: 'formPages',
		to: '/form',
		text: 'Form',
		icon: 'HeroPencilSquare',
		subPages: {
			fieldWrapPage: {
				id: 'fieldWrapPage',
				to: '/form/field-wrap',
				text: 'Field Wrap',
				icon: 'HeroInbox',
			},
			checkboxPage: {
				id: 'checkboxPage',
				to: '/form/checkbox',
				text: 'Checkbox',
				icon: 'HeroStop',
			},
			checkboxGroupPage: {
				id: 'checkboxGroupPage',
				to: '/form/checkbox-group',
				text: 'Checkbox Group',
				icon: 'HeroListBullet',
			},
			inputPage: {
				id: 'inputPage',
				to: '/form/input',
				text: 'Input',
				icon: 'HeroRectangleStack',
			},
			labelPage: {
				id: 'labelPage',
				to: '/form/label',
				text: 'Label',
				icon: 'HeroPencil',
			},
			radioPage: {
				id: 'radioPage',
				to: '/form/radio',
				text: 'Radio',
				icon: 'HeroStopCircle',
			},
			richTextPage: {
				id: 'richTextPage',
				to: '/form/rich-text',
				text: 'Rich Text',
				icon: 'HeroBars3CenterLeft',
			},
			selectPage: {
				id: 'selectPage',
				to: '/form/select',
				text: 'Select',
				icon: 'HeroQueueList',
			},
			selectReactPage: {
				id: 'selectReactPage',
				to: '/form/select-react',
				text: 'Select React',
				icon: 'HeroQueueList',
			},
			textareaPage: {
				id: 'textareaPage',
				to: '/form/textarea',
				text: 'Textarea',
				icon: 'HeroBars3BottomLeft',
			},
			validationPage: {
				id: 'validationPage',
				to: '/form/validation',
				text: 'Validation',
				icon: 'HeroShieldCheck',
			},
		},
	},
	integratedPages: {
		id: 'integratedPages',
		to: '/integrated',
		text: 'Integrated',
		icon: 'HeroBuildingLibrary',
		subPages: {
			reactDateRangePage: {
				id: 'reactDateRangePage',
				to: '/integrated/react-date-range',
				text: 'React Date Range',
				icon: 'HeroCalendarDays',
			},
			fullCalendarPage: {
				id: 'fullCalendarPage',
				to: '/integrated/full-calendar',
				text: 'Full Calendar',
				icon: 'HeroCalendar',
			},
			apexChartsPage: {
				id: 'apexChartsPage',
				to: '/integrated/apex-charts',
				text: 'ApexCharts',
				icon: 'HeroChartBar',
			},
			reactSimpleMapsPage: {
				id: 'reactSimpleMapsPage',
				to: '/integrated/react-simple-maps',
				text: 'React Simple Maps',
				icon: 'HeroMap',
			},
			waveSurferPage: {
				id: 'waveSurferPage',
				to: '/integrated/wave-surfer',
				text: 'WaveSurfer',
				icon: 'HeroMusicalNote',
			},
			richTextPage: {
				id: 'richTextPage',
				to: '/integrated/slate-react',
				text: 'Rich Text',
				icon: 'HeroBars3BottomLeft',
			},
			reactSelectPage: {
				id: 'reactSelectPage',
				to: '/integrated/react-select',
				text: 'React Select',
				icon: 'HeroQueueList',
			},
		},
	},
	iconsPage: {
		id: 'iconsPage',
		to: '/icons',
		text: 'Icons',
		icon: 'HeroBuildingLibrary',
		subPages: {
			heroiconsPage: {
				id: 'heroiconsPage',
				to: '/icons/heroicons',
				text: 'Heroicons',
				icon: 'HeroShieldCheck',
			},
			duotoneIconsPage: {
				id: 'duotoneIconsPage',
				to: '/icons/duotone-icons',
				text: 'Duotone Icons',
				icon: 'DuoPicker',
			},
		},
	},
};

const pagesConfig = {
	...examplePages,
};

export default pagesConfig;
