// Type definitions for Api.js
declare module './Api' {
    export function download_document(url: string, session_id: string): void;
    export function get_archive_child(url: string): string;
    export function is_viewable(url: string): boolean;
    export function is_archive(url: string): boolean;
    export function get_source_for_result(result: any, source_list: any[]): any;
    export function get_icon_src(source: any): string;
    export function preview_image_url(session_id: string, result: any): string;

    // Add other exported functions as needed
    export function defined(value: any): boolean;
    export function copy(json_object: any): any;
    export function pretty_version(): string;
    export function get_client_id(): string;
    export function unix_time_convert(timestamp: number): string;
    export function get_metadata_list(metadata_set: any): { metadata_list: any[] };
    export function get_user_metadata_list(metadata_set: any): any[];
    export function get_hashtag_list(metadata_set: any): any[];
    export function path_from_url(url: string): string[];
    export function get_error(action: any): string;
    export function do_fetch(url: string, session_id: string, fn_success?: () => void, fn_fail?: (error: string) => void): void;
    export function get_enterprise_logo(theme: string): string;
    export function get_headers(session_id?: string): { headers: { [key: string]: string } };
    export function map_metadata_name(name: string): string;
    export function get_filters(metadata_list: any[], metadata_values: any, entity_values: any, source_list: any[], source_values: any, hash_tag_list: any[], syn_set_filter: any): string;
    export function get_document_types(metadata_values: any): string[];
    export function is_archive_file(url: string): boolean;
    export function url_to_bread_crumb(url: string): string;
    export function is_online(url: string): boolean;
    export function get_archive_parent(url: string): string;
    export function highlight(text: string, theme: string): string;
    export function unescape_owasp(str: string): string;
    export function get_archive_child_last(url: string): string;
    export function download(url: string, session_id: string): void;
    export function get_url_search_parameters_as_map(search_string: string): { [key: string]: string };
    export function getKbId(): string;
    export function tokenize(str: string): string[];
    export function get_text_search(query: string): string;
    export function get_doc_types(query: string): string[];
    export function get_source_filter(source_list: any[], source_values: any): string;
    export function get_source_set(query: string): { [key: string]: boolean };
    export function get_full_username(user: User): string;
    export const language_lookup: { [key: string]: string };
    export function time_ago(epoch: number): string;
    export function limit_text(str: string, length: number): string;
    export function setup_query_parameter_state(source_list: SourceItem[]): any | null;
    export function get_enterprise_logo(theme: string): string;

    // Constants
    export const user_metadata_marker: string;
    export const hashtag_metadata: string;
}
