

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


/**
 * this is the main DMS page
 */
export class SearchPage extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            notifications_dropdown: false,
            accounts_dropdown: false,
            show_new_menu: false,
            files_for_upload: null,
            show_sign_in: false,
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }

    componentDidMount() {
        // do we not have a valid userId yet for the dashboard?
        if (!this.props.search_info_loaded)
            this.props.getSearchInfo();
    }

    closeAllMenus() {
        this.setState({accounts_dropdown: false, notifications_dropdown: false, show_new_menu: false});
        this.props.onCloseMenus();
    }

    toggleNotificationsDropdown() {
        if(!this.state.notifications_dropdown){
            this.props.onLoadNotifications()
        }
        this.setState({notifications_dropdown: !this.state.notifications_dropdown, accounts_dropdown: false, show_new_menu: false})
        this.props.onCloseMenus();
    }

    toggleAccountsDropdown() {
        this.setState({accounts_dropdown: !this.state.accounts_dropdown, notifications_dropdown: false, show_new_menu: false});
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
    render() {
        if (this.state.has_error) {
            return <h1>search-page.js: Something went wrong.</h1>;
        }
        return (
            <div className={this.props.busy ? "dms wait-cursor" : "dms"} onClick={() => this.closeAllMenus()}>
                <ErrorDialog error={this.props.error} onClose={() => this.props.closeError()} />

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
                        showSearchBar={this.props.show_search_results}
                    />

                    {!this.props.show_search_results &&
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

                    {this.props.show_search_results &&
                    <div className="inner overflow-hidden">
                        <SearchResults
                            search_result={this.props.search_result}
                            search_result_list={this.props.search_result_list}
                            search_page={this.props.search_page}
                            syn_sets={this.props.syn_sets}
                            hash_tag_list={this.props.hash_tag_list}
                            onSearch={(page) => this.props.search(this.props.user_search_text, page)}
                            onFocus={(item) => this.props.onFocus(item)}
                            client_id={Api.getUserId(this.props.user)}
                            onHideSearchResults={() => this.props.hideSearchResults()}
                            onSetCategoryValue={(metadata, values) => this.props.setCategoryValue(metadata, values)}
                            onSetGroupSimilar={(group_similar) => this.props.setGroupSimilar(group_similar)}
                            onSetNewestFirst={(newest_first) => this.props.setNewestFirst(newest_first)}
                            onSelectSynSet={(name, i) => this.selectSynSet(name, i)}
                            onSetHashTags={(tag_list) => this.props.setHashTagList(tag_list)}
                            category_list={this.props.category_list}
                            category_values={this.props.category_values}
                            group_similar={this.props.group_similar}
                            newest_first={this.props.newest_first}
                            busy={this.props.busy}
                            />
                    </div>
                    }

                </div>

                { this.props.search_focus &&
                    <div className="overlay">
                        <PreviewModal
                            client_id={Api.getUserId(this.props.user)}
                            search_focus={this.props.search_focus}
                            get_html_preview={(item, page, onSuccess) => this.props.get_html_preview(item, page, onSuccess)}
                            preview_page_list={this.props.preview_page_list}
                            onClose={() => this.closeFocus() }
                            />
                    </div>
                }

            </div>
        );
    }
}

const mapStateToProps = function(state) {
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
        category_list: state.appReducer.category_list,
        category_values: state.appReducer.category_values,
        group_similar: state.appReducer.group_similar,
        newest_first: state.appReducer.newest_first,
        syn_sets: state.appReducer.syn_sets,
        hash_tag_list: state.appReducer.hash_tag_list,

        show_search_results: state.appReducer.show_search_results,
        search_result: state.appReducer.search_result,
        search_result_list: state.appReducer.search_result_list,
        search_page: state.appReducer.search_page,
        search_focus: state.appReducer.search_focus,

        preview_page_list: state.appReducer.preview_page_list,
    };
};

export default connect(
    mapStateToProps,
    dispatch => bindActionCreators(appCreators, dispatch)
)(SearchPage);
