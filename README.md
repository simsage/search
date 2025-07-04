# SimSage Search UX REACT version

## TypeScript Migration
This project has been migrated to TypeScript. Key points:
- TypeScript version: 5.4.3
- Type definitions for React, Redux, and other libraries have been added
- TypeScript configuration is included in the project
- Use `npm run tsc` to type-check the project without emitting files
- Use `npm run tsc:watch` for continuous type-checking during development

## Installing
Make sure you remove any existing `package-lock.json` first. Due to dependency conflicts, you may need to use the `--force` flag:
```
export npm_config_loglevel=silent
npm set audit false
npm install --force
```

## Running this UI

```
npm run start
```

## SimSage settings.js

| name                          | value                                                            | description                                                            |
|-------------------------------|------------------------------------------------------------------|------------------------------------------------------------------------|
| version                       | 8.3.0                                                            | Current version of SimSage displayed on UX                             |
| api_version                   | 1                                                                | API version of SimSage, must be 1                                      |
| base_name                     | /search                                                          | Base path for the router                                               |
| kb_id                         | your-kb-id                                                       | Knowledge base ID to use for searching                                 |
| debug                         | true                                                             | Run REACT in debug mode (more output)                                  |
| api_base                      | http://localhost:8080/api                                        | Remote SimSage SaaS server location, e.g. https://demo2.simsage.ai/api |
| friendly_error_messages       | true                                                             | Show user-friendly error messages                                      |
| wopi_url                      | http://localhost:8090                                            | WOPI client URL for document previews                                  |
| wopi_api_url                  | http://localhost:8090/api                                        | WOPI API URL for document operations                                   |
| preview_min_width             | 1024                                                             | Image preview minimum width in UX                                      |
| preview_min_height            | 1024                                                             | Image preview minimum height in UX                                     |
| html_types                    | ["text/html", "text/xml"]                                        | MIME types to render as HTML                                           |
| valid_types                   | ["application/pdf", "image/png", "image/jpeg"]                   | Valid MIME types for preview                                           |
| video_types                   | ["video/mp4", "video/webm"]                                      | Video MIME types                                                       |
| audio_types                   | ["audio/mpeg", "audio/wav"]                                      | Audio MIME types                                                       |
| score_threshold               | 0.8125                                                           | SimSage chat-bot neural network score threshold                        |
| show_preview_metadata         | true                                                             | Show metadata in preview pane                                          |
| organisation_id               | c276f883-e0c8-43ae-9119-df8b7df9c574                             | SimSage organisation ID to use for searching                           |
| page_size                     | 10                                                               | Number of search results returned per query                            |
| fragment_count                | 10                                                               | No longer used                                                         |
| max_word_distance             | 40                                                               | Maximum allowed distance between words for success/failure             |
| customer_website              | ''  (empty string)                                               | Logo click web-link - default empty selects portal                     |
| language                      | en                                                               | Default language for the UI                                            |
| show_download_manual          | true                                                             | Show "download advanced search syntax" document link in menu           |
| show_llm_menu                 | true                                                             | Show LLM (AI) menu options                                             |
| show_previews                 | true                                                             | Clicking a search result shows preview pane or not                     |
| query_ai_enabled_by_default   | false                                                            | Enable AI query by default                                             |
| use_spell_checker             | true                                                             | Show spelling suggestions if nothing found and available               |
| show_boost_controls           | false                                                            | Show controls for boosting search results                              |
| show_metadata_counts          | false                                                            | Show counters in side bar results                                      |
| use_insight                   | true                                                             | Use insight features                                                   |
| use_article_summary           | true                                                             | Use article summary features                                           |
| compact_view                  | false                                                            | Use compact view for search results                                    |
| allow_knowledge_base_selector | true                                                             | Allow users to select different knowledge bases                        |
| override_source_list          | []                                                               | Artificial source groupings if not empty                               |
| show_source_icon              | true                                                             | Show source icons in search results                                    |
| show_user_tags                | true                                                             | Show user tags in search results                                       |
| llm_search                    | true                                                             | Enable LLM (AI) search capabilities                                    |
| kc_endpoint                   | http://localhost:8080/auth                                       | Keycloak endpoint for authentication                                   |
| kc_realm                      | simsage                                                          | Keycloak realm for authentication                                      |
| kc_client_id                  | simsage-search                                                   | Keycloak client ID for authentication                                  |
| customer                      | simsage                                                          | Branding, arista or simsage (logo display)                             |
| source_icons                  | {}                                                               | Custom icons for sources, mapping source IDs to icon URLs              |
