import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from "axios";
import {get_cookie_value, get_error, get_headers, update_cookie_value} from "../common/Api";
import {
    AuthState,
    AuthErrorPayload,
    SignInPayload,
    LogOutPayload,
    emptySession,
    emptyOrganisation, emptyUser
} from '../types';
import { useAuth } from 'react-oidc-context';

// name of the ux cookie
const ux_cookie = "ux-cookie";
// cookie values for init store
const show_qb = get_cookie_value(ux_cookie, "show_qb");

const initialState: AuthState = {
    user: emptyUser(),
    busy: false,
    session: emptySession(),
    organisation: emptyOrganisation(),
    // sign-in menu
    show_menu: false,
    show_kb_menu: false,
    show_query_builder: show_qb ? show_qb?.toLowerCase()==="true" : false,
    // message from the system to display
    system_message: '',
    // error dialog
    error_message: '',
};


const authSlice = createSlice({
    name: 'auth',
    initialState,

    // not async function: sync functions
    reducers: {
        close_menu: (state) => {
            return {...state, show_menu: false, show_kb_menu: false};
        },

        toggle_menu: (state) => {
            return {...state, show_menu: !state.show_menu, show_kb_menu: false};
        },

        close_kb_menu: (state) => {
            return {...state, show_kb_menu: false, show_menu: false};
        },

        toggle_kb_menu: (state) => {
            return {...state, show_kb_menu: !state.show_kb_menu, show_menu: false};
        },

        toggle_query_builder: (state) => {
            const new_show_qb = !state.show_query_builder
            update_cookie_value(ux_cookie, "show_qb", new_show_qb ? "true":"false")
            return {
                ...state, show_menu: false, show_kb_menu: false, show_query_builder: new_show_qb
            }
        },

        dismiss_auth_error: (state) => {
            return {...state, error_message: ''};
        },

        dismiss_auth_message: (state) => {
            return {...state, system_message: ''};
        },

        set_auth_error: (state, action: PayloadAction<AuthErrorPayload>) => {
            return {...state, error_message: action.payload.error_text};
        },

    },

    extraReducers: (builder) => {
        builder
            .addCase(simsage_sign_in.pending, (state) => {
                return {
                    ...state,
                    busy: true,
                    error_message: ''
                };
            })

            .addCase(simsage_sign_in.fulfilled, (state, action) => {
                if (action.payload.data) {
                    console.log("signed-in");
                    let organisation = emptyOrganisation();
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
                    };
                } else {
                    const err_msg = get_error(action);
                    console.error("sign-in:" + err_msg);
                    return {
                        ...state,
                        busy: false,
                        error_message: err_msg
                    };
                }
            })

            .addCase(simsage_sign_in.rejected, (state, action) => {
                const err_msg = get_error(action);
                console.error("rejected: sign-in:" + err_msg);
                return {
                    ...state,
                    busy: false,
                    error_message: err_msg
                };
            })

            /////////////////////////////////////////////////////////////////////////////

            .addCase(simsageLogOut.pending, (state) => {
                return {
                    ...state,
                    message: '',
                    busy: true,
                    status: 'logging_out',
                };
            })

            .addCase(simsageLogOut.fulfilled, (state) => {
                return {
                    ...state,
                    busy: false,
                    message: '',
                    error_message: '',
                    session: emptySession(),
                    user: emptyUser(),
                    organisation: emptyOrganisation(),
                    result_list: [],
                    page: 0,
                    status: 'logged_out',
                } as AuthState;
            })

            .addCase(simsageLogOut.rejected, (state) => {
                return {
                    ...state,
                    busy: false,
                    message: '',
                    error_message: '',
                    session: emptySession(),
                    user: emptyUser(),
                    organisation: emptyOrganisation(),
                    result_list: [],
                    page: 0,
                    status: "rejected"
                } as AuthState;
            });
    }
});

// MSAL/jwt based sign-in
export const simsage_sign_in = createAsyncThunk(
    'authSlice/simsage_sign_in',
    async ({ id_token }: SignInPayload, { rejectWithValue }) => {
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
            return rejectWithValue(err);
        });
    }
);

/**
 * OIDC logout helper
 * @param auth the auth object
 */
export const logout = (auth: ReturnType<typeof useAuth>): void => {
    auth.signoutRedirect({post_logout_redirect_uri: window.location.protocol + "//" + window.location.host}).then((success: any) => {
        console.log("--> log: logout success ", success);
    }).catch((error: any) => {
        console.log("--> log: logout error ", error);
    });
};

export const simsageLogOut = createAsyncThunk(
    'auth/simsageLogOut',
    async ({ session_id, auth }: LogOutPayload) => {
        const api_base = window.ENV.api_base;
        const url = api_base + '/auth/sign-out';
        return axios.delete(url, get_headers(session_id))
            .then((response) => {
                logout(auth);
                return response;
            }).catch(
                (error) => {
                    logout(auth);
                    return error;
                }
            );
    }
);

export const {
    close_menu, close_kb_menu, toggle_menu, toggle_query_builder,
    toggle_kb_menu, dismiss_auth_error
} = authSlice.actions;
export default authSlice.reducer;
