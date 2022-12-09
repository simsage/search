
/**
 * turn a string into a stream of tokens
 *
 * @param str the string to tokenize
 * @returns a list of tokens, or an empty list
 */
export function tokenize(str) {
    const token_list = [];
    if (str && str.length > 0) {
        let word = "";
        for (const ch of str) {
            if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9')) {
                word += ch;
            } else {
                if (word.length > 0)
                    token_list.push(word);
                word = "";
                token_list.push("" + ch);
            }
        }
        if (word.length > 0)
            token_list.push(word);
    }
    return token_list;
}

