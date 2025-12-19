import React, { useEffect, useState } from 'react';
import "./dndOrderProducts.css";
import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    rectSwappingStrategy,
    arraySwap
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { OrderProductsCardData } from '../../types/DASHBOARD';
import WaitImages from '../DASHBOARD/waitImages/WaitImages';

const SortableCard = (props: { cardData: OrderProductsCardData }) => {
    const { cardData } = props;
    const { attributes, listeners, setNodeRef, transform/*, transition */} = useSortable({ id: cardData.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        // transition,  
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="dndOrderProducts_card_cont" title={cardData.description.toUpperCase()}>
            <div className="dndOrderProducts_card_position dflex">{cardData.position}</div>
            <WaitImages className='dndOrderProducts_card_imgCont'>
                <img src={cardData.imageUrl} alt={cardData.description} className="dndOrderProducts_card_img"/>
            </WaitImages>
            <div className='dndOrderProducts_card_data_cont dflex column'>
                <div className="dndOrderProducts_card_description">{(cardData.description).substring(0, 40)}{cardData.description.length > 40 ? ".." : ""}</div>
                <div className="dndOrderProducts_card_code">{cardData.productCode}</div>
            </div>
        </div>
    );
};

const DraggableGrid = (props:
    {
        cardsDataArr: OrderProductsCardData[],
        handlePage: (options: { open: boolean, pageNumber: number }) => void,
        numberOfPages: number | null,
        updateProductsIDsArr: (productID1: number, productID2: number) => void,
        setCardsDataArrUpdated: (dataUpdated: OrderProductsCardData[]) => void
    }
) => {

    const { cardsDataArr, handlePage, numberOfPages, updateProductsIDsArr, setCardsDataArrUpdated } = props;
    const [pages, setPages] = useState([<></>]);
    const [cardsDataArrAux, setCardsDataArrAux] = useState(cardsDataArr);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        setCardsDataArrAux(cardsDataArr);
    }, [cardsDataArr]);

    const handlePageControl = (options: {open: boolean, pageNumber: number, event: React.MouseEvent<HTMLDivElement>}) => {              //Apertura y cierre de páginas
        const target = options.event.target as HTMLDivElement;
        const nextTarget = target.nextSibling as HTMLDivElement;    
        if (!nextTarget?.childNodes.length) {
            handlePage({ open: options.open, pageNumber: options.pageNumber });
        } else if (nextTarget?.childNodes.length && !nextTarget.getAttribute("class")?.includes("cardsPageHidden")) {
            nextTarget.classList.add("cardsPageHidden");
        } else if (nextTarget?.childNodes.length && nextTarget.getAttribute("class")?.includes("cardsPageHidden")) {
            nextTarget.classList.remove("cardsPageHidden");
        }
    };
    
    useEffect(() => {
        const pagesJSX = [];
        if (typeof numberOfPages === "number" && numberOfPages > 0) {
            for (let i = 1; i <= numberOfPages; i++) {
                pagesJSX.push(
                    <div key={i}>
                        <div className='dndOrderProducts_pageIndexCont dflex' onClick={(e) => handlePageControl({ open: false, pageNumber: i , event: e})}>
                            {`Página ${i}`}
                        </div>
                        <div 
                            className='dndOrderProducts_cards_cont' 
                            style={{
                                paddingBottom: cardsDataArrAux.filter((cardData) => cardData.pageNumber === i).length ? "1rem" : "0", 
                                paddingTop: cardsDataArrAux.filter((cardData) => cardData.pageNumber === i).length ? "0.5rem" : "0"
                            }}
                        >
                            {cardsDataArrAux.filter((cardData) => cardData.pageNumber === i).map((card) => (                                //Insertamos las cards en la página si en estas coincide su "pageNumber" con el número de págin actual en el for 
                                <SortableCard key={card.id} cardData={card} />
                            ))}
                        </div>
                    </div>
                );            
            }
            setPages(pagesJSX);
        } else if (typeof numberOfPages === "number" && numberOfPages === 0) {
            setPages([<p className='dndOrderProducts_noRegistersText dflex text-lg' key={1}>No se encontraron registros</p>]);
        }
        setCardsDataArrUpdated(cardsDataArrAux);                                                                                            //Se actualizan los datos de las cards para que al guardar se muestren actualizadas   
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardsDataArrAux, numberOfPages]);
     
    const handleDragEnd = (event: any) => {                                                             //Acción a realizar al soltar la card arrastrada
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setCardsDataArrAux((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);                        
                updateProductsIDsArr(items[oldIndex].id, items[newIndex].id);                           //Cada vez que hay un cambio de orden de 2 cards se actualiza el registro de ID's total de la marca actual
                const oldPage = items[oldIndex].pageNumber;                                             //Las cadrs intercambiadas, intercambian también sus números de paágina por si se pasan cards de una página a otra
                const newPage = items[newIndex].pageNumber;
                items[oldIndex].pageNumber = newPage;
                items[newIndex].pageNumber = oldPage;
                return arraySwap(items, oldIndex, newIndex);                                            //Se reordena el array de cards 
            });
        }
    };
      
    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext 
                items={cardsDataArr} 
                strategy={rectSwappingStrategy}
            >
                {pages}                   
            </SortableContext>
        </DndContext>
    );
};

export default DraggableGrid;