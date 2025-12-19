import "./faqs.css";
import { faqsTexts } from "../../data/faqs";

function Faqs() {

    const handleAnswer = (e: React.MouseEvent) => {
        e.stopPropagation();
        const questionCont = e.target as HTMLDivElement;
        const answerCont = questionCont.nextSibling as HTMLDivElement;
        answerCont.classList.toggle("faqs_answerActive");
        !answerCont.style.maxHeight || answerCont.style.maxHeight === "0px" ? answerCont.style.maxHeight = answerCont.scrollHeight + "px" : answerCont.style.maxHeight = "0px";
    };
         
    return (
        <div className="pagesContainer faqs_pageContainer paddingHorizontalPages flex">
            <div className="faqs_container flex column">
                <p className="faqs_index">Inicio / <span>Faqs</span></p>
                <p className="faqs_secondaryTitle">CONSULTAS FRECUENTES DE NUESTROS USUARIOS</p>
                <h1 className="faqs_mainTitle">Preguntas Frecuentes</h1>
                <div className="faqs_seccions flex column">
                    {faqsTexts.map((faq, index) => (
                        <div className="faqs_seccion flex column" key={index}>
                            <div className="faqs_seccion_question flex" onClick={handleAnswer}>
                                <p className="opcionHoverPinkTransition">{faq.question}</p>
                                <img src="/images/icons/question.png" alt="Pregunta" className="faqs_questionIcon iconHoverBlackToPinkTransition" />
                            </div>
                            <div className="faqs_seccion_answer flex">
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="faqs_InfoText">Si no ha encontrado su pregunta en esta guía por favor contactese a través de nuestro formulario o por telefono al: +5411 4382 3361 / whatsapp +54911 6159 1361 </p>
            </div>
        </div>
    );
}

export default Faqs;