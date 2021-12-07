
// helper - get a source by its id
export function get_source_by_id(source_id, source_list) {
    let source = null;
    for (const s_source of source_list) {
        if (s_source.sourceId === source_id) {
            source = s_source;
            break;
        }
    }
    return source;
}

// helper - get a parent folder (or null) for a given folder)
export function get_parent_folder(folder, folder_tracker) {
    if (folder && folder.parentFolderUrl && folder.sourceId > 0 && folder_tracker) {
        const parent = folder_tracker[folder.sourceId + ":" + folder.parentFolderUrl];
        if (parent && parent.isFolder && parent.url !== folder.url)
            return parent;
    }
    return null;
}

// helper - in a list of items, flip the show menu flag for a specific item
export function show_menus(url, list) {
    const use_list = list && list.length ? list : [];
    for (const cItem of use_list) {
        if (cItem.url === url) {
            cItem.show_menu = !cItem.show_menu;
        } else {
            cItem.show_menu = false;
        }
    }
    return use_list;
}

