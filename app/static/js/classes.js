function notify_user (notification_text, error_or_success) {
    let errorDiv = document.createElement("div")
    errorDiv.innerHTML = notification_text
    if (error_or_success === "error") {
        errorDiv.classList.add("error-div")
    }
    else if (error_or_success === "success") {
        errorDiv.classList.add("success-div")
    }
    document.body.append(errorDiv)
    setTimeout(() => {
        errorDiv.style.top = "110vh"
        setTimeout(() => {
            errorDiv.remove()
        }, 500)
    }, 4500)
}