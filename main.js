import userService from "./userService.js";
import postService from "./postService.js";

// states
let posts = {};
let users = {};
let modes = { CREATE: 0, EDIT: 1 };
let modalMode = modes.CREATE;
let idLastSelectedPost = null;
let modalWindow = document.querySelector('#modal');
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
    document.querySelector("#modal__overlay").addEventListener('click', () => {modalWindow.hidden = true});

    // when click on modal__close-button then close modal
    document.querySelector("#modal__close-button").addEventListener('click', () => {modalWindow.hidden = true});

    let userIdInput = document.querySelector("#modal__user-input");
    let titleInput = document.querySelector("#modal__title-input");
    let bodyInput = document.querySelector("#modal__body-input");

    //when click on modal__submit-button then save/update
    document.querySelector("#modal__submit-button").addEventListener('click', () => {
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
        }
        modalWindow.hidden = true;
    });
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
    delete posts[id];
    postService.deletePost(id);
    divPosts.removeChild(document.querySelector(`#post-${id}`));
};

const initCreatePostButton = () => {
    let createPostButton = document.querySelector("#create-post-button");
    createPostButton.addEventListener('click', () => {
        modalMode = modes.CREATE;
        modalWindow.hidden = false;
    });
};

const addPostToPosts = async (postData) => {
    const post = document.createElement('div');
    post.classList.add('post');
    post.id = "post-" + postData.id;
    post.innerHTML = `
        <div class="bg-coffee rounded-2xl p-4 m-2 dark:bg-dust">
            <div class="flex flex-row justify-between align-middle">
                <div>
                    <img class="inline" height="80" width="80" src="./assets/anonim.png">
                    <h2 class="username inline text-dust dark:text-coffee">${users[postData.userId].name}</h2>
                </div>
                <div class="flex align-middle flex-row justify-end my-4 space-x-3 mr-2">
                    <img class="edit-button w-8 h-8 self-center" src="./assets/edit.png" alt="edit">
                    <img class="delete-button w-8 h-8 self-center" src="./assets/bin.png" alt="delete">
                </div>
            </div>
            <h1 class="title text-center text-2xl pb-5 text-dust dark:text-coffee">${postData.title}</h1>
            <h2 class="body text-dust dark:text-coffee">${postData.body}</h2>
        </div>`;
    post.querySelector(".edit-button").addEventListener('click', () => {editPost(postData.id)});
    post.querySelector(".delete-button").addEventListener('click', () => {deletePost(postData.id)});

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
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.remove('dark')
    localStorage.theme = 'light'
} else {
    document.documentElement.classList.add('dark')
    localStorage.theme = 'dark'
}

let darkSwitchButton = document.querySelector(".dark-switch-button");

darkSwitchButton.addEventListener('click', () => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.remove('dark')
        localStorage.theme = 'light'
    } else {
        document.documentElement.classList.add('dark')
        localStorage.theme = 'dark'
    }
});