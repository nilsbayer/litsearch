// Focus on inputs from the start
window.addEventListener("load", () => {
    document.getElementById("name").focus()
})

// Clicking on "next" button
document.getElementById("next").addEventListener("click", () => {
    if (document.getElementById("name").value === "") {
        let errorDiv = document.createElement("div")
        errorDiv.innerHTML = "Please name the project"
        errorDiv.classList.add("error-div")
        document.body.append(errorDiv)
        setTimeout(() => {
            errorDiv.style.top = "110vh"
            setTimeout(() => {
                errorDiv.remove()
            }, 500)
        }, 4500)
    }
    else {
        document.getElementById("description").focus()
        document.getElementById("description").style.display = "inline"
        document.getElementById("back").style.display = "inline"
        document.getElementById("name").style.display = "none"
        document.getElementById("next").style.display = "none"
        document.getElementById("submit").style.display = "inline"
        document.querySelector("h1").innerText = "Describe what you want to investigate, thus we can propose some sample questions."
    }
})

// Clicking on "Back" button
document.getElementById("back").addEventListener("click", () => {
    document.getElementById("name").focus()
    document.getElementById("description").style.display = "none"
    document.getElementById("back").style.display = "none"
    document.getElementById("name").style.display = "inline"
    document.getElementById("next").style.display = "inline"
    document.getElementById("submit").style.display = "none"
    document.querySelector("h1").innerText = "Create a survey & easy data analysis"
})

document.getElementById("name").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault()
    }
})