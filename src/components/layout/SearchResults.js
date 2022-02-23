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
            prevY: 0, // infinite scrolling
        }
        this.scrollRef = React.createRef();
    }

    componentDidCatch(error, info) {
        this.setState({ has_error: true });
        console.log(error, info);
    }


    handleObserver(entities, observer) {
        const y = entities[0].boundingClientRect.y;

        if (this.state.prevY > y) {
            const sr = this.props.search_result;
            // let page = sr.page ? sr.page : 0;
            let divided = sr.totalDocumentCount / window.ENV.page_size;
            if (divided > 0) {
                let num_pages = parseInt("" + divided);
                if (parseInt("" + divided) < divided) {
                    num_pages += 1;
                }
                if (num_pages === 0)
                    num_pages = 1;
                if (this.props.search_page + 1 < num_pages) {
                    this.onSearch(this.props.search_page + 1);
                }
            }
        }
        this.setState({ prevY: y });
    }

    componentDidMount() {
        let options = {
            root: null,
            rootMargin: "0px",
            threshold: 1.0
        };
        this.observer = new IntersectionObserver(
            this.handleObserver.bind(this),
            options
        );
        this.observer.observe(this.loadingRef);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // scroll to the top when the search results have changed
        const sr1 = this.props.search_result;
        const sr2 = prevProps.search_result;
        if (sr1.search_text !== sr2.search_text) {
            window.setTimeout(() => {this.scrollRef.current.scrollIntoView()}, 100);
        }
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
            if (text.trim().length > 0) {
                this.onSearch(this.props.search_page);
            }
        } else if (event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
        }
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

    onSearch(page) {
        if (this.props.onSearch) {
            this.props.onSearch(page);
        }
    }

    // update the values of the range slider - and do a search
    onSetRangerSlider(name, values) {

        if (this.props.onSetCategoryValue) {
            this.props.onSetCategoryValue(name, values);
            this.onSearch(this.props.search_page);
        }
    }

    onSetGroupSimilar(value) {
        if (this.props.onSetGroupSimilar) {
            this.props.onSetGroupSimilar(value);
            this.onSearch(this.props.search_page);
        }
    }

    onSetNewestFirst(value) {
        if (this.props.onSetNewestFirst) {
            this.props.onSetNewestFirst(value);
            this.onSearch(this.props.search_page);
        }
    }

    onSetCategoryValue(value) {
        if (this.props.onSetCategoryValue) {
            this.props.onSetCategoryValue("document-type", value);
            this.onSearch(this.props.search_page);
        }
    }

    render() {
        if (this.state.has_error) {
            return <h1>SearchResults.js: Something went wrong.</h1>;
        }
        const sr = this.props.search_result;

        const category_list = this.props.category_list ? this.props.category_list : [];
        const category_values = this.props.category_values ? this.props.category_values : {};
        const result_list = this.props.search_result_list ? this.props.search_result_list : [];
        const documentTypeMetadata = this.getDocumentTypeMetadata(sr);
        const synset_list = this.getSynsetData(sr);
        const createdMetadata = this.getTimeRangeMetadata(category_list, category_values, "created");
        const lastModifiedMetadata = this.getTimeRangeMetadata(category_list, category_values, "last-modified");
        let srText = ""
        if (sr.totalDocumentCount === 0) {
            srText = "No results...";
        } else {
            srText = "" + sr.totalDocumentCount + " results";
        }

        const hash_tag_list = (this.props.hash_tag_list && this.props.hash_tag_list.length > 0) ? this.props.hash_tag_list : [];

        return (
            <div className={this.props.busy ? "h-100 wait-cursor" : "h-100"}>
                <div className="row mx-0 px-2 results-container overflow-auto h-100 justify-content-center">
                    <div className="col-xxl-7 col-xl-8 pe-4">
                        <div className="small text-muted ms-2 fw-light px-3 pb-3" ref={this.scrollRef}>
                            {srText}
                        </div>
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
                                const title = result.title ? result.title : "";
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
                                            <span className="mb-2 results-filename text-break pointer-cursor" onClick={() => { if (this.props.onFocus) this.props.onFocus(result)}} title={result.url}>{result.url}</span>
                                            { title &&
                                                <div className="d-flex align-items-center mb-1">
                                                    <span className="mb-0 result-details-title">&#12299;{title}&#12298;</span>
                                                </div>
                                            }
                                            <div className="d-flex align-items-center mb-1">
                                                <span className="mb-0 result-details">Last modified {last_modified}</span>
                                                {result.author &&
                                                    <span className="d-flex align-items-center">
                                                        <span className="mb-0 result-details mx-2">|</span>
                                                        <span className="mb-0 result-details">{result.author}</span>
                                                    </span>
                                                }
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

                        { /* infinite scrolling */ }
                        <div ref={loadingRef => (this.loadingRef = loadingRef)} />

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
                                                                <li key={i} className="tag mt-2 me-1" title={"hash-tag " + tag}>{tag}</li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                                <input type="text" id="hash-tag-text" placeholder="Filter by tags..." className="py-2 px-3 w-100 border-0"
                                                       disabled={this.props.busy}
                                                       onKeyPress = {(event) => this.hashTagKeyPress(event) }/>
                                            </label>
                                        </div>

                                        { lastModifiedMetadata &&
                                        <div className="w-100 mt-4">
                                            <label htmlFor="customRange3" className="form-label mb-0">Last modified:</label>
                                            <RangeSlider domain={[lastModifiedMetadata.minValue,lastModifiedMetadata.maxValue]}
                                                         onSetValue={(values) => this.onSetRangerSlider("last-modified", values)}
                                                         values={[lastModifiedMetadata.currentMinValue,lastModifiedMetadata.currentMaxValue]}/>
                                        </div>
                                        }
                                        { createdMetadata &&
                                        <div className="w-100">
                                            <label htmlFor="customRange3" className="form-label mb-0">Created:</label>
                                            <RangeSlider domain={[createdMetadata.minValue,createdMetadata.maxValue]}
                                                         onSetValue={(values) => this.onSetRangerSlider("created", values)}
                                                         values={[createdMetadata.currentMinValue,createdMetadata.currentMaxValue]}/>
                                        </div>
                                        }
                                    {/* </div>
                                    <div className="mb-4 mt-4"> */}
                                        <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                                            <input className="form-check-input h6 ms-0 my-0 me-2" 
                                                type="checkbox" 
                                                role="switch"
                                                disabled={this.props.busy}
                                                id="flexSwitchCheckDefault"
                                                checked={this.props.group_similar}
                                                onChange={(event) => this.onSetGroupSimilar(event.target.checked)}
                                            />
                                            <label className="" htmlFor="flexSwitchCheckDefault">Group similar</label>
                                        </div>


                                        <div className="form-check form-switch my-4 ps-0 d-flex align-items-center">
                                            <input className="form-check-input h6 ms-0 my-0 me-2"
                                                   type="checkbox"
                                                   disabled={this.props.busy}
                                                   role="switch"
                                                   id="flexSwitchCheckDefault"
                                                   checked={this.props.newest_first}
                                                   onChange={(event) => this.onSetNewestFirst(event.target.checked)}
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
                                                            busy={this.props.busy}
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
                                            busy={this.props.busy}
                                            onSetValue={(value) => this.onSetCategoryValue(value)}
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
