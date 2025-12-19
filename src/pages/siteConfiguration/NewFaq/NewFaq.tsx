import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate} from 'react-router-dom';
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arraySwap, rectSwappingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { useDispatch } from 'react-redux';
import { useFormik, FormikProps } from 'formik';
import { CSS } from '@dnd-kit/utilities';
import PageWrapper from '../../../components/layouts/PageWrapper/PageWrapper';
import Container from '../../../components/layouts/Container/Container';
import Card, {
	CardBody,
	CardHeader,
	CardHeaderChild,
	CardTitle,
} from '../../../components/ui/Card';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '../../../components/layouts/Subheader/Subheader';
import Button from '../../../components/ui/Button';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/Input';
import Badge from '../../../components/ui/Badge';
import useSaveBtn from '../../../hooks/useSaveBtn';

import { Faqs, Faqs_answer } from '../../../types/DASHBOARD/database';
import { insertRow } from '../../../services/database';
import { showModal1 } from '../../../features/modalSlice';
import { faqFormRequiredFields } from '../../../data';
import { base64ToFile, fileToBase64, getFilenameFromFirebaseUrl, getFilenameFromOriginalWebUrl, isFormChanged, waitAllImagesCharged } from '../../../utils/utils';
import { SpinnerContext } from '../../../context/spinnerContext';
import Textarea from '../../../components/form/Textarea';
import Icon from '../../../components/icon/Icon';
import Tooltip from '../../../components/ui/Tooltip';
import InputFileButton from '../../../components/DASHBOARD/inputs/inputFileButton/InputFileButton';
import { uploadFiles } from '../../../services/firebase';

const SortableImgCard = (props: { cardData: Faqs_answer, addImageToDeleteList: (imageUrl: string, faqAnswerID: number) => void }) => {
    const { cardData, addImageToDeleteList } = props;
    const { attributes, listeners, setNodeRef, transform/*, transition */} = useSortable({ id: cardData.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        // transition,  
    };

    return (
        <div ref={setNodeRef} style={{...style}} className='relative col-span-12 max-h-80 h-80 w-full dflex flex-col !items-start mb-10 py-4'>
            <div className='dflex w-full justify-between items-end bg-white'>
                <Label htmlFor='value'>Imagen</Label>
                <span {...attributes} {...listeners} className="cursor-move">
                    <Icon icon="HeroArrowsPointingOut" size="text-4xl" color='blue' className='mr-4' />
                </span>
                <Tooltip text='Eliminar imagen'>
                    <Icon icon='HeroXCircle' size='text-4xl' color="red" onClick={() => addImageToDeleteList(cardData.value, cardData.id)} />
                </Tooltip>
            </div>
            <img src={cardData.value} alt="Faq" className='w-full h-full object-contain object-left border-2 border-gray-200 border-solid' />
        </div>
    );
};

const SortableTextCard = (props: { cardData: Faqs_answer, index: number, faqAnswerID: number, handleChangeFaqsAnswerText: (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => void, removeText: (faqAnswerID: number) => void }) => {
    const { cardData, index, faqAnswerID, handleChangeFaqsAnswerText, removeText } = props;
    const { attributes, listeners, setNodeRef, transform/*, transition */} = useSortable({ id: cardData.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        // transition,  
    };

    return (
        <div ref={setNodeRef} style={style} className='col-span-12 mb-6'>
            <div className='dflex w-full justify-between items-end'>

                <Label htmlFor='value'>Texto</Label>
                <span {...attributes} {...listeners} className="cursor-move">
                    <Icon icon="HeroArrowsPointingOut" size="text-4xl" color='blue' className='mr-4'/>
                </span>
                <Tooltip text='Eliminar texto'>
                    <Icon icon='HeroXCircle' size='text-4xl' color="red" onClick={() => removeText(faqAnswerID)}/>
                </Tooltip>
            </div>
            <Textarea
                id='value'
                name='value'
                value={cardData.value}
                onChange={(e) => handleChangeFaqsAnswerText(e, index)}
                rows={5}
                className='max-h-80 h-80'
            />
        </div>
    );
};

const NewFaqPage = () => {
	const {showSpinner} = useContext(SpinnerContext);
	const navigate = useNavigate();

	const isNewItem = true;
	const [isSaving] = useState<boolean>(false);

	const dispatch = useDispatch();
    const [faqAnswerData, setFaqAnswerData] = useState <Faqs_answer[]> ([]);
	const initialData = useRef <Faqs | object> ({});
    const faqsElementAdded = useRef (false);
    const filenamesArrToDelete = useRef <string[]> ([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );
		
	const formik: FormikProps <Faqs> = useFormik({
		initialValues: {
			id: 0,
			question: "",
            order: 0,
  		},
		onSubmit: async (values: Faqs) => {	
			showSpinner(true);

			const emptyRequiredFieldsParsedArr: string[] = [];										//Verifica si hay campos obligatorios vacíos
			faqFormRequiredFields.forEach((requiredField) => {
				if (!values[requiredField[0]]?.toString().trim()) {
					emptyRequiredFieldsParsedArr.push(requiredField[1]);
				};
			});
			if (emptyRequiredFieldsParsedArr.length > 0) {
				showSpinner(false);
				dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: `Los siguientes campos no pueden estar vacios: ${emptyRequiredFieldsParsedArr.join(", ")}`}}));
				return;
			};
				
			if (!isFormChanged(initialData.current, {...values, ...faqAnswerData})) {										//Si no hay cambios en el formulario no hacemos submit
				dispatch(showModal1({show: true, info: {icon: "info", title: "No hay cambios para guardar", subtitle: "No se modificó ningún campo"}}));
				showSpinner(false);
				return;
			}

            initialData.current = structuredClone({...values, ...faqAnswerData});

			const response = await insertRow({tableName: "faqs", data: formik.values});
			if (!response.success || !response.data || !response.data.length) {
				dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: response.message}}));
                showSpinner(false);
                return;							
			} 

            const newFaqID = response.data[0] as number;
            
            for (const faqAnswer of faqAnswerData) {
                if (faqAnswer.value.includes("base64")) {
                    const file = base64ToFile(faqAnswer.value, "faqImage");
                    const imagesData = new FormData();
                    imagesData.append("files", file);
                    const response1 = await uploadFiles(imagesData);
                    if (!response1.success || !response1.data || !response1.data.length) {
                        dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: "No se pudieron eliminar subir las imágenes"}}));
                        showSpinner(false);
                        return;
                    }
                    const fileUrl = response1.data[0];
                    faqAnswer.value = `firebase/${fileUrl}`;
                }
            };
            
            const faqAnswerDataWithOutIDParsed = faqAnswerData.map((faqAnswer) => {
                let filename = "";

                if (faqAnswer.value.includes("firebasestorage.googleapis.com")) {
                    filename = getFilenameFromFirebaseUrl(faqAnswer.value);
                    return {id_faqs: newFaqID, value: `firebase/${filename}`};
                } else if (faqAnswer.value.includes("https://joyas1945.com/img")) {
                    filename = getFilenameFromOriginalWebUrl(faqAnswer.value);
                    return {id_faqs: newFaqID, value: `#img#${filename}`};
                } else {
                    return {id_faqs: newFaqID, value: `#txt#${faqAnswer.value}`};
                }
            });

            const response2 = await insertRow({tableName: "faqs_answer", data: faqAnswerDataWithOutIDParsed });
            if (!response2.success) {
                dispatch(showModal1({show: true, info: {icon: "error", title: "Error", subtitle: "No se pudieron actualizar las respuestas"}}));
                showSpinner(false);
                return;
            }
                  
            dispatch(showModal1({show: true, info: {icon: "success", title: "Actualización exitosa", subtitle: "Listado de 'Como funciona' actualizado correctamente"}}));
			
            showSpinner(false);
		}
	});
    	
    const handleChangeFaqsAnswerText = (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
        const faqAnswerDataAux = structuredClone(faqAnswerData);
        if (!faqAnswerDataAux) return;
        faqAnswerDataAux[index].value = e.target.value;
        setFaqAnswerData(faqAnswerDataAux);
    };

	const { saveBtnText, saveBtnColor, saveBtnDisable } = useSaveBtn({
		isNewItem,
		isSaving,
		isDirty: formik.dirty,
	});

    const removeText = (ID: number) => {
        const faqAnswerDataAux = structuredClone(faqAnswerData);
        const faqsAnswerDataFiltered = faqAnswerDataAux.filter((faqAnswer) => faqAnswer.id !== ID);
        setFaqAnswerData(faqsAnswerDataFiltered);
    };    

    const handleDragEnd = (event: DragEndEvent) => {                                                             //Acción a realizar al soltar la card arrastrada
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setFaqAnswerData((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);  
                
                const oldId = items[oldIndex].id;
                const newId = items[newIndex].id;

                items[oldIndex].id = newId;
                items[newIndex].id = oldId;
                
                return arraySwap(items, oldIndex, newIndex);                                            //Se reordena el array de cards 
            });
        }
    };
      
const addText = () => {
        faqsElementAdded.current = true;                                                                
        setFaqAnswerData((prev) => ([
            ...prev,
            {id: Math.random(), id_faqs: 0, value: ""}                                                 //Valor unico para id ya qe que este valos se asigna al id de la card arrastable y si hay dos iguales se mueven juntas
        ]));
    };

    const addImage = async (file: File) => {
        const imageStr64 = await fileToBase64(file);
        faqsElementAdded.current = true;                                                                
        setFaqAnswerData((prev) => ([
            ...prev,
            {id: Math.random(), id_faqs: 0, value: imageStr64}
        ]));
    };

    const addImageToDeleteList = (imageUrl: string, faqAnswerID: number) => {
        showSpinner(true);

        const faqAnswerDataAux = structuredClone(faqAnswerData);
        const faqsAnswerDataFiltered = faqAnswerDataAux.filter((faqAnswer) => faqAnswer.id !== faqAnswerID);
        setFaqAnswerData(faqsAnswerDataFiltered);

        if (imageUrl.includes("firebasestorage.googleapis.com")) {
            const filename = getFilenameFromFirebaseUrl(imageUrl);
            filenamesArrToDelete.current.push(filename);

        } else if (imageUrl.includes("https://joyas1945.com/img")) {
            const filename = getFilenameFromOriginalWebUrl(imageUrl);
            filenamesArrToDelete.current.push(filename);
        } 
    };
      
    useEffect(() => {
        (async() => {
            if (faqsElementAdded.current) {                                                         //Para que se haga scroll hacia abajo si se agregó un nuevo elemento
                faqsElementAdded.current = false;
                await waitAllImagesCharged();                    
                window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
            }
        })();
    }, [faqAnswerData]);

    const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;
        if (files && files.length) {
            const file = files[0];
            addImage(file);
        }
    };
            
	return (
		<PageWrapper name='Creación de "Como funciona"'>
			<Subheader>
				<SubheaderLeft>
					<Button icon='HeroArrowLeft' className='!px-0' onClick={() => navigate(-1)}>
						Volver
					</Button>
					<SubheaderSeparator />
						<Badge
							color='blue'
							variant='outline'
							rounded='rounded-full'
							className='border-transparent'>
							Creación de "Como funciona"
						</Badge>
					</SubheaderLeft>
				<SubheaderRight>
					<Button
						icon='HeroServer'
						variant='solid'
						color={saveBtnColor}
						isDisable={saveBtnDisable}
						onClick={() => formik.handleSubmit()}>
						{saveBtnText}
					</Button>
				</SubheaderRight>
			</Subheader>
			<Container >
                <div className='grid grid-cols-12 gap-4' >
                    <div className='col-span-12 lg:col-span-9'>
                        <div className='grid grid-cols-12 gap-4'>
                            <div className='col-span-12'>
                                <Card >
                                    <CardHeader>
                                        <CardHeaderChild>
                                            <CardTitle>
                                                <div>
                                                    <div>Creación de "Como funciona"</div>
                                                    <div className='text-base font-normal text-zinc-500'>
                                                        Los campos marcados con <span className='requiredFieldSymbol'>*</span> son obligatorios
                                                    </div>
                                                </div>
                                            </CardTitle>
                                        </CardHeaderChild>
                                    </CardHeader>
                                    <CardBody>
                                        <div className='grid grid-cols-12 gap-4'>
                                            <div className='col-span-12'>
                                                <Label htmlFor='question'>Pregunta<span className='requiredFieldSymbol'>*</span></Label>
                                                <Input
                                                    id='Pregunta'
                                                    name='question'
                                                    value={formik.values.question}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                            <div className='col-span-12'>
                                                <Label htmlFor='order'>Orden</Label>
                                                <Input
                                                    id='order'
                                                    name='order'
                                                    value={formik.values.order}
                                                    onChange={formik.handleChange}
                                                    type='number'
                                                />
                                            </div>
                                            <div className='dflex col-span-12 justify-start mt-10'>
                                                <Button
                                                    icon="HeroPlusSmall"
                                                    variant='solid'
                                                    className="min-w-56 pointers-events-none! mr-12"
                                                    onClick={addText}
                                                >
                                                    Agregar texto
                                                </Button>
                                                <InputFileButton handleInputFileChange={handleInputFileChange}/>
                                            </div>
                                            <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd} >
                                                <SortableContext
                                                    items={faqAnswerData}
                                                    strategy={rectSwappingStrategy}
                                                >
                                                {
                                                    faqAnswerData.map((faqAnswer, index) =>
                                                    faqAnswer.value.includes("http") || faqAnswer.value.includes("base64") ?
                                                        <SortableImgCard 
                                                            cardData={faqAnswer} 
                                                            key={index} 
                                                            addImageToDeleteList={addImageToDeleteList}
                                                        />
                                                        :
                                                        <SortableTextCard 
                                                            cardData={faqAnswer} 
                                                            index={index} 
                                                            key={index} 
                                                            faqAnswerID={faqAnswer.id} 
                                                            handleChangeFaqsAnswerText={handleChangeFaqsAnswerText}
                                                            removeText={removeText}
                                                        />
                                                )}
                                                </SortableContext>
                                            </DndContext>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </PageWrapper>
    );
};

export default NewFaqPage;
