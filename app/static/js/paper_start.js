const startPaperBtn = document.getElementById("start-paper-btn")
var projectTokenArray = location.href.split("/")
var projectToken = projectTokenArray[projectTokenArray.length -1]

startPaperBtn.addEventListener("click", () => {
    fetch("/project/start-paper", {
        method: "POST",
        body: JSON.stringify({
            "project_token": projectToken,
            "project_name": projectName
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        response.json().then(data => {
            if (data.message === "success") {
                // let aTag = document.createElement("a")
                // aTag.href = data.url
                // aTag.setAttribute("")
                window.open(data.url, "_blank")
                window.location.replace(location.href)
            }   
            else if (data.message === "error") {
                notify_user("Something went wrong", "error")
            }
        })
    })
})