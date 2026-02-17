import React, { useState } from 'react';
import './LanguageSelector.css'
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../store";
import {set_language_code} from "../reducers/searchSlice";

interface LanguageInfo {
    name: string;
    flag: string;
}

const useAppDispatch = () => useDispatch<AppDispatch>();


const SearchWithLanguage = () => {

    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { all_kbs, language_code } = useSelector((state: RootState) => state.searchReducer);
    const supported_languages = (all_kbs.length > 0) ? all_kbs[0].supportedLanguages : []

    // Map of language codes to display data
    const langMeta: Record<string, LanguageInfo> = {
        en: { name: 'English', flag: '🇬🇧' },
        nl: { name: 'Nederlands', flag: '🇳🇱' },
        fr: { name: 'Français', flag: '🇫🇷' },
        de: { name: 'Deutsch', flag: '🇩🇪' },
        es: { name: 'Español', flag: '🇪🇸' },
        it: { name: 'Italiano', flag: '🇮🇹' }
    };

    const select_language = (language: string) => {
        dispatch(set_language_code(language));
        setIsOpen(false);
    }

    // Only show the dropdown if there is more than one language
    const showDropdown = supported_languages && supported_languages.length > 1;

    return (
        <span className="">
            {showDropdown && (
                <span className="dropdown">
                    <button
                        className={`btn dropdown-toggle ${isOpen ? 'show' : ''}`}
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-expanded={isOpen}
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    >
                        {langMeta[language_code]?.flag} {language_code}
                    </button>

                    <ul
                        className={`dropdown-menu dropdown-menu-end ${isOpen ? 'show' : ''}`}
                        style={{
                            position: 'absolute',
                            inset: '0px 0px auto auto',
                            margin: '0px',
                            transform: 'translate(0px, 40px)'
                        }}
                    >
                        {supported_languages.map((lang) => (
                            <li key={lang}>
                                <button
                                    className={`dropdown-item ${language_code === lang ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => select_language(lang)}
                                >
                                    <span className="me-2">{langMeta[lang]?.flag}</span>
                                    {langMeta[lang]?.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </span>
            )}
        </span>
    );
};

export default SearchWithLanguage;
