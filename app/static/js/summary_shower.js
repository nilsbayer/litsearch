const allSummaryBtns = document.querySelectorAll(".summary-cta")

allSummaryBtns.forEach(summaryBtn => {
    summaryBtn.addEventListener("click", (e) => {
        let paperName = e.target.parentElement.parentElement.querySelector("span").innerText
        
        fetch("/get-summary", {
            method: "POST",
            body: JSON.stringify({
                "paper_name": paperName
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            response.json().then(data => {
                if (data.message != "success") {
                    notify_user(data.message, "error")
                }
                else if (data.message === "success") {
                    document.querySelector(".overlay").style.display = "flex"
                    document.getElementById("summary-title").innerText = "Summary of: " + paperName
                    document.getElementById("summary-holder").innerText = data.summary
                }
            })
        })
    })
})

document.querySelector(".overlay").addEventListener("click", (e) => {
    if (e.target.classList.contains("overlay")) {
        document.querySelector(".overlay").style.display = "none"
    }
})