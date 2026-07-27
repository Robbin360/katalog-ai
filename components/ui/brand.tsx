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
            className={`notranslate inline-flex items-center gap-1.5 ${className}`}
        >
            Katalog{withAI && <span>AI</span>}
        </span>
    );
};
