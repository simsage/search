import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from "axios";
import {get_error, get_headers} from "../common/Api";


const initialState = {
    user: {},
    session: {},
    organisation: {},
    // sign-in menu
    show_menu: false,
    show_kb_menu: false,
    // message from the system to display
    system_message: '',
    // error dialog
    error_message: '',
}

const authSlice = createSlice({
    name: 'auth',
    initialState,

    // not async function : sync functions
    reducers: {

        close_menu: (state) => {
            return {...state, show_menu: false, show_kb_menu:false}
        },

        toggle_menu: (state) => {
            return {...state, show_menu: !state.show_menu, show_kb_menu:false}
        },

        close_kb_menu: (state) => {
            return {...state, show_kb_menu: false, show_menu: false}
        },
        toggle_kb_menu: (state) => {
            return {...state, show_kb_menu: !state.show_kb_menu, show_menu:false}
        },

        dismiss_auth_error: (state) => {
            return {...state, error_message: ''}
        },

        dismiss_auth_message: (state) => {
            return {...state, system_message: ''}
        },

        set_auth_error: (state, action) => {
            return {...state, error_message: action.payload.error_text}
        },

        showError: (state, action) => {
            return {...state, error_message: action.payload.error_text}
        },

    },

    extraReducers: (builder) => {
        builder

            .addCase(simsageSignIn.pending, (state, action) => {
                return {
                    ...state,
                    busy: true,
                    error_message: ''
                }
            })

            .addCase(simsageSignIn.fulfilled, (state, action) => {
                if (action.payload.data) {
                    console.log("signed-in");
                    let organisation = {};
                    if (action.payload.data.organisationList) {
                        for (const org of action.payload.data.organisationList) {
                            if (org && org.id === window.ENV.organisation_id) {
                                organisation = org;
                                break;
                            }
                        }
                    }
                    return {
                        ...state,
                        busy: false,
                        error_message: '',
                        user: action.payload.data.user,
                        session: action.payload.data.session,
                        organisation: organisation,
                    }

                } else {
                    const err_msg = get_error(action);
                    console.error("sign-in:" + err_msg);
                    return {
                        ...state,
                        busy: false,
                        error_message: err_msg
                    }
                }
            })

            .addCase(simsageSignIn.rejected, (state, action) => {
                const err_msg = get_error(action);
                console.error("rejected: sign-in:" + err_msg);
                return {
                    ...state,
                    busy: false,
                    error_message: err_msg
                }
            })

            /////////////////////////////////////////////////////////////////////////////

            .addCase(simsageLogOut.pending, (state, action) => {
                return {
                    ...state,
                    message: '',
                    busy: true,
                    status: 'logging_out',
                }
            })

            .addCase(simsageLogOut.fulfilled, (state, action) => {
                return {
                    ...state,
                    busy: false,
                    message: '',
                    error_message: '',
                    session: {},
                    user: {},
                    organisation: {},
                    result_list: [],
                    page: 0,
                    status: 'logged_out',
                }
            })

            .addCase(simsageLogOut.rejected, (state, action) => {
                return {
                    ...state,
                    busy: false,
                    message: '',
                    error_message: '',
                    session: {},
                    user: {},
                    organisation: {},
                    result_list: [],
                    page: 0,
                    status: "rejected"
                }
            })



    }
});

// MSAL/jwt based sign-in
export const simsageSignIn = createAsyncThunk(
    'authSlice/simsageSignIn',
    async ({id_token}, {rejectWithValue}) => {
        const api_base = window.ENV.api_base;
        const url = api_base + '/auth/search/authenticate/msal/' + encodeURIComponent(window.ENV.organisation_id);

        return axios.get(url, {
            headers: {
                "API-Version": window.ENV.api_version,
                "Content-Type": "application/json",
                "jwt": "" + id_token,
            }
        })
        .then((response) => {
            return response;
        }).catch((err) => {
            return rejectWithValue(err)
        })

    }
);

/**
 * keycloak logout helper
 * @param keycloak the keycloak object
 */
export const logout = (keycloak) => {
    keycloak.logout({redirectUri: window.location.protocol + "//" + window.location.host}).then((success) => {
        console.log("--> log: logout success ", success);
    }).catch((error) => {
        console.log("--> log: logout error ", error);
    });
}


export const simsageLogOut = createAsyncThunk(
    'auth/simsageLogOut',
    async ({session_id, keycloak}) => {
        const api_base = window.ENV.api_base;
        const url = api_base + '/auth/sign-out'
        return axios.delete(url, get_headers(session_id))
            .then((response) => {
                logout(keycloak);
                return response
            }).catch(
                (error) => {
                    logout(keycloak);
                    return error
                }
            )
    }
)


export const {
    close_menu, close_kb_menu, toggle_menu,
    toggle_kb_menu, dismiss_auth_error,
    dismiss_auth_message, showError
} = authSlice.actions
export default authSlice.reducer;
