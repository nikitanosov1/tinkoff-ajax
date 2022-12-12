import userService from "./userService.js";
import postService from "./postService.js";

let posts = document.querySelector("#posts");

const fetchAndRenderAll = async () => {
    await postService.getPosts()
    .then((fetchPosts) => {
        fetchPosts.forEach( async elem => {
            const post = document.createElement('div');
            post.classList.add('post');
            const user = await userService.getUser(elem.userId);
            post.innerHTML = `
                <div class="post bg-coffee rounded-2xl p-4 m-2 dark:bg-dust">
                    <div class="flex flex-row justify-between align-middle">
                        <div>
                            <img class="inline" height="80" width="80" src="./assets/anonim.png">
                            <h2 class="inline text-dust dark:text-coffee">${user.name}</h2>
                        </div>
                        <div class="flex align-middle flex-row justify-end my-4 space-x-3 mr-2">
                            <img class="edit-button w-8 h-8 self-center" src="./assets/edit.png" alt="edit">
                            <img class="delete-button w-8 h-8 self-center" src="./assets/bin.png" alt="delete">
                        </div>
                    </div>
                    <h1 class="text-center text-2xl pb-5 text-dust dark:text-coffee">${elem.title}</h1>
                    <h2 class="text-dust dark:text-coffee">${elem.body}</h2>
                </div>`;


            posts.appendChild(post);
        });
    });
}

fetchAndRenderAll();












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