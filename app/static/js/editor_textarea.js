// Process search based on last sentences

const paperText = document.getElementById("paper_text")
const paperResultsContainer = document.querySelector(".paper-results")
var refToBePasted = ""
var pasteMethod = ""
var currentSetence = ""

// paperText.innerText = paperText.value

let paperToken_array = location.href.split("/")
document.getElementById("paper_token").value = paperToken_array[paperToken_array.length -1]

paperText.focus()

function get_references(e) {
    // Generating variables to pass to server
    let currentText = paperText.value
    currentText = currentText.trim()

    // Check for closed last sentence
    if ((currentText[currentText.length -1] === ".") || (currentText[currentText.length -1] === "?") || (currentText[currentText.length -1] === "!")) {
        let currentSetenceArray = currentText.split("!").join(".").split("?").join(".").split(".")                                        // ALSO SPLIT FOR ! and ?
        
        if (currentSetenceArray.length > 2) {
            if (currentSetenceArray[currentSetenceArray.length -1].length > 0) {
                currentSetence = currentSetenceArray[currentSetenceArray.length -1]
                pasteMethod = "lastPeriod"
            }
            else {
                currentSetence = currentSetenceArray[currentSetenceArray.length -2]
                pasteMethod = "lastPeriod"
            }
        }
        
        if (currentSetenceArray.length > 1) {
            var last2SentencesArray = currentSetenceArray[currentSetenceArray.length -2, currentSetenceArray.length -1]
        }
    }

    // Check for unfinished sentence
    if ((currentText[currentText.length -1] !== ".") && (currentText[currentText.length -1] !== "?") && (currentText[currentText.length -1] !== "!")) {
        let currentSetenceArray = currentText.split("!").join(".").split("?").join(".").split(".")
        currentSetence = currentSetenceArray[currentSetenceArray.length -1]

        pasteMethod = "unfinishedSentence"
    }
    
    
    currentSetence = currentSetence.trim()
    if (currentSetence.length > 0) {
        // Passing data for text to analyse to server and getting back references
        fetch("/analyse-editor-text", {
            method: "POST",
            body: JSON.stringify({
                "last_sentence": currentSetence,
                "last_2_sentences": last2SentencesArray
            }),
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.getElementById("csrf_token").value
            }
        })
        .then(response => {
            response.json().then(data => {
                paperResultsContainer.innerHTML = ""
                if (data.message === "success") {
                    data.results.forEach(element => {
                        let divvy = document.createElement("div")
                        divvy.classList.add("suitable-paper")
                        let paperResult = `
                            <div class="result-visible">
                                <span class="title" data-ref="${element.auth_year}">${element.title}</span>
                                <div class="paragraph-btn"></div>
                                <span class="summary">
                                    <svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.46377 18.125C2.125 18.125 1.84783 17.8438 1.84783 17.5V2.5C1.84783 2.15625 2.125 1.875 2.46377 1.875H8.62319V5C8.62319 5.69141 9.17369 6.25 9.85507 6.25H12.9348V17.5C12.9348 17.8438 12.6576 18.125 12.3188 18.125H2.46377ZM2.46377 0C1.10485 0 0 1.12109 0 2.5V17.5C0 18.8789 1.10485 20 2.46377 20H12.3188C13.6778 20 14.7826 18.8789 14.7826 17.5V6.03516C14.7826 5.37109 14.5247 4.73437 14.0627 4.26562L10.575 0.730469C10.113 0.261719 9.48936 0 8.83492 0H2.46377ZM4.61957 10C4.10756 10 3.69565 10.418 3.69565 10.9375C3.69565 11.457 4.10756 11.875 4.61957 11.875H10.163C10.675 11.875 11.087 11.457 11.087 10.9375C11.087 10.418 10.675 10 10.163 10H4.61957ZM4.61957 13.75C4.10756 13.75 3.69565 14.168 3.69565 14.6875C3.69565 15.207 4.10756 15.625 4.61957 15.625H10.163C10.675 15.625 11.087 15.207 11.087 14.6875C11.087 14.168 10.675 13.75 10.163 13.75H4.61957Z" fill="#3D6C8D"/>
                                    </svg>
                                </span>
                                <span class="summary">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12.5 0C11.8086 0 11.25 0.558594 11.25 1.25C11.25 1.94141 11.8086 2.5 12.5 2.5H15.7305L7.86719 10.3672C7.37891 10.8555 7.37891 11.6484 7.86719 12.1367C8.35547 12.625 9.14844 12.625 9.63672 12.1367L17.5 4.26953V7.5C17.5 8.19141 18.0586 8.75 18.75 8.75C19.4414 8.75 20 8.19141 20 7.5V1.25C20 0.558594 19.4414 0 18.75 0H12.5ZM3.125 1.25C1.39844 1.25 0 2.64844 0 4.375V16.875C0 18.6016 1.39844 20 3.125 20H15.625C17.3516 20 18.75 18.6016 18.75 16.875V12.5C18.75 11.8086 18.1914 11.25 17.5 11.25C16.8086 11.25 16.25 11.8086 16.25 12.5V16.875C16.25 17.2188 15.9688 17.5 15.625 17.5H3.125C2.78125 17.5 2.5 17.2188 2.5 16.875V4.375C2.5 4.03125 2.78125 3.75 3.125 3.75H7.5C8.19141 3.75 8.75 3.19141 8.75 2.5C8.75 1.80859 8.19141 1.25 7.5 1.25H3.125Z" fill="#3D6C8D"/>
                                    </svg>
                                </span>
                            </div>
                            <p class="paragraph">
                                ${element.paragraph}
                            </p>
                        `
                        divvy.innerHTML = paperResult
                        paperResultsContainer.append(divvy)
                        divvy.style.transform = "translateY(0)"
                    });
                }
                else {
                    notify_user("Something went wrong.", "error")
                }
            })
        })
    }
    
}

var timeOut;
var interval_for_request = 1000;

paperText.addEventListener("keyup", (e) => {
    clearTimeout(timeOut);
    if (paperText.value) {
        timeOut = setTimeout((e) => {
            get_references(e)
        }, interval_for_request);
    }
})

paperText.addEventListener("mouseup", () => {
    // Check for selected text
    userSelection = window.getSelection().toString()
    if (userSelection.length > 0) {
        currentSetence = userSelection
        console.log(currentSetence)
        pasteMethod = "selectedText"
    }
    if (currentSetence.length > 0) {
        // Passing data for text to analyse to server and getting back references
        fetch("/analyse-editor-text", {
            method: "POST",
            body: JSON.stringify({
                "last_sentence": currentSetence,
                "last_2_sentences": ""
            }),
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.getElementById("csrf_token").value
            }
        })
        .then(response => {
            response.json().then(data => {
                paperResultsContainer.innerHTML = ""
                if (data.message === "success") {
                    data.results.forEach(element => {
                        let divvy = document.createElement("div")
                        divvy.classList.add("suitable-paper")
                        let paperResult = `
                            <div class="result-visible">
                                <span class="title" data-ref="${element.auth_year}">${element.title}</span>
                                <div class="paragraph-btn"></div>
                                <span class="summary">
                                    <svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.46377 18.125C2.125 18.125 1.84783 17.8438 1.84783 17.5V2.5C1.84783 2.15625 2.125 1.875 2.46377 1.875H8.62319V5C8.62319 5.69141 9.17369 6.25 9.85507 6.25H12.9348V17.5C12.9348 17.8438 12.6576 18.125 12.3188 18.125H2.46377ZM2.46377 0C1.10485 0 0 1.12109 0 2.5V17.5C0 18.8789 1.10485 20 2.46377 20H12.3188C13.6778 20 14.7826 18.8789 14.7826 17.5V6.03516C14.7826 5.37109 14.5247 4.73437 14.0627 4.26562L10.575 0.730469C10.113 0.261719 9.48936 0 8.83492 0H2.46377ZM4.61957 10C4.10756 10 3.69565 10.418 3.69565 10.9375C3.69565 11.457 4.10756 11.875 4.61957 11.875H10.163C10.675 11.875 11.087 11.457 11.087 10.9375C11.087 10.418 10.675 10 10.163 10H4.61957ZM4.61957 13.75C4.10756 13.75 3.69565 14.168 3.69565 14.6875C3.69565 15.207 4.10756 15.625 4.61957 15.625H10.163C10.675 15.625 11.087 15.207 11.087 14.6875C11.087 14.168 10.675 13.75 10.163 13.75H4.61957Z" fill="#3D6C8D"/>
                                    </svg>
                                </span>
                                <span class="summary">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12.5 0C11.8086 0 11.25 0.558594 11.25 1.25C11.25 1.94141 11.8086 2.5 12.5 2.5H15.7305L7.86719 10.3672C7.37891 10.8555 7.37891 11.6484 7.86719 12.1367C8.35547 12.625 9.14844 12.625 9.63672 12.1367L17.5 4.26953V7.5C17.5 8.19141 18.0586 8.75 18.75 8.75C19.4414 8.75 20 8.19141 20 7.5V1.25C20 0.558594 19.4414 0 18.75 0H12.5ZM3.125 1.25C1.39844 1.25 0 2.64844 0 4.375V16.875C0 18.6016 1.39844 20 3.125 20H15.625C17.3516 20 18.75 18.6016 18.75 16.875V12.5C18.75 11.8086 18.1914 11.25 17.5 11.25C16.8086 11.25 16.25 11.8086 16.25 12.5V16.875C16.25 17.2188 15.9688 17.5 15.625 17.5H3.125C2.78125 17.5 2.5 17.2188 2.5 16.875V4.375C2.5 4.03125 2.78125 3.75 3.125 3.75H7.5C8.19141 3.75 8.75 3.19141 8.75 2.5C8.75 1.80859 8.19141 1.25 7.5 1.25H3.125Z" fill="#3D6C8D"/>
                                    </svg>
                                </span>
                            </div>
                            <p class="paragraph">
                                ${element.paragraph}
                            </p>
                        `
                        divvy.innerHTML = paperResult
                        paperResultsContainer.append(divvy)
                        divvy.style.transform = "translateY(0)"
                    });
                }
                else {
                    notify_user("Something went wrong.", "error")
                }
            })
        })
    }
})

// Process click on paper result
window.addEventListener("click", (e) => {
    if (e.target.classList.contains("paragraph-btn")) {
        // Handle click on "expand paragraph"
        var expandable = e.target.parentElement.parentElement.querySelector("p")
        if (expandable.style.display === "none") {
            expandable.style.display = "block"
        }
        else {
            expandable.style.display = "none"
        }
    }
    // Handle click on "expand summary"

    // Handle click on title of paper
    if (e.target.classList.contains("title")) {
        let selected_ref = e.target.getAttribute("data-ref")
        ref_insertion = " (" + selected_ref + ")"

        // Enter reference after already set period (last period)
        if (pasteMethod === "lastPeriod") {
            const regex = /\.(?=[^.]*$)/g;
            let lastPeriodIndex = -1;
            let match;
    
            while ((match = regex.exec(paperText.value)) !== null) {
                lastPeriodIndex = match.index;
            }
    
            paperText.value = paperText.value.slice(0, lastPeriodIndex) + ref_insertion + paperText.value.slice(lastPeriodIndex)
        }
        else if (pasteMethod === "unfinishedSentence") {
            refToBePasted = ref_insertion
        }
        else if (pasteMethod === "selectedText") {
            let currentText = paperText.value.trim()
            let currentSetenceArray = currentText.split("!").join(".").split("?").join(".").split(".")

            currentSetence.replace("?", "")
            currentSetence.replace("!", "")
            currentSetence.replace(".", "")

            currentSetenceArray.forEach(function(item, index, theArray) {
                if (item.includes(currentSetence)) {
                    item = item.trim()
                    item = item + ref_insertion
                    theArray[index] = item
                }
                else {
                    // Multiple sentences were selected
                }
            })
            paperText.value = currentSetenceArray.join(". ")
        }
        
    }
})

// Event listener to wait for . ? or ! key and then paste refToBePasted if not empty string
window.addEventListener("keyup", (e) => {
    if ((e.key === ".") || (e.key === "?") || (e.key === "!")) {
        if (refToBePasted.length > 0) {
            let pointerIndex = paperText.selectionStart
            paperText.value = paperText.value.slice(0, (pointerIndex-1)) + refToBePasted + ". "
            refToBePasted = ""
        }
    }
})

// Change the selected paper category: saved from project or real-time search
const paperCats = document.querySelectorAll(".paper-cat")
paperCats.forEach(paperCat => {
    paperCat.addEventListener("click", (e) => {
        paperCats.forEach(cat => {
            cat.classList.toggle("selected-paper-cat")
        })
        if (document.querySelector(".selected-paper-cat") === document.getElementById("saved-lister")) {
            document.getElementById("saved-papers-container").style.display = "block"
            document.getElementById("real-time-container").style.display = "none"
        }
        else if (document.querySelector(".selected-paper-cat") === document.getElementById("real-time-searcher")) {
            document.getElementById("saved-papers-container").style.display = "none"
            document.getElementById("real-time-container").style.display = "block"
        }
    })
})


// saving the paper text
function savePaperText() {
    fetch("/editor/save", {
        method: "POST",
        body: JSON.stringify({
            "paper_text": paperText.value,
            "paper_token": document.getElementById("paper_token").value
        }),
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.getElementById("csrf_token").value
        }
    })
    .then(response => {
        response.json().then(data => {
            if (data.message === "success") {
                document.getElementById("auto-save").style.opacity = "1"
                setTimeout(() => {
                    document.getElementById("auto-save").style.opacity = "0"
                }, 5000)
                return true
            }
            else if (data.message === "error update" || data.message === "error") {
                notify_user("Saving went wrong.", "error")
                return false
            }
        })
    })
}

setInterval(() => {
    savePaperText()
}, 30000)

window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "s" || e.metaKey && e.key === "s") {
        savePaperText()
    }
})

document.getElementById("save-btn").addEventListener("click", () => {
    savePaperText()
    let current_domain = (new URL(location.href)).hostname
    if (current_domain === "localhost") {
        window.location.replace("http://localhost/editor/overview")
    }
    else {
        window.location.replace("http://" + current_domain + "/editor/overview")
    }
    
})



// paperText.addEventListener("keyup", (e) => {
//     console.log(e.target.selectionStart)
// })