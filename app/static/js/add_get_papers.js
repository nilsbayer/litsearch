const project_token_array1 = window.location.href.split("/")
const project_token1 = project_token_array1[project_token_array1.length -1]
const savedPaperDiv = document.getElementById("saved-paper-div")

// Saving a paper from recommendations to saved literature list
window.addEventListener("click", (e) => {

    if (e.target.classList.contains("select-paper")) {
        notify_user("Saving in process", "success")
        // console.log(e.target.parentElement.parentElement.parentElement.querySelector("span").innerText)
        fetch("/add-paper-to-project", {
            method: "POST",
            body: JSON.stringify({
                "paper_name": e.target.parentElement.parentElement.parentElement.querySelector("span").innerText,
                "project_token": project_token1
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            response.json().then(data => {
                if (data.message === "success") {
                    let newSavedPaperContainer = document.createElement("div")
                    newSavedPaperContainer.classList.add("found-paper")
                    newSavedPaperContainer.innerHTML = `
                    <span>${data.saved_paper.title}</span>
                    <div class="icon-container">
                        <svg class="deselect-paper" width="20" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect style="pointer-events: none;" x="2" y="2" width="32" height="32" rx="16" stroke="#3D6C8D" stroke-width="4"/>
                            <rect style="pointer-events: none;" x="10.3809" y="19.4356" width="3.09202" height="15.4601" rx="1.54601" transform="rotate(-90 10.3809 19.4356)" fill="#3D6C8D"/>
                        </svg>
                        <a href="${data.link}">
                            <svg width="16" height="30" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.33333 24.5221C2.875 24.5221 2.5 24.1415 2.5 23.6765V3.38235C2.5 2.91728 2.875 2.53676 3.33333 2.53676H11.6667V6.76471C11.6667 7.70014 12.4115 8.45588 13.3333 8.45588H17.5V23.6765C17.5 24.1415 17.125 24.5221 16.6667 24.5221H3.33333ZM3.33333 0C1.49479 0 0 1.51677 0 3.38235V23.6765C0 25.542 1.49479 27.0588 3.33333 27.0588H16.6667C18.5052 27.0588 20 25.542 20 23.6765V8.16521C20 7.26677 19.651 6.40533 19.026 5.77114L14.3073 0.988281C13.6823 0.35409 12.8385 0 11.9531 0H3.33333ZM6.25 13.5294C5.55729 13.5294 5 14.0949 5 14.7978C5 15.5007 5.55729 16.0662 6.25 16.0662H13.75C14.4427 16.0662 15 15.5007 15 14.7978C15 14.0949 14.4427 13.5294 13.75 13.5294H6.25ZM6.25 18.6029C5.55729 18.6029 5 19.1684 5 19.8713C5 20.5742 5.55729 21.1397 6.25 21.1397H13.75C14.4427 21.1397 15 20.5742 15 19.8713C15 19.1684 14.4427 18.6029 13.75 18.6029H6.25Z" fill="#3D6C8D"/>
                            </svg>
                        </a>
                    </div>
                    `
                    savedPaperDiv.append(newSavedPaperContainer)

                    notify_user("Papers was successfully added to this project.", "success")
                }
                else {
                    console.error(data.message)
                    if (data.reason) {
                        notify_user(data.reason, "error")
                    }
                }
            })
        })
    }

    if (e.target.classList.contains("deselect-paper")) {
        notify_user("Removing in process", "success")
        fetch("/remove-paper-to-project", {
            method: "POST",
            body: JSON.stringify({
                "paper_name": e.target.parentElement.parentElement.parentElement.querySelector("span").innerText,
                "project_token": project_token1
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            response.json().then(data => {
                if (data.message === "success") {
                    e.target.parentElement.parentElement.parentElement.remove()
                    notify_user(data.reason, "success")
                }
                else {
                    notify_user("Something went wrong.", "error")
                }
            })
        })
    }

})

// Clicking on "show more" on project page
const showMoreBtn = document.getElementById("show-more")
const morePapersDiv = document.getElementById("further-papers")
let papers_expanded = false

showMoreBtn.addEventListener("click", (e) => {
    if (papers_expanded) {
        morePapersDiv.style.maxHeight = "0px"
        morePapersDiv.style.opacity = "0"
        morePapersDiv.style.pointerEvents = "none"
        morePapersDiv.style.display = "none"
        showMoreBtn.innerText = "Show more"
        papers_expanded = false
    }
    else {
        morePapersDiv.style.display = "block"
        morePapersDiv.style.maxHeight = "fit-content"
        morePapersDiv.style.opacity = "1"
        morePapersDiv.style.pointerEvents = "all"
        showMoreBtn.innerText = "Show less"
        papers_expanded = true
    }
})