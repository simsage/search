import React, {Component} from 'react';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {appCreators} from "../actions/appActions";

import '../css/search-page.css';

import Navbar from "../components/layout/Navbar.js";
import SearchResults from "../components/layout/SearchResults.js";
import HomeSearch from "../components/layout/HomeSearch.js"
import PreviewModal from "../components/layout/PreviewModal.js";

import ErrorDialog from "../common/error-dialog";
import Api from "../common/api";
import {withRouter} from "react-router";
import {tokenize} from "../common/tokenizer";
import {getFullUsername} from "../pageLayout";


/**
 * this is the main Search page
 */
export class SearchPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            has_error: false,  // error trapping
            notifications_dropdown: false,
            accounts_dropdown: false,
            show_new_menu: false,
            files_for_upload: null,
            show_sign_in: false,
        }
    }

    componentDidCatch(error, info) {
        this.setState({has_error: true});
        console.log(error, info);
    }

    componentDidMount() {
        // do we not have a valid userId yet for the dashboard?
        if (!this.props.search_info_loaded){
            // if we can successfully get the search-info, we can then see if we have a query in the query-string
            // and execute that query
            this.props.getSearchInfo(() => {
                let propsSearch = Api.getUrlSearchParamsAsMap(this.props.location.search)
                if (propsSearch.hasOwnProperty("query")) {
                    let query = decodeURIComponent(propsSearch.query)
                    this.updatePropsWithQuery(query)
                    // this will assure all other threads run first and props are correctly
                    // updated before we re-run search with now set params
                    window.setTimeout(this.onSearch.bind(this),10)
                }
            });
        }
    }

    // update existing properties from the query
    updatePropsWithQuery(query) {
        this.updatePropsWithBody(query); // ordinary text-box query terms
        this.updatePropsWithDocTypes(query); // document types
        this.updatePropsWithEntityTypes(query); // entity types
        this.updatePropsWithSourceTypes(query); // source selection(s)
        this.updatePropsWithSlider("created", query); // created metadata
        this.updatePropsWithSlider("last-modified", query); // last-modified metadata

    }

    updatePropsWithBody(query) {
        const token_list = tokenize(query);
        let search_text = [];
        let i = 0;
        while (i < token_list.length) {
            const token = token_list[i];
            let next_token = "";
            if (i + 1 < token_list.length)
                next_token = token_list[i + 1];
            if (token !== " ") {
                // skip any special metadata
                if (token === "doc" && next_token === "(") {
                    while (i < token_list.length && token_list[i] !== ')') {
                        i += 1
                    }

                } else if (token === "range" && next_token === "(") {
                    while (i < token_list.length && token_list[i] !== ')') {
                        i += 1
                    }

                } else if (token === "sort" && next_token === "(") {
                    while (i < token_list.length && token_list[i] !== ')') {
                        i += 1
                    }

                } else if (token === "num" && next_token === "(") {
                    while (i < token_list.length && token_list[i] !== ')') {
                        i += 1
                    }

                } else if (token === "source" && next_token === "(") {
                    while (i < token_list.length && token_list[i] !== ')') {
                        i += 1
                    }

                } else {
                    search_text.push(token);
                    i += 1;
                }

            } else {
                search_text.push(token);
                i += 1;
            }
        }
        if (search_text.length > 0) {
            // remove the last item if the last item is a sub indicator
            if (search_text[search_text.length - 1] === "|") {
                search_text = search_text.slice(0, search_text.length - 1);
            }
            this.props.updateSearchText(search_text.join(""))
        }
    }

    updatePropsWithSlider(metadata, query) {
        if (query.indexOf(metadata) >= 0) {
            query = query.substring(query.indexOf(metadata) + metadata.length + 1)
            if (query.indexOf(",") >= 0) {
                const left = query.substring(0, query.indexOf(",")).trim()
                let right = query.substring(query.indexOf(",") + 1).trim()
                if (right.indexOf(")") >= 0) {
                    right = right.substring(0, right.indexOf(")")).trim()
                    this.props.setCategoryValue(metadata, [parseInt(left), parseInt(right)])
                }
            }
        }
    }

    updatePropsWithDocTypes(query) {
        let docTypes = {}
        const searchTerm = "document-type";
        while (query.indexOf(searchTerm) >= 0) {
            query = query.substring(query.indexOf(searchTerm) + searchTerm.length + 1)
            if (query.indexOf(")") >= 0) {
                const docType = query.substring(0, query.indexOf(")"))
                docTypes[docType] = true
            }
        }
        this.props.setCategoryValue("document-type", docTypes)
    }

    updatePropsWithEntityTypes(query) {
        let entityTypes = {}
        const token_list = tokenize(query);
        let i = 0;
        while (i < token_list.length) {
            const token = token_list[i];
            let next_token = "";
            if (i + 1 < token_list.length)
                next_token = token_list[i + 1];
            if (token === "entity" && next_token === ":") {
                i += 2;
                while (i < token_list.length && token_list[i] === ' ')
                    i += 1
                if (i < token_list.length) {
                    const et = token_list[i];
                    entityTypes[et] = true;
                    break;
                }
                i += 1;
            } else {
                i += 1;
            }
        }
        this.props.setEntityValue(entityTypes);
    }

    updatePropsWithSourceTypes(query) {
        let sourceTypes = {};
        const searchTerm = "source";
        while (query.indexOf(searchTerm) >= 0) {
            query = query.substring(query.indexOf(searchTerm) + searchTerm.length + 1);
            if (query.indexOf(")") >= 0) {
                const sourceTypeString = query.substring(0, query.indexOf(")"));
                const sourceIds = sourceTypeString.split(",").map(idString=>parseInt(idString));

                this.props.source_list.forEach(curSource=>{
                    if (sourceIds.indexOf(curSource.sourceId)>=0){
                        sourceTypes[curSource.name]=true;
                    }
                });

            }
        }
        this.props.setSourceValue(sourceTypes);
    }

    closeAllMenus() {
        this.setState({accounts_dropdown: false, notifications_dropdown: false, show_new_menu: false});
        this.props.onCloseMenus();
    }

    toggleNotificationsDropdown() {
        if (!this.state.notifications_dropdown) {
            this.props.onLoadNotifications()
        }
        this.setState({
            notifications_dropdown: !this.state.notifications_dropdown,
            accounts_dropdown: false,
            show_new_menu: false
        })
        this.props.onCloseMenus();
    }

    toggleAccountsDropdown() {
        this.setState({
            accounts_dropdown: !this.state.accounts_dropdown,
            notifications_dropdown: false,
            show_new_menu: false
        });
        this.props.onCloseMenus();
    }

    closeFocus() {
        this.props.onFocus(null);
    }

    onSearch() {
        this.props.search(this.props.user_search_text, this.props.search_page);
    }

    selectSynSet(name, i) {
        this.props.selectSynSet(name, i);
        this.onSearch();
    }

    onSpellCheck(text) {
        this.props.updateSearchText(text);
        this.props.search(text, this.props.search_page);
    }

    render() {
        if (this.state.has_error) {
            return <h1>search-page.js: Something went wrong.</h1>;
        }
        const show_search = (this.props.show_search_results || (!window.ENV.allow_anon && this.props.user && this.props.user.id));
        const org_name = this.props.organisation && this.props.organisation.name ? this.props.organisation.name : "";
        const user_name = this.props.user && this.props.user.firstName ? (this.props.user.firstName + " " + this.props.user.surname) : "";
        return (
            <div className={this.props.busy ? "dms wait-cursor" : "dms"} onClick={() => this.closeAllMenus()}>
                <ErrorDialog error={this.props.error} onClose={() => this.props.closeError()}/>

                <div className="outer">
                    <Navbar
                        user={this.props.user}
                        onNotificationsDropdown={() => this.toggleNotificationsDropdown()}
                        isNotificationsDropdown={this.state.notifications_dropdown}
                        onAccountsDropdown={() => this.toggleAccountsDropdown()}
                        isAccountsDropdown={this.state.accounts_dropdown}
                        onSearch={(search_text) => this.props.search(search_text)}
                        onHideSearchResults={() => this.props.hideSearchResults()}
                        onUpdateSearchText={(text) => this.props.updateSearchText(text)}
                        onRemoveSavedSearch={(saved_search) => this.props.removeSavedSearch(saved_search)}
                        search_text={this.props.user_search_text}
                        save_search_list={this.props.save_search_list}
                        organisation={this.props.organisation}
                        busy={this.props.busy}
                        showSearchBar={show_search}
                    />

                    {!this.props.show_search_results && window.ENV.allow_anon &&
                        <div className="inner">
                            <HomeSearch
                                onSearch={(search_text) => this.props.search(search_text)}
                                onUpdateSearchText={(text) => this.props.updateSearchText(text)}
                                onRemoveSavedSearch={(saved_search) => this.props.removeSavedSearch(saved_search)}
                                search_text={this.props.user_search_text}
                                save_search_list={this.props.save_search_list}
                            />
                        </div>
                    }

                    { !window.ENV.allow_anon &&
                        <div className={this.props.busy ? "wait-cursor sign-in-menu" : "sign-in-menu"}>
                            <div className="d-none d-lg-flex flex-column text-end me-3 sign-in-float">
                                <p className="org-name mb-0 small">{org_name}</p>
                                <p className="user-name mb-0">{user_name}</p>
                            </div>
                        </div>
                    }

                    { show_search &&
                        <div className="inner overflow-hidden">
                            <SearchResults
                                redaction={this.props.redaction}
                                updateRedaction={(redaction) => this.props.updateRedaction(redaction)}
                                onRedact={(url) => this.props.redactFile(url)}
                                search_result={this.props.search_result}
                                search_result_list={this.props.search_result_list}
                                search_page={this.props.search_page}
                                syn_sets={this.props.syn_sets}
                                hash_tag_list={this.props.hash_tag_list}
                                onSearch={(page) => this.props.search(this.props.user_search_text, page)}
                                onUpdateSearchText={(text) => this.onSpellCheck(text)}
                                onFocus={(item) => this.props.onFocus(item)}
                                client_id={Api.getUserId(this.props.user)}
                                onHideSearchResults={() => this.props.hideSearchResults()}
                                onSetCategoryValue={(metadata, values) => this.props.setCategoryValue(metadata, values)}
                                onSetEntityValue={(values) => this.props.setEntityValue(values)}
                                onSetSourceValue={(value) => this.props.setSourceValue(value)}
                                source_selection={this.props.source_selection}
                                onSetGroupSimilar={(group_similar) => this.props.setGroupSimilar(group_similar)}
                                onSetNewestFirst={(newest_first) => this.props.setNewestFirst(newest_first)}
                                onSelectSynSet={(name, i) => this.selectSynSet(name, i)}
                                onSetHashTags={(tag_list) => this.props.setHashTagList(tag_list)}
                                category_list={this.props.category_list}
                                source_list={this.props.source_list}
                                category_values={this.props.category_values}
                                entity_values={this.props.entity_values}
                                group_similar={this.props.group_similar}
                                newest_first={this.props.newest_first}
                                busy={this.props.busy}
                            />
                        </div>
                    }

                </div>

                {this.props.search_focus &&
                    <div className="overlay">
                        <PreviewModal
                            client_id={Api.getUserId(this.props.user)}
                            search_focus={this.props.search_focus}
                            get_html_preview={(item, page, onSuccess) => this.props.get_html_preview(item, page, onSuccess)}
                            preview_page_list={this.props.preview_page_list}
                            onDownloadFile={this.props.downloadFile}
                            onClose={() => this.closeFocus()}
                        />
                    </div>
                }

            </div>
        );
    }
}

const mapStateToProps = function (state) {
    return {
        error: state.appReducer.error,
        error_title: state.appReducer.error_title,
        busy: state.appReducer.busy,

        save_search_list: state.appReducer.save_search_list,

        session: state.appReducer.session,
        organisation: state.appReducer.organisation,
        user: state.appReducer.user,
        user_search_text: state.appReducer.user_search_text,

        search_info_loaded: state.appReducer.search_info_loaded,
        source_list: state.appReducer.source_list,
        source_selection: state.appReducer.source_selection,
        category_list: state.appReducer.category_list,
        category_values: state.appReducer.category_values,
        entity_values: state.appReducer.entity_values,
        group_similar: state.appReducer.group_similar,
        newest_first: state.appReducer.newest_first,
        syn_sets: state.appReducer.syn_sets,
        hash_tag_list: state.appReducer.hash_tag_list,

        show_search_results: state.appReducer.show_search_results,
        search_result: state.appReducer.search_result,
        search_result_list: state.appReducer.search_result_list,
        search_page: state.appReducer.search_page,
        search_focus: state.appReducer.search_focus,

        redaction: state.appReducer.redaction,

        preview_page_list: state.appReducer.preview_page_list,
    };
};

export default withRouter(connect(
    mapStateToProps,
    dispatch => bindActionCreators(appCreators, dispatch)
)(SearchPage));
