const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const signupFeedback = document.getElementById("signupFeedback");
const loginFeedback = document.getElementById("loginFeedback");
const logoutButton = document.getElementById("logoutButton");
const usersGrid = document.getElementById("usersGrid");
const usersEmpty = document.getElementById("usersEmpty");
const plotsGrid = document.getElementById("plotsGrid");
const plotsEmpty = document.getElementById("plotsEmpty");
const userCount = document.getElementById("userCount");
const pulseFill = document.getElementById("pulseFill");
const panelNote = document.getElementById("panelNote");
const lastAction = document.getElementById("lastAction");
const currentUser = document.getElementById("currentUser");
const plotCount = document.getElementById("plotCount");
const refreshUsersButton = document.getElementById("refreshUsers");
const refreshPlotsButton = document.getElementById("refreshPlots");
const plotSearchInput = document.getElementById("plotSearch");
const plotFilterStatus = document.getElementById("plotFilterStatus");
const clearPlotFiltersButton = document.getElementById("clearPlotFilters");
const tabButtons = document.querySelectorAll(".tab-button");
const formPanels = document.querySelectorAll(".form-panel");
const plotForm = document.getElementById("plotForm");
const plotFeedback = document.getElementById("plotFeedback");
const plotFormTitle = document.getElementById("plotFormTitle");
const plotSubmitButton = document.getElementById("plotSubmitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const editingPlotIdInput = document.getElementById("editingPlotId");

const state = {
    currentUser: null,
    token: localStorage.getItem("smartplot_token"),
    totalUsers: 0,
    totalPlots: 0,
    plotSearch: "",
    plotStatus: "ALL"
};

tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const activeTab = button.dataset.tab;

        tabButtons.forEach((tab) => {
            tab.classList.toggle("active", tab === button);
        });

        formPanels.forEach((panel) => {
            panel.classList.toggle("active", panel.id === `${activeTab}Form`);
        });

        clearFeedback();
    });
});

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFeedback(signupFeedback, "Creating account...", "");

    const payload = {
        name: document.getElementById("signupName").value.trim(),
        email: document.getElementById("signupEmail").value.trim(),
        password: document.getElementById("signupPassword").value,
        phone: document.getElementById("signupPhone").value.trim()
    };

    try {
        const response = await request("/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        signupForm.reset();
        handleAuthSuccess(response);
        lastAction.textContent = `Signed up ${response.user.name}`;
        setFeedback(signupFeedback, "Account created successfully.", "success");
        await loadProtectedData();
    } catch (error) {
        setFeedback(signupFeedback, error.message, "error");
        lastAction.textContent = "Signup failed";
    }
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFeedback(loginFeedback, "Checking credentials...", "");

    const payload = {
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value
    };

    try {
        const response = await request("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        loginForm.reset();
        handleAuthSuccess(response);
        lastAction.textContent = response.message;
        setFeedback(loginFeedback, `${response.message}. Welcome back, ${response.user.name}.`, "success");
        await loadProtectedData();
    } catch (error) {
        setFeedback(loginFeedback, error.message, "error");
        lastAction.textContent = "Login failed";
    }
});

refreshUsersButton.addEventListener("click", async () => {
    lastAction.textContent = "Refreshing users";
    await loadUsers();
});

refreshPlotsButton.addEventListener("click", async () => {
    lastAction.textContent = "Refreshing plots";
    await loadPlots();
});

logoutButton.addEventListener("click", () => {
    state.token = null;
    state.currentUser = null;
    localStorage.removeItem("smartplot_token");
    localStorage.removeItem("smartplot_user");
    currentUser.textContent = "None";
    logoutButton.classList.add("hidden");
    lastAction.textContent = "Logged out";
    resetProtectedViews("Log in to view users and plots.");
});

plotSearchInput.addEventListener("input", async (event) => {
    state.plotSearch = event.target.value.trim();
    await loadPlots();
});

plotFilterStatus.addEventListener("change", async (event) => {
    state.plotStatus = event.target.value;
    await loadPlots();
});

clearPlotFiltersButton.addEventListener("click", async () => {
    state.plotSearch = "";
    state.plotStatus = "ALL";
    plotSearchInput.value = "";
    plotFilterStatus.value = "ALL";
    await loadPlots();
});

cancelEditButton.addEventListener("click", () => {
    resetPlotForm();
});

plotForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const editingPlotId = editingPlotIdInput.value;
    const isEditing = Boolean(editingPlotId);
    setFeedback(plotFeedback, isEditing ? "Updating plot..." : "Creating plot...", "");

    const payload = {
        plotNumber: document.getElementById("plotNumber").value.trim(),
        ownerName: document.getElementById("ownerName").value.trim(),
        location: document.getElementById("plotLocation").value.trim(),
        areaSqft: Number(document.getElementById("areaSqft").value),
        price: Number(document.getElementById("plotPrice").value),
        status: document.getElementById("plotStatus").value
    };

    try {
        const plot = await request(isEditing ? `/plots/${editingPlotId}` : "/plots", {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        lastAction.textContent = isEditing
            ? `Updated plot ${plot.plotNumber}`
            : `Created plot ${plot.plotNumber}`;
        setFeedback(
            plotFeedback,
            isEditing ? "Plot updated successfully." : "Plot created successfully.",
            "success"
        );
        resetPlotForm();
        await loadPlots();
    } catch (error) {
        setFeedback(plotFeedback, error.message, "error");
        lastAction.textContent = isEditing ? "Plot update failed" : "Plot creation failed";
    }
});

async function loadUsers() {
    if (!state.token) {
        state.totalUsers = 0;
        usersGrid.innerHTML = "";
        usersEmpty.hidden = false;
        usersEmpty.querySelector("h3").textContent = "Login required";
        usersEmpty.querySelector("p").textContent = "Sign in to view user records.";
        updatePortalPulse();
        return;
    }

    try {
        const users = await request("/users");
        state.totalUsers = users.length;
        renderUsers(users);
        updatePortalPulse();
        if (!state.currentUser && users.length > 0) {
            currentUser.textContent = users[users.length - 1].name;
        }
    } catch (error) {
        usersGrid.innerHTML = "";
        usersEmpty.hidden = false;
        usersEmpty.querySelector("h3").textContent = "Could not load users";
        usersEmpty.querySelector("p").textContent = error.message;
        state.totalUsers = 0;
        updatePortalPulse();
    }
}

async function loadPlots() {
    if (!state.token) {
        state.totalPlots = 0;
        plotsGrid.innerHTML = "";
        plotsEmpty.hidden = false;
        plotsEmpty.querySelector("h3").textContent = "Login required";
        plotsEmpty.querySelector("p").textContent = "Sign in to manage plot inventory.";
        updatePortalPulse();
        return;
    }

    try {
        const params = new URLSearchParams();
        if (state.plotSearch) {
            params.set("search", state.plotSearch);
        }
        if (state.plotStatus && state.plotStatus !== "ALL") {
            params.set("status", state.plotStatus);
        }

        const query = params.toString();
        const plots = await request(query ? `/plots?${query}` : "/plots");
        state.totalPlots = plots.length;
        renderPlots(plots);
        updatePortalPulse();
    } catch (error) {
        plotsGrid.innerHTML = "";
        plotsEmpty.hidden = false;
        plotsEmpty.querySelector("h3").textContent = "Could not load plots";
        plotsEmpty.querySelector("p").textContent = error.message;
        state.totalPlots = 0;
        updatePortalPulse();
    }
}

function renderUsers(users) {
    usersGrid.innerHTML = "";
    usersEmpty.hidden = users.length > 0;

    users.forEach((user, index) => {
        const card = document.createElement("article");
        card.className = "user-card";
        card.style.animationDelay = `${index * 70}ms`;
        card.innerHTML = `
            <h3>${escapeHtml(user.name)}</h3>
            <div class="user-meta">
                <span>${escapeHtml(user.email)}</span>
                <span>${escapeHtml(user.phone)}</span>
            </div>
            <span class="user-id">User ID ${user.userId}</span>
        `;
        usersGrid.appendChild(card);
    });
}

function renderPlots(plots) {
    plotsGrid.innerHTML = "";
    plotsEmpty.hidden = plots.length > 0;
    plotCount.textContent = String(plots.length);

    plots.forEach((plot, index) => {
        const card = document.createElement("article");
        card.className = "plot-card";
        card.style.animationDelay = `${index * 70}ms`;
        const statusClass = plot.status.toLowerCase();
        card.innerHTML = `
            <div class="plot-topline">
                <h3>${escapeHtml(plot.plotNumber)}</h3>
                <span class="plot-status ${statusClass}">${escapeHtml(plot.status)}</span>
            </div>
            <div class="plot-meta">
                <span><strong>Owner:</strong> ${escapeHtml(plot.ownerName)}</span>
                <span><strong>Location:</strong> ${escapeHtml(plot.location)}</span>
                <span><strong>Area:</strong> ${escapeHtml(plot.areaSqft)} sqft</span>
            </div>
            <div class="plot-price">${formatCurrency(plot.price)}</div>
            <div class="plot-actions">
                <button class="card-action edit" type="button" data-action="edit">Edit</button>
                <button class="card-action delete" type="button" data-action="delete">Delete</button>
            </div>
        `;

        card.querySelector('[data-action="edit"]').addEventListener("click", () => {
            startEditingPlot(plot);
        });

        card.querySelector('[data-action="delete"]').addEventListener("click", async () => {
            await deletePlot(plot);
        });

        plotsGrid.appendChild(card);
    });
}

function startEditingPlot(plot) {
    editingPlotIdInput.value = plot.plotId;
    document.getElementById("plotNumber").value = plot.plotNumber;
    document.getElementById("ownerName").value = plot.ownerName;
    document.getElementById("plotLocation").value = plot.location;
    document.getElementById("areaSqft").value = plot.areaSqft;
    document.getElementById("plotPrice").value = plot.price;
    document.getElementById("plotStatus").value = plot.status;

    plotFormTitle.textContent = `Editing ${plot.plotNumber}`;
    plotSubmitButton.textContent = "Save Changes";
    cancelEditButton.classList.remove("hidden");
    setFeedback(plotFeedback, `Editing plot ${plot.plotNumber}.`, "");
    plotForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function deletePlot(plot) {
    const confirmed = window.confirm(`Delete plot ${plot.plotNumber}? This cannot be undone.`);
    if (!confirmed) {
        return;
    }

    try {
        await request(`/plots/${plot.plotId}`, {
            method: "DELETE"
        });
        lastAction.textContent = `Deleted plot ${plot.plotNumber}`;
        if (editingPlotIdInput.value === String(plot.plotId)) {
            resetPlotForm();
        }
        await loadPlots();
    } catch (error) {
        setFeedback(plotFeedback, error.message, "error");
        lastAction.textContent = "Plot delete failed";
    }
}

async function request(url, options = {}) {
    const headers = new Headers(options.headers || {});
    if (state.token) {
        headers.set("Authorization", `Bearer ${state.token}`);
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (!response.ok) {
        let message = "Something went wrong.";

        try {
            const errorBody = await response.json();
            message = formatError(errorBody);
        } catch (error) {
            message = `Request failed with status ${response.status}.`;
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function formatError(errorBody) {
    if (errorBody.message) {
        return errorBody.message;
    }

    const messages = Object.values(errorBody);
    return messages.length > 0 ? messages[0] : "Something went wrong.";
}

function setFeedback(element, message, type) {
    element.textContent = message;
    element.className = "feedback";

    if (type) {
        element.classList.add(type);
    }
}

function clearFeedback() {
    setFeedback(signupFeedback, "", "");
    setFeedback(loginFeedback, "", "");
}

function handleAuthSuccess(response) {
    state.token = response.token;
    state.currentUser = response.user;
    localStorage.setItem("smartplot_token", response.token);
    localStorage.setItem("smartplot_user", JSON.stringify(response.user));
    currentUser.textContent = response.user.name;
    logoutButton.classList.remove("hidden");
}

function resetProtectedViews(message) {
    state.totalUsers = 0;
    state.totalPlots = 0;
    usersGrid.innerHTML = "";
    plotsGrid.innerHTML = "";
    usersEmpty.hidden = false;
    plotsEmpty.hidden = false;
    usersEmpty.querySelector("h3").textContent = "Login required";
    usersEmpty.querySelector("p").textContent = message;
    plotsEmpty.querySelector("h3").textContent = "Login required";
    plotsEmpty.querySelector("p").textContent = message;
    updatePortalPulse();
}

async function loadProtectedData() {
    await loadUsers();
    await loadPlots();
}

function resetPlotForm() {
    plotForm.reset();
    document.getElementById("plotStatus").value = "AVAILABLE";
    editingPlotIdInput.value = "";
    plotFormTitle.textContent = "Create and track plots";
    plotSubmitButton.textContent = "Create Plot";
    cancelEditButton.classList.add("hidden");
    setFeedback(plotFeedback, "", "");
}

function updatePortalPulse() {
    const totalRecords = state.totalUsers + state.totalPlots;
    userCount.textContent = String(totalRecords);
    plotCount.textContent = String(state.totalPlots);
    const fill = Math.min(100, Math.max(8, totalRecords * 10));
    pulseFill.style.width = `${fill}%`;
    if (totalRecords === 0) {
        panelNote.textContent = "Waiting for database activity.";
        return;
    }

    panelNote.textContent = `${state.totalUsers} user${state.totalUsers === 1 ? "" : "s"} and ${state.totalPlots} plot${state.totalPlots === 1 ? "" : "s"} synced from MySQL.`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(value));
}

const storedUser = localStorage.getItem("smartplot_user");
if (storedUser) {
    try {
        state.currentUser = JSON.parse(storedUser);
        currentUser.textContent = state.currentUser.name;
        if (state.token) {
            logoutButton.classList.remove("hidden");
        }
    } catch (error) {
        localStorage.removeItem("smartplot_user");
    }
}

if (state.token) {
    loadProtectedData();
} else {
    resetProtectedViews("Sign in to view users and plots.");
}
