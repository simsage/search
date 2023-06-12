import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from "axios";
import {get_error, get_headers} from "../common/Api";


const initialState = {
    user: {},
    session: {},
    organisation: {},
    // error dialog
    auth_error_text: '',
    // sign-in menu
    show_menu: false,
    show_kb_menu: false,
    // user wants to sign-in using password auth
    request_sign_on: false,
    // password reset request?
    reset_password_request: false,
    // message from the system to display
    system_message: '',
}


const authSlice = createSlice({
    name: 'auth',
    initialState,

    // not async function : sync functions
    reducers: {

        close_menu: (state) => {
            state.show_menu = false
        },

        toggle_menu: (state) => {
            state.show_menu = !state.show_menu
        },

        close_kb_menu: (state) => {
            state.show_kb_menu = false
        },
        toggle_kb_menu: (state) => {
            state.show_kb_menu = !state.show_kb_menu
        },

        dismiss_auth_error: (state) => {
            state.auth_error_text = ''
        },

        dismiss_auth_message: (state) => {
            state.system_message = ''
        },

        set_auth_error: (state, action) => {
            state.auth_error_text = action.payload.error_text;
        },

        password_sign_in: (state) => {
            state.reset_password_request = false;
            state.request_sign_on = true;
            window.history.replaceState(null, null, "?"); // remove any query parameters
        },

        password_reset_start: (state) => {
            state.reset_password_request = true;
        },

        sign_out: (state) => {
            state.session = {};
            state.user = {};
            state.organisation = {};
            state.result_list = [];
            state.page = 0;
            state.reset_password_request = false;
        },

    },

    extraReducers: (builder) => {
        builder
            .addCase(simSageMSALSignIn.fulfilled, (state, action) => {
                state.reset_password_request = false;
                if (action.payload.data) {
                    console.log("signed-in");
                    state.request_sign_on = false;
                    state.auth_error_text = '';
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
                    const error_str = get_error(action.payload);
                    if (error_str && error_str.length > 0) {
                        state.search_error_text = error_str;
                    }
                    console.error("msal-sign-in:" + error_str);
                }
            })
            .addCase(simSageMSALSignIn.rejected, (state, action) => {
                state.reset_password_request = false;
                const error_string = get_error(action.payload);
                state.auth_error_text = error_string;
                console.error("rejected: msal-sign-in:" + error_string);
            })

            .addCase(simSagePasswordSignIn.fulfilled, (state, action) => {
                state.reset_password_request = false;
                if (action.payload.session && action.payload.session.id) {
                    state.request_sign_on = false;
                    state.auth_error_text = '';
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
                    const error_str = get_error(action.payload);
                    if (error_str && error_str.length > 0) {
                        state.search_error_text = error_str;
                    }
                    console.error("password-sign-in:" + error_str);
                }
            })
            .addCase(simSagePasswordSignIn.rejected, (state, action) => {
                state.reset_password_request = false;
                const error_string = get_error(action.payload);
                state.auth_error_text = error_string;
                console.error("rejected: password-sign-in:" + error_string);
            })


            .addCase(requestResetPassword.fulfilled, (state, action) => {
                const error_str = get_error(action.payload);
                if (error_str && error_str.length > 0) {
                    state.search_error_text = error_str;
                } else {
                    state.system_message = "we've emailed you a link for resetting your password.";
                }
            })
            .addCase(requestResetPassword.rejected, (state, action) => {
                const error_string = get_error(action.payload);
                state.auth_error_text = error_string;
                console.error("rejected: password-reset-request:" + error_string);
            })


            .addCase(resetPassword.fulfilled, (state, action) => {
                const error_str = get_error(action.payload);
                if (error_str && error_str.length > 0) {
                    state.search_error_text = error_str;
                } else {
                    state.system_message = "Password reset.  Click 'sign in' to sign-in.";
                }
            })
            .addCase(resetPassword.rejected, (state, action) => {
                const error_string = get_error(action.payload);
                state.auth_error_text = error_string;
                console.error("rejected: password-reset:" + error_string);
            })
    }
});

// MSAL/jwt based sign-in
export const simSageMSALSignIn = createAsyncThunk(
    'authSlice/simSageMSALSignIn',
    async ({jwt}) => {
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
            }).catch(
                (error) => {
                    return error
                }
            )
    }
);

// password based sign-in
export const simSagePasswordSignIn = createAsyncThunk(
    'authSlice/simSagePasswordSignIn',
    async ({username, password}) => {
        const api_base = window.ENV.api_base;
        const url = api_base + '/auth/sign-in';
        return axios.post(url, {"email": username, "password": password}, get_headers(null))
            .then((response) => {
                return response.data;
            }).catch((error) => {
                    return error
                }
            );
    }
);

// password reset request
export const requestResetPassword = createAsyncThunk(
    'authSlice/requestResetPassword',
    async ({email}) => {
        const api_base = window.ENV.api_base;
        const url = api_base + '/auth/reset-password-request';
        return axios.post(url, {"email": email}, get_headers(null))
            .then((response) => {
                return response.data;
            }).catch((error) => {
                    return error
                }
            );
    }
);


// password reset
export const resetPassword = createAsyncThunk(
    'authSlice/resetPassword',
    async ({email, reset_id, password}) => {
        const api_base = window.ENV.api_base;
        const url = api_base + '/auth/reset-password';
        return axios.post(url, {"email": email, "password": password, "resetId": reset_id}, get_headers(null))
            .then((response) => {
                return response.data;
            }).catch((error) => {
                    return error
                }
            );
    }
);


export const {
    close_menu, close_kb_menu, toggle_menu, toggle_kb_menu, dismiss_auth_error, sign_out, password_sign_in, password_reset_start,
    set_auth_error, dismiss_auth_message
} = authSlice.actions
export default authSlice.reducer;
