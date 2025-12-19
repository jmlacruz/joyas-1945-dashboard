import "./productsOrder.page.css";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../../components/layouts/Container/Container';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '../../../../components/layouts/Subheader/Subheader';
import Button from '../../../../components/ui/Button';
import DraggableGrid from "../../../../components/dndOrderProducts/DndOrderProducts";
import { getTable, updateProductsOrder } from "../../../../services/database";
import { Marca, NewProductsOrderArr, Producto } from "../../../../types/DASHBOARD/database";
import { OrderProductsCardData } from "../../../../types/DASHBOARD";
import { Modal2Context } from "../../../../context/modal2Context";
import Select from "../../../../components/form/Select";
import { SpinnerContext } from "../../../../context/spinnerContext";

const cardsByPage = 24;						//<------- Si se cambia este valor también hay que cambiarlo en el front en "Home.tsx"
const brandFieldsFromDB: (keyof Marca)[] = ["id", "descripcion"];

const ProductsOrderPage = () => {
	const [cardsDataArr, setCardsDataArr] = useState<OrderProductsCardData[] | null> (null);
	const cardsDataArrUpdated = useRef<OrderProductsCardData[] | null> (null);
	const [numberOfPages, setNumberOfPages] = useState <number | null> (null);
	const {setModal2} = useContext (Modal2Context);
	const navigate = useNavigate ();
	const [brandIDSelected, setBrandIDSelected] = useState <number | null> (null);
	const [brandSelectOptions, setBrandSelectOptions] = useState ([<></>]);
	const productsIDsArr = useRef <{id: number}[]> ([]);														//Array de todos los ID's de los productos de la marca elegida
	const {showSpinner} = useContext (SpinnerContext);
	const [productsQuantity, setProductsQuantity] = useState (0);
	
	const handlePage = async (options: {open: boolean, pageNumber: number}) => {
		const response1 = await getTable({
			tableName: "producto", 
			conditions: [{field: "marca", value: brandIDSelected || 0}, {field: "estado", value: "1"}], 
			limit: cardsByPage, 
			offset: (options.pageNumber - 1) * cardsByPage,
			orderBy: {field: "order", order: "asc"}
		});
		if (response1.success &&  response1.data && response1.data.length) {
			const productsDataArr: Producto[] = response1.data;
			const productsCardsDataArr: OrderProductsCardData[] = productsDataArr.map((product) => {
				return {
					id: product.id,
					imageUrl: product.thumbnail1,
					position: product.order,
					description: product.nombre,
					productCode: product.codigo,
					pageNumber: options.pageNumber,
				};
			});
			setCardsDataArr((prevCardsDataArr) => [...prevCardsDataArr || [], ...productsCardsDataArr]);				//Las nuevas páginas abiertas añaden sus cards al array total (Las cards ya leidas no se vuelven a leer)
		} else if (!response1.success) {
			setModal2(
				{
					show: true,
					title: "Error",
					icon: "error",
					subtitle: "No se pudieron obtener los productos de la base de datos",
					firstButtonText: "Volver",
					firstButtonFunction: () => {
						setModal2({ show: false });
						navigate(-1);
					},
				}
			);
		}
	};

	useEffect(() => {
		(async() => {
			const response1 = await getTable({tableName: "marca", fields: brandFieldsFromDB});
			if (response1.success && response1.data) {
				const brandsDataArr: Marca[] = response1.data;
				setBrandSelectOptions(brandsDataArr.map((brand) => <option key={brand.id} value={brand.id}>{brand.descripcion}</option>));
			} else if (!response1.success) {
				setModal2(
					{
						show: true,
						title: "Error",
						icon: "error",
						subtitle: "No se pudo obtener el listado de marcas",
						firstButtonText: "Volver",
						firstButtonFunction: () => {
							setModal2({ show: false });
							navigate(-1);
						},
					}
				);
			}
		})();
		//eslint-disable-next-line
	}, []);
			
	useEffect(() => {
		if (brandIDSelected === null) return;
		(async() => {
			showSpinner(true);
			const response1 = await getTable({tableName: "producto", conditions: [{field: "marca", value: brandIDSelected}, {field: "estado", value: "1"}], orderBy: {field: "order", order: "asc"}, fields: ["id"]});
			if (response1.success && response1.data.length) {
				const cardsQuantity: number = response1.data.length;
				setProductsQuantity(cardsQuantity);
				const pagesQuantity = Math.ceil(cardsQuantity / cardsByPage);
				productsIDsArr.current = response1.data as NewProductsOrderArr;												//Almacenamoslos ID's productos leidos (Todos los de la marca seleccionada) en newProductsIDsOrderArr.current (solo se leen de la base de datos sus ID's)
				setNumberOfPages(pagesQuantity);
			} else if (response1.success && !response1.data.length) {
				setNumberOfPages(0);
				setProductsQuantity(0);
			} else if (!response1.success) {
				setNumberOfPages(0);
				setProductsQuantity(0);
				setModal2(
					{
						show: true,
						title: "Error",
						icon: "error",
						subtitle: "No se pudieron obtener los productos de la base de datos",
						firstButtonText: "Volver",
						firstButtonFunction: () => {
							setModal2({ show: false });
							navigate(-1);
						},
					}
				);
			}
			showSpinner(false);
		})();
		//eslint-disable-next-line
	}, [brandIDSelected]);

	const handleSelectBrandChange = (e: React.ChangeEvent) => {
		const brandID = parseInt((e.target as HTMLSelectElement).value);
		setBrandIDSelected(brandID);
		setCardsDataArr([]);
	};

	const updateProductsIDsArr = (productID1: number, productID2: number) => {													//Cada vez que hay un intercambio de cards se actualiza el listado de ID'S	
		const cardIDIndex1 = productsIDsArr.current.findIndex((product) => product.id === productID1);							// (se intercambian en el array, los ID's de las cards cambiadas de lugar)
		const cardIDIndex2 = productsIDsArr.current.findIndex((product) => product.id === productID2);
		if (cardIDIndex1 === -1 || cardIDIndex2 === -1) return;
		productsIDsArr.current[cardIDIndex1].id = productID2;
		productsIDsArr.current[cardIDIndex2].id = productID1;
	};	

	const updateProductsOrderInDatabase = async () => {																		   //Al clickear guardar se actualiza la base de datos
		showSpinner(true);
		const productsOrderParsedArr = productsIDsArr.current.map((product, index) => ({id: product.id, order: index + 1}));   //Se genera un array con los datos: {id: number, order: number} de todos los productos de la marca elegida donde el order es la posición en el array + 1
		const response1 = await updateProductsOrder({newProductsOrderArr: productsOrderParsedArr});
		if (response1.success) {
			setModal2(
				{
					show: true,
					title: "Ordenamiento exitoso",
					icon: "success",
					subtitle: "Orden de productos actualizado correctamente",
					firstButtonFunction: () => setModal2({ show: false })
				},
			);

			if (cardsDataArrUpdated.current) {																				  //Al guardar exitosamente se actualizan las cards en la página
				setCardsDataArr(
					cardsDataArrUpdated.current.map((productOrderData) => {
						const productFound = productsOrderParsedArr.find((product) => product.id === productOrderData.id);
						return {
							...productOrderData,
							position: productFound ? productFound.order : 1e10
						};
					})
				);
			}
		} else {
			setModal2(
				{
					show: true,
					title: "Error",
					icon: "error",
					subtitle: `No se pudo realizar el ordenamiento de productos: ${response1.message}`,
					firstButtonFunction: () => setModal2({ show: false })
				}
			);
		}
						
		showSpinner(false);
	};

	const setCardsDataArrUpdated = (dataUpdated: OrderProductsCardData[]) => {
		cardsDataArrUpdated.current = dataUpdated;
	};
	
	return (
		<PageWrapper name="Edición de producto">
			<Subheader>
				<SubheaderLeft>
					<Button icon='HeroArrowLeft' className='!px-0' onClick={() => navigate(-1)}>
						Volver
					</Button>
					<SubheaderSeparator />
				</SubheaderLeft>
				<div className="dflex">
					<Select
						name='marca'
						onChange={handleSelectBrandChange}
						placeholder="Seleccione una marca"
					>
						{brandSelectOptions}						
					</Select>
					{productsQuantity ? <p className="productsOrder_resultsNumber"><b>{productsQuantity}</b> productos</p> : <></>}
				</div>
				<SubheaderRight>
					<Button
						icon='HeroServer'
						variant='solid'
						color="blue"
						isDisable={false}
						onClick={updateProductsOrderInDatabase}
					>
						Guardar
					</Button>
				</SubheaderRight>
			</Subheader>
			<Container className="min-h-full">
				<DraggableGrid 
					cardsDataArr={cardsDataArr || []} 
					handlePage={handlePage} 
					numberOfPages={numberOfPages} 
					updateProductsIDsArr={updateProductsIDsArr} 
					setCardsDataArrUpdated={setCardsDataArrUpdated}
				/>
			</Container>
		</PageWrapper>
	);
};

export default ProductsOrderPage;
