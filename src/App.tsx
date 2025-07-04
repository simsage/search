import React, {useEffect} from "react";
import {useSelector} from 'react-redux';
import Search from "./search/Search";
import {useAuth} from "react-oidc-context";
import {Route, Routes} from "react-router-dom";
import AISearch from "./search/AISearch";
import {useTranslation} from "react-i18next";
import './types';
import { RootState } from './store';

/**
 * main page layout for the search system
 *
 */
export const App: React.FC = () => {
    const auth = useAuth();
    const { llm_search } = useSelector((state: RootState) => state.searchReducer);
    const { i18n } = useTranslation();

    useEffect(() => {
        i18n.changeLanguage(window.ENV.language).then(() => {
            console.log("language set to \"" + window.ENV.language + "\"");
        });
    }, [i18n]);

    if (!auth.isAuthenticated) {
        return <div>loading...</div>;
    }

    return (
        <Routes>
            {!llm_search &&
            <Route path="/" element={<Search />} />
            }
            {llm_search &&
                <Route path="/" element={<AISearch />} />
            }
        </Routes>
    );
};
