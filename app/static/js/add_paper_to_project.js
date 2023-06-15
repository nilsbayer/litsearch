const addBtn = document.getElementById("add-paper-btn")
const overlayField = document.querySelector(".overlay")
const userProjects = document.querySelectorAll(".project-box")

addBtn.addEventListener("click", (e) => {
    overlayField.style.display = "flex"
})

overlayField.addEventListener("click", (e) => {
    if (e.target.classList.contains("overlay")) {
        overlayField.style.display = "none"
    }
})

const urlList = location.href.split("/")
const paperToken = urlList[urlList.length -1]

userProjects.forEach(userProject => {
    userProject.addEventListener("click", (e) => {
        fetch("/paper-to-project", {
            method: "POST",
            body: JSON.stringify({
                "paper_token": paperToken,
                "project_token": userProject.getAttribute("data-token")
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            response.json().then(data => {
                if (data.message === "success") {
                    overlayField.style.display = "none"
                    notify_user("Successfully added to project", "success")
                }
                else {
                    overlayField.style.display = "none"
                    notify_user("Somethig went wrong", "error")
                }
            })
        })
    })
})