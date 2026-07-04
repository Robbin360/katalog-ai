import React from "react";

interface BrandProps {
    withAI?: boolean;
    className?: string;
}

/**
 * Componente utilitario para renderizar el nombre de la marca
 * protegido contra sistemas de traducción automática (Google Translate, etc.)
 */
export const Brand = ({ withAI = true, className = "" }: BrandProps) => {
    return (
        <span
            translate="no"
            className={`notranslate inline-flex items-center ${className}`}
        >
            Katalog{withAI && <> <span className="ml-1">AI</span></>}
        </span>
    );
};
