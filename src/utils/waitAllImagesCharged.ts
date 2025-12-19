const waitAllImagesCharged = () : Promise <boolean> => {
    return new Promise((resolve) => {
        const images = document.querySelectorAll("img");
        const allImagesCount = images.length;
        let imagesCount = 0;
              
        images.forEach((image) => {
                                                
            if (image.complete) {                                                   //image.complete = true si la imagen se cargó completamente o dio error
                imagesCount ++;                                                     
                if (imagesCount >= allImagesCount) resolve(true);
                return;
            }
            image.addEventListener("load", () => {                                  //Evento "load": La imagen pasó de cargando a cargada
                imagesCount ++;
                if (imagesCount >= allImagesCount) resolve(true);
            });
            image.addEventListener("error", () => {                                 //Evento "error": La imagen paso de cargando a error (no se pudo cargar)
                imagesCount ++;
                if (imagesCount >= allImagesCount) resolve(true);
            });
        });                                                     
    });                                                                                  
};                             

export const waitAllImagesChargedInElement = (element: HTMLElement) : Promise <boolean> => {
    return new Promise((resolve) => {
        const images = element.querySelectorAll("img");
        const allImagesCount = images.length;
        let imagesCount = 0;
              
        images.forEach((image) => {
                                                
            if (image.complete) {                                                   //image.complete = true si la imagen se cargó completamente o dio error
                imagesCount ++;                                                     
                if (imagesCount >= allImagesCount) resolve(true);
                return;
            }
            image.addEventListener("load", () => {                                  //Evento "load": La imagen pasó de cargando a cargada
                imagesCount ++;
                if (imagesCount >= allImagesCount) resolve(true);
            });
            image.addEventListener("error", () => {                                 //Evento "error": La imagen paso de cargando a error (no se pudo cargar)
                imagesCount ++;
                if (imagesCount >= allImagesCount) resolve(true);
            });
        });                                                     
    });                                                                                  
};           

export default waitAllImagesCharged;
