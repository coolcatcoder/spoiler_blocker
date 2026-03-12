function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        phrases: document.querySelector("#phrases").value,
    });
}

function restoreOptions() {
    function setCurrentChoice(result) {
        document.querySelector("#phrases").value = result.color || "";
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let getting = browser.storage.sync.get("phrases");
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);