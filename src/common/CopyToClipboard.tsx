import React, { useState } from 'react';
import {get_archive_parent} from "./Api";
import icon_open_link from "../assets/images/ui/icon_open_link.svg"

interface CopyToClipboardProps {
    web_url: string;        // the url to display
    title?: string;         // override title if set (instead of web_url to display)
    url?: string;           // optional second url that is copied if set
    urlId?: number;
    extra_style: string;
    text_limit: number;
}

/**
 * A component that displays a URL and copies it to the clipboard when clicked.
 * It shows a "Copied!" message for a short duration after copying.
 *
 */
const CopyToClipboard = ({ web_url, title, url, urlId, extra_style, text_limit}: CopyToClipboardProps) => {
    const [isCopied, setIsCopied] = useState(false);

    // A generic handler to copy any given text to the clipboard
    const handleCopy = (textToCopy: string) => {
        // Ensure the Clipboard API is available
        if (!navigator.clipboard) {
            console.error("Clipboard API not supported on this browser.");
            return;
        }
        navigator.clipboard.writeText(textToCopy).then(() => {
            // 1. Set the copied state to true
            setIsCopied(true);
            // 2. Reset the state back to false after 2 seconds
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const limit = (text: string): string => {
        if (text.length > text_limit) {
            return text.substring(0, text_limit) + "..."
        }
        return text
    }

    const open_link = (url: string): void => {
        window.open(url, "_blank")
    }

    const display_url = get_archive_parent(web_url ?? url)
    const can_open = display_url.indexOf("https://") === 0 || display_url.indexOf("http://") === 0

    return (
        <>
            {isCopied && can_open &&
                <span>
                    <img
                        src={icon_open_link}
                        alt="open link"
                        title={urlId ? `Click to open: ${display_url} (id: ${urlId})` : `Click to open: ${display_url}`}
                        style={{width: "20px", marginRight: "4px"}}
                        onClick={() => open_link(display_url)}
                    />
                </span>
            }
            {isCopied ? (
                // If copied, show the feedback message
                <span className={extra_style}>Copied! ✅</span>
            ) : (
                // Otherwise, show the URL and the optional icon
                <>
          <span
              className={extra_style}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title={urlId ? `Click to copy: ${display_url} (id: ${urlId})` : `Click to copy: ${display_url}`}
          >
            {can_open &&
                <span>
                    <img
                        src={icon_open_link}
                        alt="open link"
                        title={urlId ? `Click to open: ${display_url} (id: ${urlId})` : `Click to open: ${display_url}`}
                        style={{width: "20px", marginRight: "4px"}}
                        onClick={() => open_link(display_url)}
                    />
                </span>
            }
            <span onClick={() => handleCopy(display_url)}>{ limit(title ?? web_url) }</span>
          </span>

                    {/* Conditionally render the icon only if url2 exists */}
                    {window.ENV.allow_copy_url && (
                        <span
                            onClick={(event) => {
                                event.stopPropagation(); // Prevents the parent span's onClick from firing
                                handleCopy(display_url);
                            }}
                            style={{ cursor: 'pointer', marginLeft: '8px' }}
                            title={`Click to copy: ${display_url}`}
                        >
              📋
            </span>
                    )}
                </>
            )}
        </>
    );
};

export default CopyToClipboard;
