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
                        document.getElementById("found-paper-container").innerHTML = ""
                        data.new_results.slice(0,3).forEach(new_result => {
                            let newDiv = document.createElement("div")
                            newDiv.classList.add("found-paper")
                            newDiv.innerHTML = `
                            <span>${new_result.title}</span>
                            <div class="icon-container">
                                <span data-tooltip="Save to this project">
                                    <svg class="select-paper"  width="20" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect style="pointer-events: none;" x="2" y="2" width="32" height="32" rx="16" stroke="#3D6C8D" stroke-width="4"/>
                                        <rect style="pointer-events: none;" x="16.5645" y="10.1595" width="3.09202" height="15.4601" rx="1.54601" fill="#3D6C8D"/>
                                        <rect style="pointer-events: none;" x="10.3809" y="19.4356" width="3.09202" height="15.4601" rx="1.54601" transform="rotate(-90 10.3809 19.4356)" fill="#3D6C8D"/>
                                    </svg>
                                </span>
                                <svg width="16" height="30" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.33333 24.5221C2.875 24.5221 2.5 24.1415 2.5 23.6765V3.38235C2.5 2.91728 2.875 2.53676 3.33333 2.53676H11.6667V6.76471C11.6667 7.70014 12.4115 8.45588 13.3333 8.45588H17.5V23.6765C17.5 24.1415 17.125 24.5221 16.6667 24.5221H3.33333ZM3.33333 0C1.49479 0 0 1.51677 0 3.38235V23.6765C0 25.542 1.49479 27.0588 3.33333 27.0588H16.6667C18.5052 27.0588 20 25.542 20 23.6765V8.16521C20 7.26677 19.651 6.40533 19.026 5.77114L14.3073 0.988281C13.6823 0.35409 12.8385 0 11.9531 0H3.33333ZM6.25 13.5294C5.55729 13.5294 5 14.0949 5 14.7978C5 15.5007 5.55729 16.0662 6.25 16.0662H13.75C14.4427 16.0662 15 15.5007 15 14.7978C15 14.0949 14.4427 13.5294 13.75 13.5294H6.25ZM6.25 18.6029C5.55729 18.6029 5 19.1684 5 19.8713C5 20.5742 5.55729 21.1397 6.25 21.1397H13.75C14.4427 21.1397 15 20.5742 15 19.8713C15 19.1684 14.4427 18.6029 13.75 18.6029H6.25Z" fill="#3D6C8D"/>
                                </svg>
                            </div>
                            `
                            document.getElementById("found-paper-container").append(newDiv)
                        })
                        document.getElementById("further-papers").innerHTML = ""
                        data.new_results.slice(3).forEach(new_result => {
                            let newDiv = document.createElement("div")
                            newDiv.classList.add("found-paper")
                            newDiv.innerHTML = `
                            <span>${new_result.title}</span>
                            <div class="icon-container">
                                <span data-tooltip="Save to this project">
                                    <svg class="select-paper"  width="20" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect style="pointer-events: none;" x="2" y="2" width="32" height="32" rx="16" stroke="#3D6C8D" stroke-width="4"/>
                                        <rect style="pointer-events: none;" x="16.5645" y="10.1595" width="3.09202" height="15.4601" rx="1.54601" fill="#3D6C8D"/>
                                        <rect style="pointer-events: none;" x="10.3809" y="19.4356" width="3.09202" height="15.4601" rx="1.54601" transform="rotate(-90 10.3809 19.4356)" fill="#3D6C8D"/>
                                    </svg>
                                </span>
                                <svg width="16" height="30" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.33333 24.5221C2.875 24.5221 2.5 24.1415 2.5 23.6765V3.38235C2.5 2.91728 2.875 2.53676 3.33333 2.53676H11.6667V6.76471C11.6667 7.70014 12.4115 8.45588 13.3333 8.45588H17.5V23.6765C17.5 24.1415 17.125 24.5221 16.6667 24.5221H3.33333ZM3.33333 0C1.49479 0 0 1.51677 0 3.38235V23.6765C0 25.542 1.49479 27.0588 3.33333 27.0588H16.6667C18.5052 27.0588 20 25.542 20 23.6765V8.16521C20 7.26677 19.651 6.40533 19.026 5.77114L14.3073 0.988281C13.6823 0.35409 12.8385 0 11.9531 0H3.33333ZM6.25 13.5294C5.55729 13.5294 5 14.0949 5 14.7978C5 15.5007 5.55729 16.0662 6.25 16.0662H13.75C14.4427 16.0662 15 15.5007 15 14.7978C15 14.0949 14.4427 13.5294 13.75 13.5294H6.25ZM6.25 18.6029C5.55729 18.6029 5 19.1684 5 19.8713C5 20.5742 5.55729 21.1397 6.25 21.1397H13.75C14.4427 21.1397 15 20.5742 15 19.8713C15 19.1684 14.4427 18.6029 13.75 18.6029H6.25Z" fill="#3D6C8D"/>
                                </svg>
                            </div>
                            `
                            document.getElementById("further-papers").append(newDiv)
                        })
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