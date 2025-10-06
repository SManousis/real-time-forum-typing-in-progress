import { globalState } from "./script.js"
import { fetchJwt } from "./jwt_fetch.js"
import { showAlert } from "./utils.js"

export async function loadUser() {
  if (Object.keys(globalState.user).length === 0) {
    try {
      const res = await fetchJwt(
        `/user`,
        { method: "GET" }
      )
      const data = await res.json();
      globalState.user = data;
    } catch (err) {
      // showAlert("failed to fetch user information", undefined, 3000, 'red')
      throw err;
    }
  }

  renderUserHeader();
}

function renderUserHeader(user) {
  const avatarEl = document.querySelector(".user-profile .avatar");
  const usernameEl = document.querySelector(".user-profile span");
  if (avatarEl) avatarEl.textContent = globalState.user.avatar;
  if (usernameEl) usernameEl.textContent = globalState.user.username;
}



