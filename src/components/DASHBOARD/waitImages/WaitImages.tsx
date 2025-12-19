import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { FadeLoader } from 'react-spinners';
import { waitAllImagesChargedInElement } from '../../../utils/utils';
import "./waitImages.css";

const WaitImages = ({children, className}: {children: ReactNode, className?: string}) => {
      
    const [showSpinner, setShowSpinner] = useState(true);
    const imageContainerRef = useRef<HTMLDivElement>(null);
       
    useEffect(() => {
        if (!children) return;
        (async () => {
            if (!imageContainerRef.current) return;
            await waitAllImagesChargedInElement(imageContainerRef.current);
            setShowSpinner(false);
            if (imageContainerRef.current) imageContainerRef.current.style.opacity = "1";
        })();
        //eslint-disable-next-line
    }, [children])
    
    return (
      
        <div className={`waitCont ${className || ""}`}>
            {
                showSpinner && children &&
                <div className='waitElementCont waitSpinnerCont dflex'>
                    <FadeLoader color="rgb(59, 130, 246)"/>
                </div>
            }
            <div className='waitElementCont waitImageCont dflex' ref={imageContainerRef}>
                {children}
            </div>
        </div>
            
    );
};

export default WaitImages;
