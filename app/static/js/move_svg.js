const signUpContainer = document.getElementById("sign-up-cta-container")

setTimeout(() => {
    signUpContainer.style.transform = "translateY(100%)"
}, 30000)

setInterval(() => {
    signUpContainer.style.transform = "translateY(100%)"
    setTimeout(() => {
        signUpContainer.style.transform = "translateY(0)"
    }, 30000)
}, 60000)