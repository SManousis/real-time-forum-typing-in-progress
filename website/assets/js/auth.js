import { resetHomeLoaded, showPage } from "./navigation.js";
import { showAlert, resetGlobalState } from "./utils.js"
import { audio } from "./audio.js";
import { loadUser } from "./user.js";
import { currentWebSocket, clearCurrentWebSocket } from "./websocket.js";
import { globalState, serverAddr, initAudio } from "./script.js";
import { fetchJwt } from "./jwt_fetch.js";

export async function handleSignin(e) {
    e.preventDefault(); 
    initAudio();

    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
        const response = await fetch(`${serverAddr}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data),
        });

        
        if (!response.ok) {
            clearPasswords(form);

            let message = "Login failed";
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    message = errorData.error; 
                }
            } catch {
                message = "Login failed"; 
            }

            throw new Error(message);
        }

        
        const result = await response.json();
        if (!result.user) {
            clearPasswords(form);
            throw new Error("Invalid server response");
        }

        globalState.user = result.user;
        loadUser(result.user);

        
        document.getElementById("signin-page").style.display = "none";
        document.getElementById("app-container").style.display = "block";
        showPage("home");
        showAlert(`Welcome back ${result.user.username}!`, "DmAlert");

    } catch (err) {
        clearPasswords(form);
        console.error("Login error:", err);
        alert(err.message); 
    }
}




function clearPasswords(form) {
    const passwordFields = form.querySelectorAll('input[type="password"]');
    passwordFields.forEach(field => field.value = "");
    if (passwordFields.length > 0) {
        passwordFields[0].focus();
    }
}

export async function handleRegistration(e) {
    e.preventDefault(); 
    
    initAudio();

    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
        const response = await fetch(`${serverAddr}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data),
        });

        
        
        if (!response.ok) {
            clearPasswords(form);

            let message = "Registration failed";
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    message = errorData.error; 
                    
                }
            } catch {
                message = "Registration failed"; 
                
            }

            throw new Error(message);
        }

        
        
        const result = await response.json();
        if (!result.user) {
            clearPasswords(form);
            throw new Error("Invalid server response");
        }

        globalState.user = result.user;
        loadUser(result.user);
    
         showAlert(`Welcome to our community ${result.user.username}!`);
        
         
        document.getElementById("registration-page").style.display = "none";
        document.getElementById("app-container").style.display = "block";
        resetHomeLoaded();
        showPage("home");
       

    } catch (err) {
        clearPasswords(form);
        console.error("Registration error:", err);
        alert(err.message); 
        
    }
}

       

export async function logout() {
    if (confirm("Are you sure you want to logout?")) {
        fetchJwt("/logout", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        showAlert("See you later", undefined, 1000)

        // WEBSOCKET: Close
        if (currentWebSocket != undefined) {
            currentWebSocket.close(); // Close the WebSocket connection
            clearCurrentWebSocket();
            console.log("WebSocket closed on logout.");
        }

        await fetchJwt("/logout");

        //reset globalState
        resetGlobalState();
    }
}

function validateRegistrationData(data, form) {
    let isValid = true;

    clearErrors(form);

    const usernameInput = form.querySelector("[name='username']");
    if (!data.username || data.username.trim().length < 3) {
        showErrorInPlaceholder(usernameInput, "Min 3 chars");
        isValid = false;
    }

    const emailInput = form.querySelector("[name='email']");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        showErrorInPlaceholder(emailInput, "Invalid email");
        isValid = false;
    }

    const passwordInput = form.querySelector("[name='password']");
    if (!data.password || data.password.length < 8) {
        showErrorInPlaceholder(passwordInput, "Min 8 chars");
        isValid = false;
    }

    const confirmPasswordInput = form.querySelector("[name='confirm_password']");
    if (data.password !== data.confirm_password) {
        showErrorInPlaceholder(confirmPasswordInput, "Does not match");
        isValid = false;
    }

    return isValid;
}

function showErrorInPlaceholder(input, message) {
    input.classList.add("error");

    if (!input.dataset.oldPlaceholder) {
        input.dataset.oldPlaceholder = input.placeholder;
    }

    input.value = "";
    input.placeholder = message;
}

export function clearErrors(form) {
    form.querySelectorAll("input, select").forEach(el => {
        el.classList.remove("error");
        if (el.dataset.oldPlaceholder) {
            el.placeholder = el.dataset.oldPlaceholder;
            delete el.dataset.oldPlaceholder;
        }
    });
}