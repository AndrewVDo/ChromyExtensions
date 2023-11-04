function insertGoogleIcons() {
    //Sourced from https://fonts.google.com/icons?icon.platform=web
    var googleIconsLink = document.createElement("link")
    googleIconsLink.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    googleIconsLink.type = "text/css"
    googleIconsLink.rel = "stylesheet"

    var googleIconsStyle = document.createElement("style")
    googleIconsStyle.innerText = `
        .material-symbols-outlined {
            font-variation-settings:
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24
    `
    document.head.appendChild(googleIconsLink)
    document.head.appendChild(googleIconsStyle)
}

function insertStyle() {
    insertGoogleIcons()

    var style = document.createElement("style")
    style.innerHTML = `
    .top-menu {
        all: initial;
        display: inline-block;
        width: 100%;
        margin: 0px;
        padding: 16px;
        font-size: 16px;
        line-height: 1;
        background: rgb(255,255,255);
        background: linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);

        position: fixed;
        z-index: 2147483648;
        left: 0px;
        top: 0px;
        linear-gradient(transparent, cyan 75%)
    }

    .top-menu button {
        margin-right: 3px;
        padding: 3px;
        border-style: hidden;
        border-radius: 100px;
    }

    .top-menu button span {
        font-size: 18px;
    }
    
    .top-menu input {
        width: 80%;
        margin-right: 3px;
        padding: 8px 16px;
        font: arial;
        font-size: 16px;
        border-style: hidden;
        border-radius: 100px;
    }
    `
    document.head.appendChild(style)
}

function createButton(iconName, /*clickHandler,*/ iconClass="material-symbols-outlined") {
    var innerSpan = document.createElement("span")
    innerSpan.className = iconClass
    innerSpan.innerHTML = iconName

    var newButton = document.createElement("button")
    newButton.type = "button"
    // newButton.addEventListener("click", clickHandler)
    newButton.appendChild(innerSpan)

    return newButton
}

function createAddressBar() {
    // var bookmarkButton = createButton("star")

    var bar = document.createElement("input")
    // bar.appendChild(bookmarkButton)
    return bar
}

function insertContent() {
    var backButton = createButton("arrow_back")
    var forwardButton = createButton("arrow_forward")
    var refreshButton = createButton("refresh")
    var addressBar = createAddressBar("input")

    var topMenu = document.createElement("div")
    topMenu.className = "top-menu"
    topMenu.appendChild(backButton)
    topMenu.appendChild(forwardButton)
    topMenu.appendChild(refreshButton)
    topMenu.appendChild(addressBar)
    document.body.appendChild(topMenu)
}

insertStyle()
insertContent()
console.log("HI")