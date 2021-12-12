import React, {Component} from 'react';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {appCreators} from "../actions/appActions";

import '../css/dms-page.css';

import LeftSidebar from "../components/layout/LeftSidebar.js";
import Navbar from "../components/layout/Navbar.js";
import MainSection from "../components/layout/MainSection.js";
import RightSidebar from "../components/layout/RightSidebar.js";
import SearchResults from "../components/layout/SearchResults.js";
import LockedSection from "../components/layout/LockedSection.js";
import SubscribedSection from "../components/layout/SubscribedSection.js";

import NotificationsDropdown from "../components/navbar/NotificationsDropdown.js";
import AccountDropdown from "../components/navbar/AccountDropdown.js";

import ErrorDialog from "../common/error-dialog";
import Api from "../common/api";
import UploadFiles from "../file_upload/upload-files.component";


/**
 * this is the main DMS page
 */
export class DmsPage extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            notifications_dropdown: false,
            accounts_dropdown: false,
            show_new_menu: false,
            files_for_upload: null,
        }
    }
    componentDidMount() {
        if (!this.props.session || !this.props.session.id) {
            this.navigateToSignIn();
        } else {
            // do we not have a valid userId yet for the dashboard?
            if (this.props.dashboard_user_id === '')
                this.props.getUserDashboard();
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    signOut() {
        this.props.signOut(() => {
            window.location = '/';
        });
    }

    focusOnFile(file) {
        if (file && file.url && file.urlId) {
            this.props.selectFile(file.url, file.urlId);
        } else {
            this.props.selectFile(null, null);
        }
    }

    // focus on an item - switch to main view (select-folder) and open the right-side bar
    focusOnItem(sourceId, url, urlId) {
        if (url) {
            if (sourceId > 0) {
                const folder_url = Api.folderFromUrl(url);
                const folder = {isFolder: true, sourceId: sourceId, url: folder_url};
                this.props.selectFolder(folder, false);
            }
            this.props.selectFile(url, urlId);
        }
    }

    startFileUpload() {
        this.closeLocalMenus();
        document.getElementById("file-input").click();
    }
    startFolderUpload() {
        this.closeLocalMenus();
        document.getElementById("folder-input").click();
    }
    addFolderAndClose(parent_item, folder_name) {
        this.closeLocalMenus();
        if (parent_item && folder_name)
            this.props.addFolder(parent_item, folder_name);
    }
    addSourceAndClose(source_name) {
        this.closeLocalMenus();
        if (source_name) {
            this.props.addSource(source_name);
        }
    }
    selectFiles(e) {
        this.closeLocalMenus();
        this.setState({files_for_upload: e.target.files});
    }
    closeFileUpload() {
        this.setState({files_for_upload: null});
        document.getElementById("file-input").value = "";
        document.getElementById("folder-input").value = "";
    }

    navigateToSignIn() {
        window.location = "/#/";
    }

    closeAllMenus() {
        this.setState({accounts_dropdown: false, notifications_dropdown: false, show_new_menu: false});
        this.props.onCloseMenus();
    }

    closeLocalMenus() {
        this.setState({accounts_dropdown: false, notifications_dropdown: false, show_new_menu: false});
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

    toggleNewMenu() {
        this.setState({accounts_dropdown: false, notifications_dropdown: false, show_new_menu: !this.state.show_new_menu});
        this.props.onCloseMenus();
    }

    render() {
        if (this.state.has_error) {
            return <h1>dms-page.js: Something went wrong.</h1>;
        }
        const is_toggled = (this.props.selected_file !== null);

        return (
            <div className={this.props.busy ? "dms wait-cursor" : "dms"}
                 onClick={() => this.closeAllMenus()}>
                <ErrorDialog error={this.props.error} onClose={() => this.props.closeError()} />

                {/* <LeftSidebar
                    show_new_menu={this.state.show_new_menu}
                    onSelectSource={(source_id) => this.props.selectSource(source_id)}
                    onSelectRoot={() => this.props.selectRoot()}
                    onFileUpload={() => this.startFileUpload()}
                    onFolderUpload={() => this.startFolderUpload()}
                    onShowSubscriptions={() => this.props.showSubscriptions()}
                    onShowLocks={() => this.props.showLocks()}
                    onNewFolder={(parent_item, folder_name) => this.addFolderAndClose(parent_item, folder_name)}
                    onNewSource={(source_name) => this.addSourceAndClose(source_name)}
                    breadcrumbList={this.props.breadcrumb_list}
                    onToggleNewMenu={() => this.toggleNewMenu()}
                    selected_source={this.props.selected_source}
                    show_locks={this.props.show_locks}
                    show_subscribed={this.props.show_subscribed}
                    has_files_for_upload={this.state.files_for_upload && this.state.files_for_upload.length >= 0}
                    disabled={this.props.show_search_results || this.props.show_locks || this.props.show_subscribed}
                    crawlerList={this.props.source_list} /> */}

                <div className="outer">
                    <Navbar
                        user={this.props.user}
                        onNotificationsDropdown={() => this.toggleNotificationsDropdown()}
                        isNotificationsDropdown={this.state.notifications_dropdown}
                        onAccountsDropdown={() => this.toggleAccountsDropdown()}
                        isAccountsDropdown={this.state.accounts_dropdown}
                        onSearch={(search_text) => this.props.search(search_text)}
                        onUpdateSearchText={(text) => this.props.updateSearchText(text)}
                        onRemoveSavedSearch={(saved_search) => this.props.removeSavedSearch(saved_search)}
                        search_text={this.props.user_search_text}
                        save_search_list={this.props.save_search_list}
                        organisation={this.props.organisation}
                        busy={this.props.busy}
                    />

                    {/* {!this.props.show_search_results && !this.props.show_locks && !this.props.show_subscribed &&
                    <div className="inner d-flex">
                        <MainSection
                            show_grid={this.props.show_grid}
                            onChangeView={() => this.props.changeView()}
                            focusOnFile={(file) => this.focusOnFile(file)}
                            crawlerList={this.props.source_list}
                            folderList={this.props.folder_list}
                            fileList={this.props.file_list}
                            subscription_set={this.props.subscription_set}
                            checkout_set={this.props.checkout_set}
                            breadcrumbList={this.props.breadcrumb_list}
                            show_uploader={this.props.show_uploader}
                            sideBarToggled={is_toggled}
                            onClose={() => this.props.selectFile(null, null)}
                            onSelectRoot={() => this.props.selectRoot()}
                            onSelectSource={(source_id) => this.props.selectSource(source_id)}
                            onSelectFolder={(folder) => this.props.selectFolder(folder)}
                            onNewFolder={(parent_item, folder_name) => this.addFolderAndClose(parent_item, folder_name)}
                            selected_file={this.props.selected_file}
                            onShowMenu={(item) => {if (this.props.onShowMenu) {this.closeLocalMenus(); this.props.onShowMenu(item)}}}
                            onSubscribe={(file) => this.props.addSubscription(file)}
                            onUnsubscribe={(file) => this.props.removeSubscription(file)}
                            onRename={(item, new_name) => this.props.onRename(item, new_name)}
                            onLock={(file) => this.props.onLock(file)}
                            onUnlock={(file) => this.props.onUnlock(file)}
                            onDownload={(file) => this.props.downloadFile(file)}
                            onDelete={(item) => this.props.deleteFileOrFolder(item)}
                            onDeleteSource={(source) => this.props.deleteSource(source)}
                        />

                        <RightSidebar
                            isOpen={is_toggled}
                            onClose={() => this.props.selectFile(null, null)}
                            onDownloadVersion={(file, version) => this.props.downloadFileVersion(file, version)}
                            onRemoveComment={(file,comment_id) => this.props.removeComment(file,comment_id)}
                            onAddComment={(file,text) => this.props.addComment(file,text)}
                            onDownloadFile={(file) => this.props.downloadFile(file)}
                            onUpdateHashTags={(file, tag_list) => this.props.updateHashTags(file, tag_list)}
                            file={this.props.selected_file}
                            client_id={(this.props.user && this.props.user.id) ? this.props.user.id : ""}
                            subscription_set={this.props.subscription_set}
                            onSubscribe={(file) => this.props.addSubscription(file)}
                            onUnsubscribe={(file) => this.props.removeSubscription(file)}
                            onRename={(item, new_name) => this.props.onRename(item, new_name)}
                            checkout_set={this.props.checkout_set}
                            onLock={(file) => this.props.onLock(file)}
                            onUnlock={(file) => this.props.onUnlock(file)}
                            onDownload={(file) => this.props.downloadFile(file)}
                            onDelete={(item) => this.props.deleteFileOrFolder(item)}
                        />
                    </div>
                    } */}

                    {/* {this.props.show_locks &&
                    <LockedSection
                        show_grid={this.props.show_grid}
                        onChangeView={() => this.props.changeView()}
                        onFocus={(sourceId, url, urlId) => this.focusOnItem(sourceId, url, urlId)}
                        subscription_list={this.props.subscription_list}
                        subscription_set={this.props.subscription_set}
                        checkout_set={this.props.checkout_set}
                        checkout_list={this.props.checkout_list}
                        onSelectFolder={(folder) => this.props.selectFolder(folder)}
                        selected_file={this.props.selected_file}
                        onShowMenu={(item) => {if (this.props.onShowMenu) {this.closeLocalMenus(); this.props.onShowMenu(item)}}}
                        onSubscribe={(file) => this.props.addSubscription(file)}
                        onUnsubscribe={(file) => this.props.removeSubscription(file)}
                        onRename={(item, new_name) => this.props.onRename(item, new_name)}
                        onLock={(file) => this.props.onLock(file)}
                        onUnlock={(file) => this.props.onUnlock(file)}
                        onDownload={(file) => this.props.downloadFile(file)}
                        onDelete={(item) => this.props.deleteFileOrFolder(item)}
                        />
                    } */}

                    {/* {this.props.show_subscribed &&
                    <SubscribedSection
                        show_grid={this.props.show_grid}
                        onChangeView={() => this.props.changeView()}
                        onFocus={(sourceId, url, urlId) => this.focusOnItem(sourceId, url, urlId)}
                        subscription_list={this.props.subscription_list}
                        subscription_set={this.props.subscription_set}
                        checkout_set={this.props.checkout_set}
                        onSelectFolder={(folder) => this.props.selectFolder(folder)}
                        selected_file={this.props.selected_file}
                        onShowMenu={(item) => {if (this.props.onShowMenu) {this.closeLocalMenus(); this.props.onShowMenu(item)}}}
                        onSubscribe={(file) => this.props.addSubscription(file)}
                        onUnsubscribe={(file) => this.props.removeSubscription(file)}
                        onRename={(item, new_name) => this.props.onRename(item, new_name)}
                        onLock={(file) => this.props.onLock(file)}
                        onUnlock={(file) => this.props.onUnlock(file)}
                        onDownload={(file) => this.props.downloadFile(file)}
                        onDelete={(item) => this.props.deleteFileOrFolder(item)}
                        />
                    } */}

                    {this.props.show_search_results &&
                    <div className="inner">
                        <SearchResults
                            search_result={this.props.search_result}
                            syn_sets={this.props.syn_sets}
                            hash_tag_list={this.props.hash_tag_list}
                            client_id={(this.props.user && this.props.user.id) ? this.props.user.id : ""}
                            onHideSearchResults={() => this.props.hideSearchResults()}
                            onSetCategoryValue={(metadata, values) => this.props.setCategoryValue(metadata, values)}
                            onSetGroupSimilar={(group_similar) => this.props.setGroupSimilar(group_similar)}
                            onSelectSynSet={(name, i) => this.props.selectSynSet(name, i)}
                            onSetHashTags={(tag_list) => this.props.setHashTagList(tag_list)}
                            category_list={this.props.category_list}
                            category_values={this.props.category_values}
                            group_similar={this.props.group_similar}
                            onFocus={(sourceId, url, urlId) => this.focusOnItem(sourceId, url, urlId)}
                            />
                    </div>
                    }

                    {/* OnClick events in Navbar to trigger these. OnOutsideClick to close */}
                    <NotificationsDropdown
                        activity_list={this.props.activity_list}
                        isNotificationsDropdown={this.state.notifications_dropdown}
                    />
                    <AccountDropdown 
                        onSignOut={() => this.props.signOut(() => this.navigateToSignIn())}
                        isAccountsDropdown={this.state.accounts_dropdown}
                    />

                </div>

                <UploadFiles
                    files_for_upload={this.state.files_for_upload}
                    session_id={(this.props.session && this.props.session.id) ? this.props.session.id : ""}
                    breadcrumbList={this.props.breadcrumb_list}
                    onUpdateFolder={(folder) => this.props.updateFolder(folder)}
                    onCloseFileupload={() => this.closeFileUpload()} />

                {/* file upload */}
                <input id="file-input" type="file" multiple
                       onChange={(e) => this.selectFiles(e)}
                       style={{display: 'none'}} />

                {/* directory upload */}
                <input id="folder-input" type="file" webkitdirectory="true" directory="true" mozdirectory="true" multiple
                       onChange={(e) => this.selectFiles(e)}
                       style={{display: 'none'}} />

            </div>
        );
    }
}

const mapStateToProps = function(state) {
    return {
        error: state.appReducer.error,
        error_title: state.appReducer.error_title,
        busy: state.appReducer.busy,

        source_list: state.appReducer.source_list,
        folder_list: state.appReducer.folder_list,
        file_list: state.appReducer.file_list,
        activity_list: state.appReducer.activity_list,
        save_search_list: state.appReducer.save_search_list,
        breadcrumb_list: state.appReducer.breadcrumb_list,

        session: state.appReducer.session,
        organisation: state.appReducer.organisation,
        user: state.appReducer.user,
        user_search_text: state.appReducer.user_search_text,

        dashboard_user_id: state.appReducer.dashboard_user_id,
        selected_source: state.appReducer.selected_source,
        selected_file: state.appReducer.selected_file,
        subscription_set: state.appReducer.subscription_set,
        subscription_list: state.appReducer.subscription_list,
        checkout_set: state.appReducer.checkout_set,
        checkout_list: state.appReducer.checkout_list,
        category_list: state.appReducer.category_list,
        category_values: state.appReducer.category_values,
        group_similar: state.appReducer.group_similar,
        syn_sets: state.appReducer.syn_sets,
        hash_tag_list: state.appReducer.hash_tag_list,

        show_search_results: state.appReducer.show_search_results,
        search_result: state.appReducer.search_result,
        show_locks: state.appReducer.show_locks,
        show_subscribed: state.appReducer.show_subscribed,

        show_uploader: state.appReducer.show_uploader,
        show_grid: state.appReducer.show_grid,
    };
};

export default connect(
    mapStateToProps,
    dispatch => bindActionCreators(appCreators, dispatch)
)(DmsPage);
