const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const battleToggle = document.getElementById("battleToggle");
const battleInputs = document.getElementById("battleInputs");
const battleBtn = document.getElementById("battleBtn");

const loading = document.getElementById("loading");
const error = document.getElementById("error");

const profileContainer = document.getElementById("profileContainer");
const repoContainer = document.getElementById("repoContainer");
const battleContainer = document.getElementById("battleContainer");

// Toggle Battle Mode
battleToggle.addEventListener("change", () => {
    battleInputs.classList.toggle("hidden");
});

// Single User Search
searchBtn.addEventListener("click", () => {
    const username = searchInput.value.trim();

    if (!username) {
        error.textContent = "Please enter a username";
        return;
    }

    getUser(username);
});

searchInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        searchBtn.click();

    }

});

// Battle Search
battleBtn.addEventListener("click", () => {
    const user1 = document.getElementById("user1").value.trim();
    const user2 = document.getElementById("user2").value.trim();

    if (!user1 || !user2) {
        error.textContent = "Please enter both usernames";
        return;
    }

    battleUsers(user1, user2);
});

// ===============================
// USER PROFILE SECTION
// ===============================

async function getUser(username) {
    try {
        error.textContent = "";
        loading.innerHTML = `
         <div class="spinner"></div>
        `;

        profileContainer.innerHTML = "";
        repoContainer.innerHTML = "";
        battleContainer.innerHTML = "";

        const response = await fetch(
            `https://api.github.com/users/${username}`
        );

        if (!response.ok) {
            throw new Error("User Not Found");
        }

        const user = await response.json();

        renderProfile(user);

        const repoResponse = await fetch(user.repos_url);
        const repos = await repoResponse.json();

        console.log("USER DATA:", user);
        console.log("REPOS:", repos);

        renderRepos(repos);

        loading.innerHTML = "";

    } catch (err) {
        loading.innerHTML = "";
        error.innerHTML = `
        <div class="error-card">
          ❌ ${err.message}
          </div>
        `;
    }
}

// ===============================
// DATE FORMATTER
// ===============================

function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// ===============================
// PROFILE CARD
// ===============================

function renderProfile(user) {
    profileContainer.innerHTML = `
        <div class="profile-card">

            <img
                src="${user.avatar_url}"
                alt="${user.login}"
                width="150"
            >

            <h2>${user.name || user.login}</h2>

            <p>${user.bio || "No Bio Available"}</p>


            <p>Public Repos: ${user.public_repos}</p>

            <p>
                Joined:
                ${formatDate(user.created_at)}
            </p>

            ${user.blog ? `
              <a href="${user.blog}" target="_blank">
                Portfolio
              </a>
          ` : ""}

        </div>
    `;
}

// ===============================
// REPOSITORIES
// ===============================

function renderRepos(repos) {

    const latestRepos = repos
        .sort(
            (a, b) =>
                new Date(b.created_at) -
                new Date(a.created_at)
        )
        .slice(0, 5);

    let html = `
        <div class="repo-section">
            <h3>Latest Repositories</h3>
            <ul>
    `;

    latestRepos.forEach(repo => {
        html += `
            <li>
                <a
                    href="${repo.html_url}"
                    target="_blank"
                >
                    ${repo.name}
                </a>
            </li>
        `;
    });

    html += `
            </ul>
        </div>
    `;

    repoContainer.innerHTML = html;
}

// ===============================
// BATTLE MODE
// ===============================

async function battleUsers(username1, username2) {

    try {

        error.textContent = "";
        loading.innerHTML = `
         <div class="spinner"></div>
        `;

        battleContainer.innerHTML = "";

        const [user1Response, user2Response] =
            await Promise.all([
                fetch(
                    `https://api.github.com/users/${username1}`
                ),
                fetch(
                    `https://api.github.com/users/${username2}`
                )
            ]);

        if (
            !user1Response.ok ||
            !user2Response.ok
        ) {
            throw new Error(
                "One or both users not found"
            );
        }

        const [user1, user2] =
            await Promise.all([
                user1Response.json(),
                user2Response.json()
            ]);

        const [repos1Response, repos2Response] =
            await Promise.all([
                fetch(user1.repos_url),
                fetch(user2.repos_url)
            ]);

        const [repos1, repos2] =
            await Promise.all([
                repos1Response.json(),
                repos2Response.json()
            ]);

        const stars1 = calculateStars(repos1);
        const stars2 = calculateStars(repos2);

        renderBattle(
            user1,
            stars1,
            user2,
            stars2
        );

        loading.textContent = "";

    } catch (err) {
        loading.textContent = "";
        error.textContent = err.message;
    }
}

// ===============================
// STAR COUNT
// ===============================

function calculateStars(repos) {

    return repos.reduce(
        (total, repo) =>
            total + repo.stargazers_count,
        0
    );
}

// ===============================
// BATTLE RESULT
// ===============================

function renderBattle(
    user1,
    stars1,
    user2,
    stars2
) {

    const winner =
        stars1 >= stars2
            ? user1.login
            : user2.login;

    battleContainer.innerHTML = `
    
        <div class="battle-wrapper">

            <div class="
                battle-card
                ${
                    winner === user1.login
                    ? "winner"
                    : "loser"
                }
            ">
                <img
                    src="${user1.avatar_url}"
                    width="120"
                >

                <h3>${user1.login}</h3>

                <p>
                    Total Stars:
                    ${stars1}
                </p>

                <h4>
                    ${
                        winner === user1.login
                        ? "🏆 Winner"
                        : "❌ Loser"
                    }
                </h4>
            </div>

            <div class="
                battle-card
                ${
                    winner === user2.login
                    ? "winner"
                    : "loser"
                }
            ">
                <img
                    src="${user2.avatar_url}"
                    width="120"
                >

                <h3>${user2.login}</h3>

                <p>
                    Total Stars:
                    ${stars2}
                </p>

                <h4>
                    ${
                        winner === user2.login
                        ? "🏆 Winner"
                        : "❌ Loser"
                    }
                </h4>
            </div>

        </div>
    `;
}