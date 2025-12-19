import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showModal1 } from '../../../features/modalSlice';
import {
	EditOrderNewProductExtraData,
	EditOrderProductDataModifiableFields,
} from '../../../types/DASHBOARD';
import Input from '../../form/Input';
import Textarea from '../../form/Textarea';
import WaitImages from '../waitImages/WaitImages';
import './orderViewPageProductRow.css';

const OrderViewPageProductRow = (props: {
	imgSrc: string;
	name: string;
	price: number;
	calcPrice: number;
	quantity?: number;
	total: number;
	observations?: string;
	productID: number;
	productsDataToUpDate: {
		productID: number;
		data: EditOrderProductDataModifiableFields | null;
		newProductExtraData?: EditOrderNewProductExtraData;
	}[];
	newProductExtraData?: EditOrderNewProductExtraData;
}) => {
	const {
		imgSrc,
		name: productName,
		price,
		calcPrice,
		quantity,
		total,
		observations,
		productID,
		productsDataToUpDate,
		newProductExtraData,
	} = props;
	const rowRef = useRef<HTMLTableRowElement>(null);
	const [productData, setProductData] = useState<EditOrderProductDataModifiableFields>({
		cantidad: quantity || 1,
		total,
		observaciones: observations || '',
	});
	const dispatch = useDispatch();

	const saveChanges = (opc: boolean) => {
		//Se descartan o guardan los cambios del producto en "productData"

		if (opc && productData.cantidad <= 0) {
			dispatch(
				showModal1({
					show: true,
					info: {
						icon: 'warning',
						title: 'Valores incorrectos',
						subtitle: 'La cantidades tienen que se mayor a 0',
					},
				}),
			);
			return;
		}

		if (opc) {
			const totalPrice = Math.ceil(price * calcPrice * productData.cantidad);
			setProductData((current) => ({ ...current, total: totalPrice })); //Al guardar cambios se actualiza el total por si se cambió la cantidad
			const producFoundIndex = productsDataToUpDate.findIndex(
				(product) => product.productID === productID,
			);
			if (producFoundIndex !== -1) {
				productsDataToUpDate[producFoundIndex].data = { ...productData, total: totalPrice };
				productsDataToUpDate[producFoundIndex].newProductExtraData = newProductExtraData;
			} else {
				productsDataToUpDate.push({
					productID,
					data: { ...productData, total: totalPrice },
					newProductExtraData,
				});
			}
		} else {
			setProductData((current) => ({
				...current,
				cantidad: quantity || 1,
				observaciones: observations || '',
			})); //Si se descartan los cambios volvemos a los datos iniciales (que estan en "props")
		}
	};

	useEffect(() => {
		//Si es un producto nevo hacemos "saveChanges" paa que se "pushee" en "productsDataToUpDate"
		if (newProductExtraData) saveChanges(true);
		//eslint-disable-next-line
	}, []);

	const handleProductDataChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setProductData((current) => ({ ...current, [name]: value }));
	};

	return (
		<tr ref={rowRef} className='orderPage_productCard_row'>
			<td className='orderPageView_productCard_img_cont'>
				<WaitImages>
					<img src={imgSrc} className='orderPage_productCard_img' alt='Product' />
				</WaitImages>
			</td>
			<td className='orderPage_productCard_text_cont orderPage_productCard_nameCont'>
				{productName}
			</td>
			<td className='orderPageView_productCard_small_column'>{price}</td>
			<td>
				<Input
					name='cantidad'
					value={productData.cantidad}
					onChange={handleProductDataChange}
					className='orderPage_productCard_input orderPage_productCard_input_off'
					type='number'
					readOnly
				/>
			</td>
			<td className='orderPageView_productCard_small_column px-2'>
				{price * productData.cantidad}
			</td>
			<td className='orderPage_productCard_text_cont'>
				<div className='orderPage_productCard_textAareaCont dflex'>
					<Textarea
						name='observaciones'
						value={productData.observaciones}
						onChange={handleProductDataChange}
						className='orderPage_productCard_input orderPage_productCard_input_off orderPage_productCard_textAarea h-full'
						readOnly
					/>
				</div>
			</td>
		</tr>
	);
};

export default OrderViewPageProductRow;
