"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import en from './locales/en.json';
import es from './locales/es.json';
import { Brand } from '@/components/ui/brand';

type Locale = 'en' | 'es';
type Dictionary = typeof en;

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, variables?: Record<string, any>) => any;
    Trans: (props: { i18nKey: string; variables?: Record<string, any>; className?: string }) => React.ReactNode;
}

const dictionaries: Record<Locale, any> = { en, es };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>('en');

    // Actualizar el atributo lang del documento HTML
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const updateLocale = (newLocale: Locale) => {
        setLocale(newLocale);
    };

    const t = (key: string, variables?: Record<string, any>) => {
        const keys = key.split('.');

        // Buscar en el diccionario del locale actual
        let value: any = dictionaries[locale];
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined || value === null) break;
        }

        // Fallback al inglés si no se encontró
        if (value === undefined || value === null) {
            let fallbackValue: any = dictionaries['en'];
            for (const k of keys) {
                fallbackValue = fallbackValue?.[k];
                if (fallbackValue === undefined || fallbackValue === null) break;
            }
            if (fallbackValue !== undefined && fallbackValue !== null) {
                value = fallbackValue;
            } else {
                return key; // Devuelve la clave como último recurso
            }
        }

        // Interpolación básica de strings (solo si v es string/number)
        if (typeof value === 'string' && variables) {
            Object.entries(variables).forEach(([k, v]) => {
                if (typeof v === 'string' || typeof v === 'number') {
                    value = (value as string).replace(`{{${k}}}`, String(v));
                }
            });
        }

        return value;
    };

    const Trans = ({ i18nKey, variables, className }: { i18nKey: string; variables?: Record<string, any>; className?: string }) => {
        const text = t(i18nKey, variables);
        if (typeof text !== 'string') return text;

        // Si no hay variables o ninguna es un objeto React, retorno el texto simple
        if (!variables) {
            return <span className={className}>{text}</span>;
        }

        // Dividir el texto por placeholders {{key}}
        const parts = text.split(/(\{\{[^}]+\}\})/g);

        return (
            <span className={className}>
                {parts.map((part, i) => {
                    const match = part.match(/\{\{([^}]+)\}\}/);
                    if (match) {
                        const key = match[1];
                        const variable = variables[key];
                        if (React.isValidElement(variable)) {
                            return <React.Fragment key={i}>{variable}</React.Fragment>;
                        }
                        // Si no es un elemento React válido pero está en variables, t ya lo habrá procesado si era string
                        return <React.Fragment key={i}>{variable !== undefined ? String(variable) : part}</React.Fragment>;
                    }
                    return <React.Fragment key={i}>{part}</React.Fragment>;
                })}
            </span>
        );
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale: updateLocale, t, Trans }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}
