const textareaDescription = document.getElementById("description-container")
const change_icons = document.querySelectorAll(".change_desc")
const desc = document.getElementById("citation")
const textAreaDesc = document.getElementById("description")

textAreaDesc.value = desc.innerText
textAreaDesc.innerText = desc.innerText

let edit_state = false
const project_token_array = window.location.href.split("/")
const project_token = project_token_array[project_token_array.length -1]

change_icons.forEach(change_icon => {
    change_icon.addEventListener("click", () => {
        if (edit_state) {
            textareaDescription.style.display = "none"
            
            fetch("/update-project-desc", {
                method: "POST",
                body: JSON.stringify({
                    "description_text": textAreaDesc.value,
                    "project_token": project_token
                }),
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.getElementById("csrf_token")
                }
            })
            .then(response => {
                response.json().then(data => {
                    if (data.message === "OK") {
                        textAreaDesc.value = data.new_desc
                        textAreaDesc.innerText = data.new_desc
                        desc.innerText = data.new_desc
                        edit_state = false
                        desc.style.display = "block"
                        document.getElementById("save-svg").style.display = "none"
                        document.getElementById("edit-svg").style.display = "inline"
                        document.getElementById("edit-svg").parentElement.setAttribute("data-tooltip", "Edit")
                        notify_user(data.notification, "success")
                    }
                })
            })
        }
        else {
            textareaDescription.style.display = "block"
            desc.style.display = "none"
            document.getElementById("save-svg").style.display = "inline"
            document.getElementById("edit-svg").style.display = "none"
            document.getElementById("edit-svg").parentElement.setAttribute("data-tooltip", "Save")
    
            edit_state = true
        }
    })
})