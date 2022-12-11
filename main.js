let posts = document.querySelector("#posts");

let response = fetch("https://jsonplaceholder.typicode.com/posts",
    {
        method: "GET"
    }
    ).then((response) => {
        response.json()
        .then((result) => {
            result.forEach(elem => {
                const post = document.createElement('div');
                post.classList.add('post');
                post.innerHTML = `
                    <div class="post bg-coffee rounded-2xl p-4 m-2 dark:bg-dust">
                        <div>
                            <img class="inline" height="80" width="80" src="./assets/anonim.png">
                            <h2 class="inline text-dust dark:text-coffee">Zarov Evgenii</h2>
                        </div>
                        <h1 class="text-center text-2xl pb-5 text-dust dark:text-coffee">${elem.title}</h1>
                        <h2 class="text-dust dark:text-coffee">${elem.body}</h2>
                    </div>`;


                posts.appendChild(post);
            });
        });
    });

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