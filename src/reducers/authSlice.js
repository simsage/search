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
    // user wants to sign-in using password auth
    request_sign_on: false,
    // password reset request?
    reset_password_request: false,
    // message from the system to display
    system_message: '',
    // error dialog
    error_message: '',
}

// get the location of the current page without any query parameters - e.g. http://localhost/test/
const location = function() {
    return window.location.protocol + '//' + window.location.host + window.location.pathname;
}

const authSlice = createSlice({
    name: 'auth',
    initialState,

    // not async function : sync functions
    reducers: {

        close_menu: (state) => {
            return {...state, show_menu: false}
        },

        toggle_menu: (state) => {
            return {...state, show_menu: !state.show_menu}
        },

        close_kb_menu: (state) => {
            return {...state, show_kb_menu: false}
        },
        toggle_kb_menu: (state) => {
            return {...state, show_kb_menu: !state.show_kb_menu}
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

        password_sign_in: (state) => {
            window.history.replaceState(null, null, "?"); // remove any query parameters
            return {...state, reset_password_request:false, request_sign_on: true}
        },

        password_reset_start: (state) => {
            return {...state, reset_password_request: true}
        },

        sign_out: (state) => {
            return {...state, session: {}, user: {}, organisation: {}, result_list: [], page: 0,
                    reset_password_request: false, error_message: ''}
        },

    },

    extraReducers: (builder) => {
        builder

            .addCase(simSageMSALSignIn.pending, (state, action) => {
                state.error_message = '';
            })

            .addCase(simSageMSALSignIn.fulfilled, (state, action) => {
                state.reset_password_request = false;
                if (action.payload.data) {
                    console.log("signed-in");
                    state.request_sign_on = false;
                    state.error_message = '';
                    state.user = action.payload.data.user;
                    state.session = action.payload.data.session;
                    if (action.payload.data.organisationList) {
                        for (const org of action.payload.data.organisationList) {
                            if (org && org.id === window.ENV.organisation_id) {
                                state.organisation = org;
                                break;
                            }
                        }
                    }
                } else {
                    state.error_message = get_error(action);
                    console.error("msal-sign-in:" + state.error_message);
                }
            })

            .addCase(simSageMSALSignIn.rejected, (state, action) => {
                state.reset_password_request = false;
                state.error_message = get_error(action);
                console.error("rejected: msal-sign-in:" + state.error_message);
            })

            /////////////////////////////////////////////////////////////////////////////

            .addCase(simSagePasswordSignIn.pending, (state, action) => {
                state.error_message = '';
            })

            .addCase(simSagePasswordSignIn.fulfilled, (state, action) => {
                state.reset_password_request = false;
                if (action.payload.session && action.payload.session.id) {
                    state.request_sign_on = false;
                    state.error_message = '';
                    console.log("signed-in");
                    state.user = action.payload.user;
                    state.session = action.payload.session;
                    if (action.payload.organisationList) {
                        for (const org of action.payload.organisationList) {
                            if (org && org.id === window.ENV.organisation_id) {
                                state.organisation = org;
                                break;
                            }
                        }
                    }
                } else {
                    state.error_message = get_error(action);
                    console.error("password sign-in:" + state.error_message);
                }
            })

            .addCase(simSagePasswordSignIn.rejected, (state, action) => {
                state.reset_password_request = false;
                state.error_message = get_error(action);
                console.error("rejected: password-sign-in:" + state.error_message);
            })

            /////////////////////////////////////////////////////////////////////////////

            .addCase(requestResetPassword.pending, (state, action) => {
                state.error_message = '';
            })

            .addCase(requestResetPassword.fulfilled, (state, action) => {
                const error_str = get_error(action.payload);
                if (error_str && error_str.length > 0) {
                    state.error_message = error_str;
                } else {
                    state.system_message = "we've emailed you a link for resetting your password.";
                }
            })

            .addCase(requestResetPassword.rejected, (state, action) => {
                state.error_message = get_error(action);
                console.error("rejected: password-reset-request:" + state.error_message);
            })

            /////////////////////////////////////////////////////////////////////////////

            .addCase(resetPassword.pending, (state, action) => {
                state.error_message = '';
            })

            .addCase(resetPassword.fulfilled, (state, action) => {
                const error_str = action.payload?.error;
                if (error_str && error_str.length > 0) {
                    state.error_message = error_str;
                } else {
                    state.system_message = "Password reset.  Click 'Back to sign in' to sign-in.";
                }
            })

            .addCase(resetPassword.rejected, (state, action) => {
                state.error_message = get_error(action);
                console.error("rejected: password-reset:" + state.error_message);
            })
    }
});

// MSAL/jwt based sign-in
export const simSageMSALSignIn = createAsyncThunk(
    'authSlice/simSageMSALSignIn',
    async ({jwt}, {rejectWithValue}) => {
        const api_base = window.ENV.api_base;
        const url = api_base + '/auth/search/authenticate/msal/' + encodeURIComponent(window.ENV.organisation_id);
        return axios.get(url, {
            headers: {
                "API-Version": window.ENV.api_version,
                "Content-Type": "application/json",
                "jwt": "" + jwt,
            }
        })
        .then((response) => {
            return response;
        }).catch((err) => {
            return rejectWithValue(err)
        })
    }
);

// password based sign-in
export const simSagePasswordSignIn = createAsyncThunk(
    'authSlice/simSagePasswordSignIn',
    async ({username, password}, {rejectWithValue}) => {
        const api_base = window.ENV.api_base;
        const url = api_base + '/auth/sign-in';
        return axios.post(url, {"email": username, "password": password}, get_headers(null))
            .then((response) => {
                return response.data;
            }).catch((err) => {
                return rejectWithValue(err)
            })
    }
);

// password reset request
export const requestResetPassword = createAsyncThunk(
    'authSlice/requestResetPassword',
    async ({email}, {rejectWithValue}) => {
        const api_base = window.ENV.api_base;
        const url = api_base + '/auth/reset-password-request';
        return axios.post(url, {"email": email, "resetUrl": location()}, get_headers(null))
            .then((response) => {
                return response.data;
            }).catch((err) => {
                return rejectWithValue(err)
            })
    }
);


// password reset
export const resetPassword = createAsyncThunk(
    'authSlice/resetPassword',
    async ({email, reset_id, password}, {rejectWithValue}) => {
        const api_base = window.ENV.api_base;
        const url = api_base + '/auth/reset-password';
        return axios.post(url, {"email": email, "password": password, "resetId": reset_id}, get_headers(null))
            .then((response) => {
                return response.data;
            }).catch((err) => {
                return rejectWithValue(err)
            })
    }
);


export const {
    close_menu, close_kb_menu, toggle_menu,
    toggle_kb_menu, dismiss_auth_error, sign_out,
    password_sign_in, password_reset_start,
    set_auth_error, dismiss_auth_message
} = authSlice.actions
export default authSlice.reducer;
