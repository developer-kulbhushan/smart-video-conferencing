let users = [];

let onMemberJoined = async (MemberId) => {
    console.log('A new member has joined the room:', MemberId)
    addMemberToDom(MemberId)

    let members = await channel.getMembers()
    updateMemberTotal(members)

    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])
    addBotMessageToDom(`${name} has joined the chat`);
}

let addMemberToDom = async (MemberId) => {
    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])

    let membersWrapper = document.getElementById('member__list')
    let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                    </div>`

    membersWrapper.insertAdjacentHTML('beforeend', memberItem)
}

let updateMemberTotal = async (members) => {
    let total = document.getElementById('members__count')
    total.innerText = members.length

}


let onMemberLeft = async (MemberId) => {
    removeMemberFromDom(MemberId);
    let members = await channel.getMembers();
    updateMemberTotal(members);
}

let removeMemberFromDom = async (MemberId) => {
    let memberWrapper = document.getElementById(`member__${MemberId}__wrapper`)
    let name = memberWrapper.getElementsByClassName('member_name')[0].textContent
    addBotMessageToDom(`${name} has left the chat.`)
        
    memberWrapper.remove()
}

let getMembers = async () => {
    let members = await channel.getMembers()
    updateMemberTotal(members)

    for (let i = 0; members.length > i; i++){
        addMemberToDom(members[i])
    }
}

async function checkValid(words) {
    for(let word of words){
        if(await checkWord(word) == false){
            prompt('Invalid Message');
            return false;
        }
    }
    return true;
}



async function checkWord(word){
    const api_url = "https://api.dictionaryapi.dev/api/v2/entries/en/";
    const response = await fetch(api_url + word).then(res => res);
    
    // const api_url = "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20230204T044051Z.30e8ccdc57e647e7.b9a0f5481a635902ece2b122e1a5b79ff5c4e5ab&lang=en-ru&text=";
    //  const response = await fetch(api_url + word).then(res => res);
    //  console.log(response);
     if(Response.statuscode === 404){
        return false;
    } else {
        return true;
    }

}

let handleChannelMessage = async (messageData, MemberId) => {
    console.log('A new message was received')
    let data = JSON.parse(messageData.text)

    if(data.type === 'chat'){
        addMessageToDom(data.displayName, data.message)
    }

    if(data.type === 'user_left'){
        document.getElementById(`user-container-${data.uid}`).remove()

        if(userIdInDisplayFrame === `user-container-${uid}`){
            displayFrame.style.display = null
    
            for(let i = 0; videoFrames.length > i; i++){
                videoFrames[i].style.height = '300px'
                videoFrames[i].style.width = '300px'
            }
        }
    }
}

let sendMessage = async (e) => {
    e.preventDefault()

    let message = e.target.message.value
    // if(! await checkValid(message.split(' ')))
    //     return;
    channel.sendMessage({text:JSON.stringify({'type':'chat', 'message':message, 'displayName':displayName})})
    addMessageToDom(displayName, message)
    e.target.reset()
}

let addMessageToDom = (name, message) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage = `<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }
}


let addBotMessageToDom = (botMessage) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage = `<div class="message__wrapper">
                        <div class="message__body__bot">
                            <strong class="message__author__bot">🤖 Mr. SVC</strong>
                            <p class="message__text__bot">${botMessage}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }
}

let leaveChannel = async () => {
    await channel.leave()
    await rtmClient.logout()
}

window.addEventListener('beforeunload', leaveChannel)
let messageForm = document.getElementById('message__form')
messageForm.addEventListener('submit', sendMessage)