// Global environment configuration

declare global {

  interface SourceOverride {
    name: string;
    sources: string[];
  }

  interface EntityName {
      name: string;
      value: string;
  }

  interface SourceUrlRemap {
    starts_with: string;
    replace_with: string;
  }

  interface SearchFavourite {
    organisationId: string;
    kbId: string;
    userId: string;
    text: string;
    created: number;
    top: number;
  }

  interface Window {
    ENV: {
      version: string;
      base_name: string;
      kb_id: string;
      api_version: string;
      api_base: string;
      friendly_error_messages: string;
      file_opener_ws_port: number;
      wopi_url: string;
      wopi_api_url: string;
      preview_min_width: number;
      preview_min_height: number;
      html_types: string[];
      valid_types: string[];
      video_types: string[];
      audio_types: string[];
      score_threshold: number;
      show_preview_metadata: boolean;
      organisation_id: string;
      date_options: Intl.DateTimeFormatOptions;
      default_theme: string;
      page_size: number;
      fragment_count: number;
      max_word_distance: number;
      customer_website: string;
      language: string;
      show_download_manual: boolean;
      show_llm_menu: boolean;
      show_previews: boolean;
      show_feedback: boolean;
      allow_copy_url: boolean;
      optional_search_feedback_link_title: string;
      optional_search_feedback_link: string;
      query_ai_enabled_by_default: boolean;
      debug: boolean;
      use_spell_checker: boolean;
      show_boost_controls: boolean;
      show_metadata_counts: boolean;
      use_insight: boolean;
      use_article_summary: boolean;
      allow_knowledge_base_selector: boolean;
      override_source_list: SourceOverride[];
      show_source_icon: boolean;
      show_user_tags: boolean;
      llm_search: boolean;
      kc_endpoint: string;
      kc_realm: string;
      kc_client_id: string;
      customer: string;
      source_icons: {[key: string]: string};
      source_path_remapping_osx: {[key: number]: SourceUrlRemap};
      source_path_remapping_win: {[key: number]: SourceUrlRemap};
      entity_list: EntityName[];
    }
  }

}

export interface KnowledgeBase {
  id: string;
  sourceList?: SourceItem[];
  categoryList?: MetadataItem[];
  hasLLM?: boolean;
  supportedLanguages: string[];
  [key: string]: any;
}

// used for override_source_list source grouping under one name
export interface SourceGroup {
  name: string;
  sources: SourceItem[];
  sourceId?: string;
  type?: string;
  count?: number;
}

export interface SourceItem {
  sourceId: string;
  name: string;
  sourceType?: string;
  storeBinary: boolean;
  [key: string]: any;
}

export interface MetadataItemCount {
  name: string;
  count?: number;
}

export interface MetadataItem {
  metadata: string;
  categoryType: string;
  items?: Array<MetadataItemCount>;
  [key: string]: any;
}

export interface SynSetItem {
  name: string;
  description_list: string[];
  [key: string]: any;
}

export interface UrlBoost {
  urlId: number;
  boostCount: number;
}

export interface SearchSuggestion {
  kbId: string;
  queryText: string;
  frequency: number;
  lastModified: number;
}

export interface SearchState {
  shard_list: number[];
  result_list: SearchResult[];

  source_list: SourceItem[];
  source_values: {
    [key: string]: boolean;
  };
  source_filter: string;

  has_info: boolean;
  theme: string;

  search_page: number;
  page_size: number;
  pages_loaded: number;

  total_document_count: number;
  sort_order: number;
  busy: boolean;
  busy_with_summary: boolean;
  busy_with_ai: boolean;
  qna_text: string;
  ai_response: string;
  ai_insight: string;
  qna_url_list: string[];
  search_text: string;
  prev_search_text: string;
  prev_filter: string;
  effective_search_string: string;
  sr_text: string;
  entity_values: {
    [key: string]: boolean;
  };
  hash_tag_list: string[];
  boost_document_id_list: UrlBoost[];
  ai_enabled: boolean;
  use_ai: boolean;
  show_side_bar: boolean;
  show_source_icon: boolean;
  llm_search: boolean;
  fast: boolean;

  query_ai_focus_url: string;
  query_ai_focus_url_id: number;
  query_ai_focus_title: string;
  query_ai_dialog_list: SimpleConversationItem[];
  query_ai_focus_document: SearchResult | undefined;
  user_query: string;

  llm_state: LLMState;
  llm_state_history: LLMState[];

  search_focus: any;
  html_preview_list: any[];
  has_more_preview_pages: boolean;

  metadata_list: MetadataItem[];
  document_type_count: {
    [key: string]: number;
  };
  source_id_count: {
    [key: string]: number;
  };
  metadata_values: {
    [key: string]: {
      [key: string]: boolean;
    };
  };

  summaries: {
    [key: string]: string;
  };

  search_error_text: string;
  metadata_error: string;

  syn_set_list: SynSetItem[];
  syn_set_values: {
    [key: string]: number;
  };
  all_kbs: KnowledgeBase[];

  // specific filters
  author: string;
  title: string;
  path: string;
  after: string;
  before: string;

  search_suggestion_list: SearchSuggestion[];
  search_favourite_list: string[];

  // the current language
  language_code: string;

}

export interface FocusPreviewPayload {
  url: string;
  url_id: number;
  title: string;
}

export interface UserQueryPayload {
  user_query: string;
}

export interface SourceValuePayload {
  name: string;
  checked: boolean;
}

export interface MetadataValuePayload {
  metadata: string;
  name: string;
  checked: boolean;
}

export interface SynSetPayload {
  name: string;
  checked: boolean;
  index: number;
}

export interface ErrorPayload {
  error?: string;
}

export interface SearchPagePayload {
  search_page: number;
}

export interface PageSizePayload {
  page_size: number;
}

export interface GetInfoPayload {
  session: Session;
  user: User;
}

export interface SaveHashtagsPayload {
  session_id: string;
  organisation_id: string;
  kb_id: string;
  document_url: string;
  hashtag_list: string[];
}

export interface DoSearchPayload {
  session: Session;
  search_page: number;
  client_id: string;
  user: User;
  search_text: string;
  page_size: number;
  prev_search_text: string;
  prev_filter: string;
  shard_list: any[];
  sort_order: number;
  metadata_list: MetadataItem[];
  metadata_values: any;
  entity_values: any;
  source_list: SourceItem[];
  source_values: any;
  hash_tag_list: string[];
  syn_set_values: any;
  result_list: SearchResult[];
  pages_loaded: number;
  use_ai: boolean;
  next_page: boolean;
  reset_pagination: boolean;
  author: string;
  path: string;
  title: string;
  language_code: string; // en, nl, etc.
}

export interface CreateShortSummaryPayload {
  session: Session;
  target_url: string;
  sentence_id: string;
}

export interface BoostDocumentPayload {
  session: Session;
  search_text: string;
  result: any;
  increment: number;
  on_done?: () => void;
}

export interface AskDocumentQuestionPayload {
  session: Session;
  prev_conversation_list: any[];
  question: string;
  document_url: string;
  on_success?: () => void;
}

export interface GetSearchSuggestionsPayload {
  session: Session;
  text: string;
}

export interface GetSearchFavouritesPayload {
  session: Session;
}

export interface SearchFavouritePayload {
  session: Session;
  text: string;
}

export interface DoLlmSearchPayload {
  session: Session;
  prev_conversation_list: any[];
  question: string;
  source_list: SourceItem[];
  source_values: any;
  focus_url?: string;
  metadata_url?: string;
}

export interface DoLlmSearchStep2Payload {
  session: Session;
  prev_conversation_list: any[];
  question: string;
  metadata_list: MetadataItem[];
  metadata_values: any;
  source_list: SourceItem[];
  source_values: any;
}

export interface DoLlmSearchStep3Payload {
  session: Session;
  prev_conversation_list: any[];
  question: string;
  search_result: any;
}

export interface LlmLoadhistory {
  session: Session;
}

export interface LlmSavehistory {
  session: Session;
  llmStateList: LLMState[];
}

export interface LlmLoadhistoryResult {
  organisationId: string;
  kbId: string;
  llmStateList: LLMState[];
}

// feedback dialog data
export interface FeedbackData {
    reasons: string[];
    comment: string;
    technical: string;
}

// user feeds back if the search results for the query were helpful or not
export interface UserQueryFeedback {
    session: Session;
    data: FeedbackData;
    on_success?: () => void;
}

// Interfaces from authSlice.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  surname: string;
  [key: string]: any;
}

export function emptyUser(): User {
  return {id: "", email: "", firstName: "", surname: ""}
}

export interface Session {
  id: string;
  organisationId: string;
  userId: string;
  email: string;
  lastAccess: number;
  role: string;
  sessionType: string;
  [key: string]: any;
}

export function emptySession(): Session {
  return {id: "", organisationId: "", userId: "", email: "", lastAccess: 0, role: "", sessionType: ""}
}

export interface Organisation {
  id?: string;
  name: string;
  enabled: boolean;
  [key: string]: any;
}

export function emptyOrganisation(): Organisation {
  return {id: undefined, name: "", enabled: false}
}

export interface AuthState {
  user: User;
  busy: boolean;
  session: Session;
  organisation: Organisation;
  show_menu: boolean;
  show_kb_menu: boolean;
  show_query_builder: boolean;
  system_message: string;
  error_message: string;
}

export interface AuthErrorPayload {
  error_text: string;
}

export interface SignInPayload {
  id_token: string;
}

export interface LogOutPayload {
  session_id: string;
  auth: any; // ReturnType<typeof useAuth>
}

// Interfaces from SearchResultFragment.tsx
export interface HashTag {
  key: number;
  value: string;
}

export interface RelatedDocument {
  urlId: number; // original
  relationshipType: number; // 0=parent, 1=child, 2=related
  relatedUrlId: number;
  webUrl: string;
  relatedUrl: string;
  documentType: string;
}

export interface SimilarDocument {
  url: string;
  metadataUrl: string;
  urlId: number;
  similarity: number;
}

export interface SearchResult {
  textList: string[];
  textIndex: number;
  similarDocumentList: SimilarDocument[];
  relatedList: RelatedDocument[];
  title: string;
  filename: string;
  folderId: string;
  score: number;
  url: string;
  urlId: number;
  metadata: Record<string, string>;
  author: string;
  sourceId: number;
  renderType: string;
  firstSentence: number;
  lastModified: number;
  created: number;
}

// Interfaces from PreviewModal.tsx
export interface PreviewMetadataItem {
  key: string;
  value: string;
}

export interface HtmlPreviewItem {
  width?: number;
  height?: number;
}

export interface WopiMessage {
  MessageId: string;
  Values?: {
    Status?: string;
    errorType?: string;
    Mode?: string;
  };
}

// Type for the action parameter in get_error
export interface ActionWithError {
  error?: {
    message?: string;
  };
  payload?: any; // Make payload more flexible to accept different structures
  type?: string;
}

// Type for the return value of get_headers
export interface HeadersConfig {
  headers: {
    "API-Version": string;
    "Content-Type": string;
    "session-id"?: string;
  }
}

export interface ClientQueryResult {
  shardSizeList: number[];
  resultList: SearchResult[];
  documentTypeToCounts: any;
  sourceIdToCounts: any;
  page: number;
  boostedDocumentIDs: number[];
  totalDocumentCount: number;
  selectedSources: any;
  categoryList: any;
}

export interface SimpleConversationItem {
  role: string;
  content: string;
}

export interface ConversationItem {
  role: string;
  content: string;
  step: number;
  aiUrlUsed: string;
  aiUrlIdUsed: number;
  searchKeywords: string;
  searchResult?: ClientQueryResult;
  expand: boolean;
}

// Define the type for llm_state to include conversationList
export interface LLMState {
  organisationId: string;
  kbId: string;
  conversationList: ConversationItem[];
  focus_id: number;
  documentTypeFilter: number[];
  metadataUrl: string;
  sourceFilter: string;
  url: string;
  language: string;
}

export interface WindowDimensions {
  width: number | null;
  height: number | null;
}

export {};
