const addReplyButtons = () => {
    const customClassName = '__sponge420';
    const shareButtons = document.querySelectorAll('[aria-label="Share post"]');

    shareButtons.forEach(button => {
        const buttonBox = button.parentNode.parentNode.parentNode;
        if (!buttonBox.getElementsByClassName(customClassName).length) {

            const onClickCallback = (event) => {
                event.preventDefault();
                event.stopPropagation();
                let tweetElement = button.closest('[data-testid="tweet"], article');
                if (tweetElement) {
                    const tweetTextContent = extractTweetContent(tweetElement);
                    const permalink = tweetElement.querySelector('a[href*="/status/"]');

                    if (permalink) {
                        const href = permalink.getAttribute('href');
                        const match = href.match(/\/status\/(\d+)/);
                        if (match && match[1]) {
                            const tweetId = match[1];
                            const replyText = encodeURIComponent(processTweetText(tweetTextContent));
                            const replyUrl = `https://twitter.com/intent/tweet?in_reply_to=${tweetId}&text=${replyText}`;
                            window.open(replyUrl, '____AAAAAAAAAAAAAAAAAAAAA', 'width=900,height=700');
                        };
                    };
                } else {
                    console.error('no donut');
                };
            };

            // this makes it sorta browser agnostic chrome / firefox
            const browserInstance = typeof browser !== 'undefined' ? browser : chrome;

            const spongeButton = document.createElement('img');
            spongeButton.src = browserInstance.runtime.getURL('img/icon.png');
            spongeButton.className = customClassName;
            spongeButton.onclick = onClickCallback;
            spongeButton.width = '24px';
            spongeButton.height = '24px';
            spongeButton.style.marginLeft = '7px';
            spongeButton.style.marginBottom = '3px';
            spongeButton.style.width = '24px';
            spongeButton.style.height = '24px';

            buttonBox.appendChild(spongeButton);
        }
    });
}

const processTweetText = (tweetTextContent) => {
    // chars/words that won't be spongified, such as twitter handles, emoji ranges, urls, emails and new line characters
    const excludeRegex = /(@\w+|https?:\/\/\S+|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b|[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]|\n+|\s+)/gu;
    // remove media
    const removeRegex = /pic\.x\.com\/\w+/g;
    // split at word boundary
    const splitRegex = /\b/g;

    tweetTextContent = tweetTextContent.replace(removeRegex, '');

    let parts = tweetTextContent.split(splitRegex);

    const spongify = (text) => {
        if (Math.random() > 0.5) {
            // this so randomizes initial char being upper or lowercase
            text = ' ' + text;
        }

        return text.split('').map((char, index) => {
            let resultChar = index % 2 ? char.toLowerCase() : char.toUpperCase();

            // repeat chars randomly to for extra moronicity
            if (resultChar.match(/[a-z]/i) && Math.random() > 0.9) {
                resultChar += resultChar;
            } else if (['!', '?'].includes(resultChar) && Math.random() > 0.6) {
                resultChar += resultChar.repeat(Math.floor(Math.random() * 4) + 1);
            }
            return resultChar;
        }).join('').replace(' ', '');
    };

    parts = parts.map(part => {
        // if its in excludeRegex return itself, otherwise, spongify it
        if (part.match(excludeRegex)) {
            return part;
        };
        return spongify(part);
    });

    // replace some !s for 1s, for extra effect
    const moreThanOneExclamationRegex = /!{2,}/g;
    const finalTweet = parts.join('').replace(moreThanOneExclamationRegex, (match) => {
        let finalExclamations = '';
        for (let char of match) {
            if (Math.random() > 0.75) {
                char = '1';
            }
            finalExclamations += char
        };
        return finalExclamations
    });

    return finalTweet.trim();
}

const extractTweetContent = (tweetElement) => {
    // 'lang' is the container for the tweet content
    const langElement = tweetElement.querySelector('[lang]');

    let finalString = '';

    const gatherText = (node) => {
        node.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                // If it's just text, just add it
                finalString += child.textContent;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                // add emojis
                if (child.tagName === 'IMG' && child.hasAttribute('alt')) {
                    finalString += child.alt;
                } else {
                    // handle nested nodes
                    gatherText(child);
                }
            }
        });
    };

    gatherText(langElement);

    return finalString;
}

// initial run then through MutationObserver
addReplyButtons();

const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
            addReplyButtons();
        };
    });
});

const observerConfig = { childList: true, subtree: true };

observer.observe(document.body, observerConfig);