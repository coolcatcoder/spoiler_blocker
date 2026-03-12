async function with_video(element) {
    const response = await fetch(element.href, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin"
        },
        "referrer": "https://www.youtube.com/",
        "method": "GET",
        "mode": "cors"
    });

    const video = await response.text();

    function from_to(string, start_string, end_string) {
        const start = string.indexOf(start_string);
        const end = video.indexOf(end_string, start + start_string.length);
        return string.slice(start, end);
    }

    const everything = (from_to(video, "<meta name=\"title\"", "\">") + from_to(video, "<meta name=\"keywords\"", "\">") + from_to(video, "\"shortDescription\":\"", "\"")).toLowerCase();

    const phrases = await browser.storage.sync.get("phrases");

    for (phrase of phrases.phrases.split("\n")) {
        if (everything.includes(phrase)) {
            //element.style.border = "10px solid red";
            element.style.transform = "scale(0, 0)";

            let current_element = element;
            while (current_element.tagName != "YTD-RICH-ITEM-RENDERER") {
                console.log("Currently:", current_element);
                console.log("tag:", current_element.tagName);
                current_element = current_element.parentElement;
            }

            current_element.innerHTML = '';
            console.log("Blocked:", current_element.tagName, current_element);

            return;
        }
    }
}

const config = { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] };

const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.attributeName != "class") {
            return;
        }
        if (!mutation.target.classList.contains("ytCoreImageHost")) {
            return;
        }
        if (!mutation.target.parentElement.classList.contains("ytThumbnailViewModelImage")) {
            return;
        }

        const anchor = mutation.target.parentElement.parentElement.parentElement;
        console.log(anchor);

        with_video(anchor);
        // for (const element of mutation.addedNodes) {
        //     try {
        //         // if (!element.classList.contains("yt-lockup-view-model__content-image")) {
        //         //     continue;
        //         // }

        //         console.log("Test.", element.href);
        //     } catch (error) {
        //         console.error(error.message);
        //     }
        // }
    }
};

const observer = new MutationObserver(callback);
observer.observe(document, config);