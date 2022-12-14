import userService from "./userService.js";
import postService from "./postService.js";

// states
let modalIsShow = false;
let posts = {};
let users = {};
let modes = { CREATE: 0, EDIT: 1 };
let modalMode = modes.CREATE;
let idLastSelectedPost = null;
let modalWindow = document.querySelector('#modal');

const initFetchPostsAndRenderAll = async () => {
    let divPosts = document.querySelector("#posts");
    await postService.getPosts()
    .then((fetchPosts) => {
        fetchPosts.forEach( async elem => {
            const post = document.createElement('div');
            post.classList.add('post');
            post.id = "post-" + elem.id;

            const user = await userService.getUser(elem.userId);
            post.innerHTML = `
                <div class="bg-coffee rounded-2xl p-4 m-2 dark:bg-dust">
                    <div class="flex flex-row justify-between align-middle">
                        <div>
                            <img class="inline" height="80" width="80" src="./assets/anonim.png">
                            <h2 class="username inline text-dust dark:text-coffee">${user.name}</h2>
                        </div>
                        <div class="flex align-middle flex-row justify-end my-4 space-x-3 mr-2">
                            <img class="edit-button w-8 h-8 self-center" src="./assets/edit.png" alt="edit">
                            <img class="delete-button w-8 h-8 self-center" src="./assets/bin.png" alt="delete">
                        </div>
                    </div>
                    <h1 class="title text-center text-2xl pb-5 text-dust dark:text-coffee">${elem.title}</h1>
                    <h2 class="body text-dust dark:text-coffee">${elem.body}</h2>
                </div>`;
            post.querySelector(".edit-button").addEventListener('click', () => {editPost(elem.id)});
            post.querySelector(".delete-button").addEventListener('click', () => {deletePost(elem.id)});

            posts[elem.id] = {
                userId: elem.userId,
                username: user.name,
                title: elem.title,
                body: elem.body
            };
            divPosts.appendChild(post);
        });
    });
}

const initModal = () => {
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
                editingPost.querySelector(".username").innerHTML  = userIdInput.value;
                editingPost.querySelector(".title").innerHTML  = titleInput.value;
                editingPost.querySelector(".body").innerHTML  = bodyInput.value;
                // update posts array
                posts[idLastSelectedPost].userId = userIdInput.value;
                posts[idLastSelectedPost].title = titleInput.value;
                posts[idLastSelectedPost].body = bodyInput.value;
                break;
            case modes.CREATE:
                

        }
        modalWindow.hidden = true;
    });
};

const initFetchUsers = () => {
    userService.getUsers().then((fetchUsers) => {
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

initFetchPostsAndRenderAll();
initModal();
initFetchUsers();

const editPost = (id) => {
    console.log(`edit post with id = ${id}`);
    modalMode = modes.EDIT;
    idLastSelectedPost = id;
    // fill modal
    document.querySelector("#modal__user-input").value = posts[id].userId;
    document.querySelector("#modal__title-input").value = posts[id].title;
    document.querySelector("#modal__body-input").value = posts[id].body;
    // show modal
    modalWindow.hidden = false;


};

const deletePost = () => {
    console.log(`delete post with id = ${id}`);
    // check favorites post

};










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