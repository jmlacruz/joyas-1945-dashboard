import { useEffect, useState } from "react";
import ProductDetails_landsCape from "../productDetails_landsCape/ProductDetails_landsCape";
import ProductDetails_portrait from "../productDetails_portrait/ProductDetails_portrait";
import "./productDetailModal.css";

interface ProductDetailModalProps {
    productID: number | null;
    isOpen: boolean;
    onClose: () => void;
}

const ProductDetailModal = ({ productID, isOpen, onClose }: ProductDetailModalProps) => {
    const [productDetail, setProductDetail] = useState<JSX.Element | null>(null);

    const showProductDetail = () => {
        if (!productID) {
            onClose();
            return;
        }
        window.innerWidth > window.innerHeight ?
            setProductDetail(<ProductDetails_landsCape productID={productID} onClose={onClose}/>)
            :
            setProductDetail(<ProductDetails_portrait productID={productID} onClose={onClose}/>);
    };

    useEffect(() => {
        if (isOpen && productID) {
            showProductDetail();
        }
    }, [productID, isOpen]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener("resize", showProductDetail);
            window.addEventListener("orientationchange", showProductDetail);
            return () => {
                window.removeEventListener("resize", showProductDetail);
                window.removeEventListener("orientationchange", showProductDetail);
            };
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            // Prevent body scroll when modal is open
            document.body.style.overflow = "hidden";
        } else {
            // Restore body scroll when modal is closed
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="productDetailModal_overlay" onClick={onClose}>
            <div className="productDetailModal_content" onClick={(e) => e.stopPropagation()}>
                {productDetail}
            </div>
        </div>
    );
};

export default ProductDetailModal;
