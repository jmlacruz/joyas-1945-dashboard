import { useContext, useEffect, useState } from "react";
import SeccionsHeader from "../../../components/landing/seccionsHeader/SeccionsHeader";
import "./reviews.css";
import { getTable } from "../../../services/database";
import { SpinnerContext } from "../../../context/spinnerContext";
import { Reviews } from "../../../types/database";
import { getDateFromDateNow, showElement } from "../../../utils/utils";
import waitAllImagesCharged from "../../../utils/waitAllImagesCharged";
import FinalBanner from "../../../components/landing/finalBanner/FinalBanner";
import { swalPopUp } from "../../../utils/swal";

const ReviewCard = (props: {date: string, text: string, stars: number, name: string}) => {
    const {date, text, stars, name} = props;
    const starsArr = ["&#9733;", "&#9733;", "&#9733;", "&#9733;", "&#9733;" ];

    return( 
        <div className="reviweCard_cont flex column">
            <p className="reviewCard_date">{date}</p>
            <img src="/images/icons/quote_pink.png" className="reviewCard_quote_img" alt="Quote" />
            <p className="reviewCard_review_text">{text}</p>
            <div className="reviewCard_stars_cont" dangerouslySetInnerHTML={{ __html: starsArr.slice(0, stars).join("") }}></div>
            <p className="reviewCard_name">{name}</p>
        </div>
    );
};

const ReviewsPage = () => {

    const {showSpinner} = useContext(SpinnerContext);
    const [reviewsJSX, setReviewsJSX] = useState <JSX.Element[] | null> (null);

    useEffect(() => {
        (async() => {
            const conditions: {field: keyof Reviews, value: string | number}[] = [{field: "show", value: "1"}];
            const fields: (keyof Reviews)[] = ["added", "text", "rating", "author_name", "id", "time"];
            showSpinner(true);
            const response = await getTable({tableName: "reviews", conditions, fields});
            if (!response.success || !response.data || !response.data.length) {
                showSpinner(false);
                swalPopUp("Error", `No se pudieron obtener las reseñas: ${response.message}`, "error");
                return;
            }
            const reviewsData: (Pick<Reviews, "added" | "text" | "rating" | "author_name" | "id" | "time">)[] = response.data;   
            reviewsData.sort((a, b) => b.time - a.time);
            setReviewsJSX(reviewsData.map((review) => 
                <ReviewCard 
                    key={review.id} 
                    date={getDateFromDateNow(review.time)}                         //review.added es un timestamp del tipo Date.now() pero dividido por 1000      
                    text={review.text} 
                    stars={review.rating} 
                    name={review.author_name}
                />
            ));
        })();
    }, []);

    useEffect(() => {
        if (!reviewsJSX) return;
        (async () => {
            await waitAllImagesCharged();
            showElement(true);
            showSpinner(false);
        })();
    }, [reviewsJSX]);
    
    
    return (
        <div className="pagesContainer reviewsPageCont elementToShow flex column">
            <SeccionsHeader title="Testimoniales" pathName="Testimoniales"/>
            <div className="reviewsPage_reviews_cont flex wrap">
                {reviewsJSX}
            </div>
            <FinalBanner/>
        </div>
    );
};

export default ReviewsPage;
