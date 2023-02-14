
import './TitleBar.css';
import {go_home} from "../reducers/searchSlice";
import {SearchBox} from "./SearchBox";
import {useDispatch} from "react-redux";
import {get_enterprise_logo} from "../common/Api";

/**
 * top title bar of SimSage search
 *
 */
export function TitleBar(props) {
    const dispatch = useDispatch();

    function on_go_home(e) {
        const customerLink = window.ENV.customer_website;
        // hide search results
        if (customerLink && customerLink !== '') {
            e.preventDefault();
            e.stopPropagation();
            window.open(customerLink, 'blank');
        } else {
            dispatch(go_home());
        }
    }

    return (
        <div className="border-bottom-0 row mx-0 px-0 navbar title_bar justify-content-start">
            <div className={"col-1 ps-4 pe-0 h-100 d-flex justify-content-end"}>
                <div className="d-flex align-items-center" onClick={() => window.location = "/" }>
                    <img src={get_enterprise_logo()} alt="" className="w-100" onClick={(event) => on_go_home(event) }/>
                </div>
            </div>
            <SearchBox on_search={() => props.on_search()} />
        </div>
    )
}
