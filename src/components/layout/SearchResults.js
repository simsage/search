import React, {Component} from 'react';

import '../../css/layout/search-results.css';
import Api from "../../common/api";
import {RangeSlider} from "../range-slider/range-slider";
import {CategorySelector} from "../metadata-selectors/category-selector";
import {SynsetSelector} from "../metadata-selectors/synset-selector";

// at least one day's difference between min- and max-value to display
const min_date_difference = 24 * 3600;
// how many of the csv items to display in the syn-set details part
const num_csv_items_in_syn_set_display = 3;

export default class SearchResults extends Component {
    constructor(props){
        super(props);
        this.state={
            has_error: false,  // error trapping
            show_dropdown: false,
        }
    }
    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }
    moreDropdown() {
        this.setState({show_dropdown: !this.state.show_dropdown})
    }
    getPreviewSource(item) {
        if (item && this.props.client_id && item.urlId) {
            return window.ENV.api_base + "/document/preview/" + window.ENV.organisation_id + "/" +
                window.ENV.kb_id + "/" + this.props.client_id + "/" + item.urlId + "/-1"
        } else {
            return "";
        }
    }
    getLimitedItemsFromCsv(csv_string, limit) {
        const items = csv_string.split(',');
        const list = [];
        for (const item of items) {
            if (item && item.trim().length > 0) {
                list.push(item.trim())
            }
            if (list.length >= limit)
                break;
        }
        return list.join(',');
    }
    getSynsetData(sr) {
        const syn_set_list = [];
        if (sr && sr.synSetList) {
            for (const synSet of sr.synSetList) {
                if (synSet && synSet.wordCloudCsvList && synSet.word) {
                    const description_list = [];
                    for (const cloud of synSet.wordCloudCsvList) {
                        description_list.push(this.getLimitedItemsFromCsv(cloud, num_csv_items_in_syn_set_display));
                    }
                    if (description_list.length > 1) {
                        syn_set_list.push({name: synSet.word, description_list: description_list});
                    }
                }
            }
        }
        return syn_set_list;
    }
    // return the document-type metadata list if it exists - or null if not
    getDocumentTypeMetadata(sr) {
        if (sr && sr.categoryList) {
            for (const md of sr.categoryList) {
                if (md.metadata === "document-type") {
                    return md;
                }
            }
        }
        return null;
    }
    getTimeRangeMetadata(category_list, category_values, metadata_name) {
        if (category_list) {
            for (const md of category_list) {
                if (md.metadata === metadata_name && md.maxValue && md.minValue) {
                    const data = category_values[metadata_name];
                    if (data) {
                        const minValue = md && md["minValue"] ? md["minValue"] : 0;
                        const maxValue = md && md["maxValue"] ? md["maxValue"] : 0;
                        const currentMinValue = data && data.minValue ? data.minValue : minValue;
                        const currentMaxValue = data && data.maxValue ? data.maxValue : maxValue;
                        const delta = maxValue - minValue;
                        if (delta > min_date_difference) {
                            md.minValue = minValue;
                            md.maxValue = maxValue;
                            md.currentMinValue = currentMinValue;
                            md.currentMaxValue = currentMaxValue;
                            return md;
                        }
                    } else {
                        const minValue = md && md["minValue"] ? md["minValue"] : 0;
                        const maxValue = md && md["maxValue"] ? md["maxValue"] : 0;
                        const delta = maxValue - minValue;
                        if (delta > min_date_difference) {
                            md.minValue = minValue;
                            md.maxValue = maxValue;
                            md.currentMinValue = minValue;
                            md.currentMaxValue = maxValue;
                            return md;
                        }
                    }
                }
            }
        }
        return null;
    }

    onFocus(e, sr) {
        e.preventDefault();
        e.stopPropagation();
        if (sr && sr.url && sr.urlId && sr.sourceId && this.props.onFocus) {
            this.props.onFocus(sr.sourceId, sr.url, sr.urlId);
        }
    }

    hashTagKeyPress(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            let text = event.target.value;
            document.getElementById("hash-tag-text").value = "";
            if (text.trim().length > 0) {
                const hash_tag_list = this.props.hash_tag_list ? this.props.hash_tag_list : [];
                if (hash_tag_list.indexOf(text.trim()) === -1) {
                    hash_tag_list.push(text.trim());
                    if (this.props.onSetHashTags) this.props.onSetHashTags(hash_tag_list);
                    window.location.reload(false);
                }
            }
        } else if (event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    removeHashTag(event, tag) {
        event.preventDefault();
        event.stopPropagation();
        let hash_tag_list = this.props.hash_tag_list ? this.props.hash_tag_list : [];
        hash_tag_list = hash_tag_list.filter( (value) => { return value !== tag });
        if (this.props.onSetHashTags) this.props.onSetHashTags(hash_tag_list);
    }

    urlToBreadCrumb(result) {
        if (result && result.url && result.url.length > 0) {
            const list = Api.pathFromUrl(result.url);
            let str = "";
            for (const item of list) {
                if (str.length > 0) {
                    str += " / ";
                }
                str += item;
            }
            return str;
        }
        return "";
    }

    render() {
        if (this.state.has_error) {
            return <h1>SearchResults.js: Something went wrong.</h1>;
        }
        const sr = this.props.search_result;
        const category_list = this.props.category_list ? this.props.category_list : [];
        const category_values = this.props.category_values ? this.props.category_values : {};
        const result_list = (sr && sr.resultList) ? sr.resultList : [];
        let page = sr.page ? sr.page : 0;
        let divided = sr.totalDocumentCount / window.ENV.page_size;
        let num_pages = parseInt("" + divided);
        if (parseInt("" + divided) < divided) {
            num_pages += 1;
        }
        if (num_pages === 0)
            num_pages = 1;
        const documentTypeMetadata = this.getDocumentTypeMetadata(sr);
        const synset_list = this.getSynsetData(sr);
        const createdMetadata = this.getTimeRangeMetadata(category_list, category_values, "created");
        const lastModifiedMetadata = this.getTimeRangeMetadata(category_list, category_values, "last-modified");
        let srText = ""
        if (sr.totalDocumentCount === 0) {
            srText = "No results...";
        } else {
            srText = "Total of " + sr.totalDocumentCount + " Results";
        }
        const hash_tag_list = (this.props.hash_tag_list && this.props.hash_tag_list.length > 0) ? this.props.hash_tag_list : [];
        return (
            <div className="h-100">
                <div className="row mx-0 sec-topbar py-2 px-4 d-flex justify-content-center align-items-center">
                    <div className="sec-functions col-xxl-10">
                        {/* <button className="btn sec-btn">
                            <img src="../images/icon/icon_sr-back.svg" alt="back" className=""
                                 onClick={() => {if (this.props.onHideSearchResults) this.props.onHideSearchResults()}}
                            />
                        </button> */}
                        <span className="small text-muted ms-2 fw-light">
                            {srText}
                            <span className={sr.totalDocumentCount === 0 ? "d-none" : ""}> - Page {page + 1} of {num_pages}</span>
                        </span>
                    </div>
                </div>
                <div className="row mx-0 px-2 results-container justify-content-center">
                    <div className="col-xxl-7 col-xl-8 pe-4">
                        { sr && sr.text && sr.text.length > 0 &&
                            <div className="result-mind p-4 mb-5 mx-3">
                                {sr.text}
                                { sr && sr.urlList && sr.urlList.length > 0 &&
                                    <br/>
                                }
                                { sr && sr.urlList && sr.urlList.length > 0 &&
                                    sr.urlList.map((url, i) => {
                                        return (<div className="pt-2" key={i}>
                                                    <a href={url} target="_blank" rel="noreferrer" key={i}
                                                   className="pointer-cursor py-1 fw-bold" title={url}>{url}</a>
                                                </div>);
                                    })
                                }
                            </div>
                        }
                        {
                            result_list.map( (result, i) => {
                                const last_modified = Api.unixTimeConvert(result.lastModified);
                                const text = Api.highlight((result.textList && result.textList.length > 0) ? result.textList[0] : "");
                                const metadata_lists = Api.getMetadataLists(result.metadata);
                                const tag_list = metadata_lists["tag_list"];
                                const image_url = this.getPreviewSource(result);
                                return (
                                    <div className="result-content d-flex pb-4 mb-3 px-3" key={i}>
                                        <img src={image_url} alt="" className="result-preview d-none d-lg-block" />
                                        <div className="ms-3 w-100">
                                            <div className="d-flex align-items-center text-align-end mb-1">
                                                <p className="mb-0 result-breadcrumb me-2">{this.urlToBreadCrumb(result)}</p>
                                            </div>
                                            <a href="/#/dms" className="mb-2 results-filename"
                                               onClick={(e) => this.onFocus(e, result)} title={result.url}>{result.url}</a>
                                            <div className="d-flex mb-1">
                                                <p className="mb-0 result-details">Last modified {last_modified}</p>
                                                {/*<span className="mb-0 result-details mx-2">|</span>*/}
                                                {/*<p className="mb-0 result-details">Owner Rock de Vocht</p>*/}
                                            </div>
                                            <p className="small fw-light mb-2" dangerouslySetInnerHTML={{ __html: text}} />
                                            <div className="d-flex align-items-center flex-wrap">
                                                { tag_list.map((tag, i) => {
                                                    return (<span className="tag me-2 mb-2" key={1000+i}>{tag.value}</span>);
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }

                    </div>
                    <div className="col-xxl-3 col-xl-4 ps-3 pe-4 pe-xxl-3 order-first order-xl-last mb-5">
                        <div className="sticky-top">
                            
                            <div className="row">

                                <div className="col-8 pe-4">
                                    <div className="mx-0 result-time-filter">


                                        {/* Some good logic in link below around duplicate tags and backspace in input to remove */}
                                        {/* https://codepen.io/asuran/pen/GbjwBG?editors=0110 */}
                                        <div className="category-selector list-group pt-1">
                                            <label className="list-group-item p-0 overflow-hidden d-flex flex-wrap">
                                                <ul className="d-flex flex-wrap mb-0 ms-2 ps-0">
                                                    {
                                                        hash_tag_list.map((tag, i) => {
                                                            return (
                                                                <li key={i} className="tag mt-2 me-1" title={"hash-tag " + tag}>{tag}
                                                                    <span className="remove-tag ms-1 pointer-cursor" onClick={(e) => this.removeHashTag(e, tag)}>&times;</span>
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                                <input type="text" id="hash-tag-text" placeholder="Filter by tags..." className="py-2 px-3 w-100 border-0"
                                                       onKeyPress = {(event) => this.hashTagKeyPress(event) }/>
                                            </label>
                                        </div>

                                        { lastModifiedMetadata &&
                                        <div className="w-100 mt-4">
                                            <label htmlFor="customRange3" className="form-label mb-0">Last modified:</label>
                                            <RangeSlider domain={[lastModifiedMetadata.minValue,lastModifiedMetadata.maxValue]}
                                                         onSetValue={(values) => {if (this.props.onSetCategoryValue) this.props.onSetCategoryValue("last-modified", values)}}
                                                         values={[lastModifiedMetadata.currentMinValue,lastModifiedMetadata.currentMaxValue]}/>
                                        </div>
                                        }
                                        { createdMetadata &&
                                        <div className="w-100">
                                            <label htmlFor="customRange3" className="form-label mb-0">Created:</label>
                                            <RangeSlider domain={[createdMetadata.minValue,createdMetadata.maxValue]}
                                                         onSetValue={(values) => {if (this.props.onSetCategoryValue) this.props.onSetCategoryValue("created", values)}}
                                                         values={[createdMetadata.currentMinValue,createdMetadata.currentMaxValue]}/>
                                        </div>
                                        }
                                    {/* </div>
                                    <div className="mb-4 mt-4"> */}
                                        <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                                            <input className="form-check-input h6 ms-0 my-0 me-2" 
                                                type="checkbox" 
                                                role="switch"       
                                                id="flexSwitchCheckDefault" 
                                                checked={this.props.group_similar}
                                                onChange={(event) => {if (this.props.onSetGroupSimilar) this.props.onSetGroupSimilar(event.target.checked)}}
                                            />
                                            <label className="" htmlFor="flexSwitchCheckDefault">Group similar</label>
                                        </div>


                                        <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                                            <input className="form-check-input h6 ms-0 my-0 me-2"
                                                   type="checkbox"
                                                   role="switch"
                                                   id="flexSwitchCheckDefault"
                                                   checked={this.props.newest_first}
                                                   onChange={(event) => {if (this.props.onSetNewestFirst) this.props.onSetNewestFirst(event.target.checked)}}
                                            />
                                            <label className="" htmlFor="flexSwitchCheckDefault">Sort by newest first</label>
                                        </div>

                                    </div>


                                    {
                                        synset_list.map((synset, i) => {
                                            return (
                                                <div className="" key={i}>
                                                    {/* <div className=""> */}
                                                        <SynsetSelector
                                                            name={synset.name}
                                                            syn_sets={this.props.syn_sets}
                                                            onSelectSynSet={(name, i) => {if (this.props.onSelectSynSet) this.props.onSelectSynSet(name, i)}}
                                                            description_list={synset.description_list}/>
                                                    {/* </div> */}
                                                </div>
                                            )
                                        })
                                    }

                                </div>

                                <div className="col-4 ps-0">
                                    { documentTypeMetadata && documentTypeMetadata.items && documentTypeMetadata.items.length > 0 &&
                                    <div className="w-100 result-document-filter pb-3">
                                        <CategorySelector
                                            title="File types"
                                            onSetValue={(value) => { if (this.props.onSetCategoryValue) this.props.onSetCategoryValue("document-type", value)}}
                                            items={documentTypeMetadata.items}/>
                                    </div>
                                    }
                                </div>


                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}