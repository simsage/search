# SimSage Search UX REACT version

## installing
Make sure you remove any existing `package-lock.json` first
```
export npm_config_loglevel=silent
npm set audit false
# alas - a few conflicts with npm libraries
npm install --force
```

## running this UI

```
npm run start
```

## SimSage settings.js

| name                          | value                                                            | description                                                            |
|-------------------------------|------------------------------------------------------------------|------------------------------------------------------------------------|
| version                       | 7.6.4                                                            | Current version of SimSage displayed on UX                             |
| api_version                   | 1                                                                | API version of SimSage, must be 1                                      |
| debug                         | true                                                             | run REACT in debug mode (more output)                                  |
| app_title                     | SimSage Search                                                   | HTML page title                                                        |
| authentication                | single-sign-on                                                   | either "password" or "single-sign-on"                                  |
| allow_anon                    | true                                                             | allow anonymous (no sign-in required) access                           |
| customer                      | simsage                                                          | branding, arista or simsage (logo display)                             |
| customer_website              | ''  (empty string)                                               | logo click web-link - default empty selects portal                     |
| show_previews                 | true                                                             | clicking a search result shows preview pane or not                     |
| api_base                      | http://localhost:8080/api                                        | remote SimSage SaaS server location, e.g. https://demo2.simsage.ai/api |
| date_format                   | yyyy/MM                                                          | date formetting inside UX                                              |
| organisation_id               | c276f883-e0c8-43ae-9119-df8b7df9c574                             | SimSage organisation ID to use for searching                           |
| score_threshold               | 0.8125                                                           | SimSage chat-bot neural network score threshold                        |
| fragment_count                | 10                                                               | no longer user                                                         |
| max_word_distance             | 40                                                               | maximum allowed distance between words for success/failure             |
| page_size                     | 10                                                               | number of search results returned per query                            |
| use_spell_checker             | true                                                             | show spelling suggestions if nothing found and available               |
| show_download_manual          | true                                                             | show "download advanced search syntax" document link in menu           |
| extractive_summarization_size | 10                                                               | not used at present                                                    |
| preview_min_width             | 1024                                                             | image preview minimun width in UX                                      |
| preview_min_height            | 1024                                                             | image preview minimum height in UX                                     |
| client_id                     | a7c09973-7853-48f6-a067-5a14a5e7b210                             | Microsoft Azure clientID for single-sign-on                            |
| full_authority                | https://simsageapi.b2clogin.com/simsageapi.onmicrosoft.com/B2C_1_simsage | Microsoft Azure authority for single-sign-on                           |
| known_authority               | https://simsageapi.b2clogin.com                                  | Microsoft Azure known authority for single-sign-on                     |
| show_metadata_counts          | false                                                            | show counters in side bar results                                      |
| max_filter_size               | 5                                                                | number of lines displayed in RHS filter boxes at any one time          |
| entity_list                   | []                                                               | list of entities displayed, do not change                              |
| override_source_list          | []                                                               | artificial source groupings if not empty                               |

