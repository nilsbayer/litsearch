const inPaperSearchBar = document.getElementById("subject-finder")

var timeOut;
var interval_for_request = 600;

inPaperSearchBar.addEventListener("keyup", (e) => {
    clearTimeout(timeOut);
    if (inPaperSearchBar.value) {
        timeOut = setTimeout((e) => {
            get_parts(e)
        }, interval_for_request);
    }
})

function get_parts(e) {
    document.getElementById("loading-div").style.display = "block"
    fetch("/paper-search/find-relevant-paper", {
        method: "POST",
        body: JSON.stringify({
            "paper_name": document.querySelector("h1").innerText,
            "users_query": inPaperSearchBar.value
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        response.json().then(data => {
            if (data.message === "success") {
                document.getElementById("subject-result-container").innerHTML = ""
                data.found_parts.forEach(part => {
                    let newDiv = document.createElement("p")
                    newDiv.classList.add("subject-result")
                    newDiv.innerText = part
                    document.getElementById("subject-result-container").append(newDiv)
                })
                document.getElementById("loading-div").style.display = "none"
            }
            else {
                notify_user("Something went wrong", "error")
            }
        })
    })
}

