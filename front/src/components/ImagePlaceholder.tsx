import React, { useState, useEffect } from 'react';
import defaultPlaceholder from '../assets/images/placeholder.png';

interface ImagePlaceholderProps {
    src: string | undefined | null; 
    alt: string;
    className?: string; 
    style?: React.CSSProperties; 
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
    src,
    alt,
    className,
    style
}) => {
    const initialSrc = src || defaultPlaceholder;

    const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);

    const [hasError, setHasError] = useState<boolean>(!src);

    const handleError = () => {
        if (currentSrc !== defaultPlaceholder) {
             console.warn(`Image failed to load: ${src}. Using placeholder.`); 
             setCurrentSrc(defaultPlaceholder); 
             setHasError(true); 
        }
    };

    return (
        <img
            src={currentSrc} 
            alt={alt}
            className={className} 
            style={style}       
            onError={handleError} 
        />
    );
};

export default ImagePlaceholder;