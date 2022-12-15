import userService from "./userService.js";
import postService from "./postService.js";

// states
let posts = {};
let users = {};
let modes = { CREATE: 0, EDIT: 1, DELETE: 2 };
let modalMode = modes.CREATE;
let idLastSelectedPost = null;
let modalWindow = document.querySelector('#modal');
let repeatModalWindow = document.querySelector("#repeat-modal-window");
let divPosts = document.querySelector('#posts');

// loader
let loader = document.querySelector('#loader');
let loading = new CustomEvent('loading');
let stopLoading = new CustomEvent('stopLoading');

document.addEventListener('loading', () => {
    loader.hidden = false;
});

document.addEventListener('stopLoading', () => {
    loader.hidden = true;
});

const initFetchUsers = async () => {
    await userService.getUsers().then((fetchUsers) => {
        fetchUsers.forEach((fetchUser) => {
            users[fetchUser.id] = {
                name: fetchUser.name,
                username: fetchUser.username,
                email: fetchUser.email,
                phone: fetchUser.phone,
            };
        });
    });
};

const initModal = () => {
    // added user names to modal__user-input how <option> tag
    let modalUserInput = document.querySelector("#modal__user-input")
    for (let userId in users) {
        const option = document.createElement('option');
        option.setAttribute("value", userId);
        option.innerHTML = users[userId].name;
        modalUserInput.add(option);
    }

    // when click on modal__overlay then close modal
    document.querySelector("#modal__overlay").addEventListener('click', () => {
        modalWindow.hidden = true;
        repeatModalWindow.hidden = true; // hide repeat modal inner window
        modalWindow.firstElementChild.nextElementSibling.hidden = false; // show standart modal inner window
    });

    // when click on modal__close-button then close modal
    document.querySelector("#modal__close-button").addEventListener('click', () => {modalWindow.hidden = true});

    let userIdInput = document.querySelector("#modal__user-input");
    let titleInput = document.querySelector("#modal__title-input");
    let bodyInput = document.querySelector("#modal__body-input");

    const modalSubmitButtonFunction = () => {
        // TODO: add validation
        switch (modalMode) {
            case modes.EDIT:
                let editingPost = document.querySelector(`#post-${idLastSelectedPost}`);
                // update DOM
                editingPost.querySelector(".username").innerHTML  = users[userIdInput.value].name;
                editingPost.querySelector(".title").innerHTML  = titleInput.value;
                editingPost.querySelector(".body").innerHTML  = bodyInput.value;
                // update posts array
                posts[idLastSelectedPost].userId = userIdInput.value;
                posts[idLastSelectedPost].username = users[userIdInput.value].name;
                posts[idLastSelectedPost].title = titleInput.value;
                posts[idLastSelectedPost].body = bodyInput.value;

                // fake ajax request
                postService.editPost({
                    id: idLastSelectedPost,
                    title: titleInput.value,
                    body: bodyInput.value,
                    userId: userIdInput.value
                });

                break;
            case modes.CREATE:
                // added post to posts array
                posts[idLastSelectedPost] = {};
                posts[idLastSelectedPost].userId = userIdInput.value;
                posts[idLastSelectedPost].username = users[userIdInput.value].name;
                posts[idLastSelectedPost].title = titleInput.value;
                posts[idLastSelectedPost].body = bodyInput.value;

                // send AJAX request to save post
                const newPostFromFetch = postService.createPost({
                    userId: posts[idLastSelectedPost].userId,
                    title: posts[idLastSelectedPost].title,
                    body: posts[idLastSelectedPost].body
                });

                addPostToPosts({
                    id: newPostFromFetch.id,
                    userId: posts[idLastSelectedPost].userId,
                    title: posts[idLastSelectedPost].title,
                    body: posts[idLastSelectedPost].body,
                });
                break;
            case modes.DELETE:
                localStorage[idLastSelectedPost] = JSON.stringify(false); // set idLastSelectedPost to not favorite
                deletePost(idLastSelectedPost);
            break;
        }
        modalWindow.hidden = true;
    };
    //when click on modal__submit-button then save/update/delete
    document.querySelector("#modal__submit-button").addEventListener('click', () => {modalSubmitButtonFunction()});
    document.querySelector("#repeat-modal-window__submit-button").addEventListener('click', () => {modalSubmitButtonFunction()});
};

const editPost = (id) => {
    modalMode = modes.EDIT;
    idLastSelectedPost = id;
    // fill modal
    document.querySelector("#modal__user-input").value = posts[id].userId;
    document.querySelector("#modal__title-input").value = posts[id].title;
    document.querySelector("#modal__body-input").value = posts[id].body;
    // show modal
    modalWindow.hidden = false;
};

const deletePost = (id) => {
    idLastSelectedPost = id;
    modalMode = modes.DELETE;
    if (JSON.parse(localStorage[id])) {
        // if the post is important
        repeatModalWindow.querySelector("#repeat-modal-window__title").innerHTML = `
        <div class="">Are you sure to delete this post?</div>
        <div class="bg-coffee rounded-2xl p-4 m-2 dark:bg-dust">
        <div class="flex flex-row justify-between align-middle">
            <div class="flex flex-row align-middle justify-start">
                <img class="inline" height="80" width="80" src="./assets/anonim.png">
                <h2 class="username inline text-dust self-center dark:text-coffee overflow-hidden">${users[posts[id].userId].name}</h2>
            </div>
            <div class="flex align-middle flex-row justify-end my-4 space-x-3 mr-2">
                <div class="star w-8 h-8 self-center">
                    <img class="active-star w-8 h-8 self-center" src="./assets/activeStar.png" alt="added to favotites" hidden>
                    <img class="afk-star w-8 h-8 self-center" src="./assets/afkStar.png" alt="not added to favorites">
                </div>
                <img class="edit-button w-8 h-8 self-center" src="./assets/edit.png" alt="edit">
                <img class="delete-button w-8 h-8 self-center" src="./assets/bin.png" alt="delete">
            </div>
        </div>
        <h1 class="title text-center text-2xl pb-5 text-dust dark:text-coffee">${posts[id].title}</h1>
        <h2 class="body text-dust dark:text-coffee">${posts[id].body}</h2>
        </div>


        `;
        modalWindow.firstElementChild.nextElementSibling.hidden = true; // hide standart modal inner window
        repeatModalWindow.hidden = false; // show repeat modal inner window
        modalWindow.hidden = false; // show full modal window
        return;
    }
    console.log("ss");
    delete posts[id];
    postService.deletePost(id);
    divPosts.removeChild(document.querySelector(`#post-${id}`));
    localStorage.removeItem(id);
    
    repeatModalWindow.hidden = true; // hide repeat modal inner window
    modalWindow.firstElementChild.nextElementSibling.hidden = false; // show standart modal inner window
    modalWindow.hidden = true; // hide full modal window
};

const initCreatePostButton = () => {
    let createPostButton = document.querySelector("#create-post-button");
    createPostButton.addEventListener('click', () => {
        modalMode = modes.CREATE;
        modalWindow.hidden = false;
    });
};

const insertAfter = (referenceNode, newNode) => {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

const changeImportanceOfPost = (id) => {
    let starDiv = document.querySelector(`#post-${id} .star`);
    starDiv.firstElementChild.hidden = !starDiv.firstElementChild.hidden;
    starDiv.lastElementChild.hidden = !starDiv.lastElementChild.hidden;
    localStorage[id] = !(JSON.parse(localStorage[id])); // save to localStorage
    let currentPost = document.querySelector(`#post-${id}`);
    if (JSON.parse(localStorage[id])){
        // this post now is important, move to start
        //divPosts.firstChild.nextSibling is loader
        insertAfter(divPosts.firstChild.nextSibling, currentPost);
    } else {
        // this post now is normal, move to end
        insertAfter(divPosts.lastChild, currentPost);
    }
}

const addPostToPosts = async (postData) => {
    const post = document.createElement('div');
    post.classList.add('post');
    post.classList.add('transition');
    post.classList.add('ease-in-out');
    post.classList.add('delay-30');
    post.classList.add('hover:scale-105');
    post.id = "post-" + postData.id;
    post.innerHTML = `
        <div class="rounded-2xl p-4 m-2 bg-dust dark:bg-gray-400">
            <div class="flex flex-row justify-between align-middle">
                <div class="flex flex-row align-middle justify-start">
                    <img class="inline" height="80" width="80" src="./assets/anonim.png">
                    <h2 class="username inline text-dust self-center dark:text-coffee overflow-hidden">${users[postData.userId].name}</h2>
                </div>
                <div class="flex align-middle flex-row justify-end my-4 space-x-3 mr-2">
                    <div class="star w-8 h-8 self-center">
                        <img class="active-star w-8 h-8 self-center" src="./assets/activeStar.png" alt="added to favotites" hidden>
                        <img class="afk-star w-8 h-8 self-center" src="./assets/afkStar.png" alt="not added to favorites">
                    </div>
                    <img class="edit-button w-8 h-8 self-center" src="./assets/edit.png" alt="edit">
                    <img class="delete-button w-8 h-8 self-center" src="./assets/bin.png" alt="delete">
                </div>
            </div>
            <h1 class="title text-center text-2xl pb-5 text-dust dark:text-coffee">${postData.title}</h1>
            <h2 class="body text-dust dark:text-coffee">${postData.body}</h2>
        </div>`;
    post.querySelector(".edit-button").addEventListener('click', () => {editPost(postData.id)});
    post.querySelector(".delete-button").addEventListener('click', () => {deletePost(postData.id)});
    post.querySelector(".star").addEventListener('click', () => {changeImportanceOfPost(postData.id)});

    posts[postData.id] = postData;
    divPosts.appendChild(post);
};

const initFetchPostsAndRenderAll = async () => {
    // start loading
    document.dispatchEvent(loading);

    let divPosts = document.querySelector("#posts");
    await postService.getPosts()
    .then((fetchPosts) => {
        fetchPosts.forEach( async elem => {
            addPostToPosts({
                id: elem.id,
                userId: elem.userId,
                title: elem.title,
                body: elem.body,
            });
            localStorage[elem.id] = JSON.stringify(false);
        });
    });

    // stop loading
    document.dispatchEvent(stopLoading);
}

// main
await initFetchUsers();
initModal();
initCreatePostButton();
await initFetchPostsAndRenderAll();

// Dark mode


let darkSwitchButton = document.querySelector(".dark-switch-button");

// init default theme (light) if theme doesn't exit
localStorage.theme =  ('theme' in localStorage) ? localStorage.theme : JSON.stringify('light');

// if user already has theme on localStorage then apply this theme
if (JSON.parse(localStorage.theme) === 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.theme = JSON.stringify('dark');
} 

darkSwitchButton.addEventListener('click', () => {
    if (JSON.parse(localStorage.theme) === 'dark') {
        document.documentElement.classList.remove('dark');
        localStorage.theme = JSON.stringify('light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = JSON.stringify('dark');
    }
});