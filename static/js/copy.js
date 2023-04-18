const copySummary = document.getElementById("copy-summary")
const copyCitation = document.getElementById("copy-citation")

function success_message (copy_text) {
    let errorDiv = document.createElement("div")
    errorDiv.innerHTML = copy_text
    errorDiv.classList.add("success-div")
    document.body.append(errorDiv)
    setTimeout(() => {
        errorDiv.style.top = "110vh"
        setTimeout(() => {
            errorDiv.remove()
        }, 500)
    }, 4500)
}

copySummary.addEventListener("click", success_message("Summary was copied successfully to your clipboard"))
copyCitation.addEventListener("click", success_message("Citation was copied successfully to your clipboard"))