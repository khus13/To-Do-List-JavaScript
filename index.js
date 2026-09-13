const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "signin.html";
}

$("#logout-btn").click(function () {
    localStorage.removeItem("currentUser");
    window.location.href = "signin.html";
});

function renderTask(task) {
    const row = $(`
        <tr data-id="${task.item_id}" class="${task.status === 'inactive' ? 'done' : ''}">
            <td class="task-name">${task.item_name}</td>
            <td class="task-desc">${task.item_description}</td>
            <td class="task-actions">
                <button class="status-btn">${task.status === 'active' ? 'Mark Done' : 'Mark Active'}</button>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        </tr>
    `);
    row.data("task", task);
    $("#task-list").append(row);
}

async function loadTasks() {
    $("#task-list").empty();
    try {
        const activeResult = await apiCall("/getItems_action.php", "GET", { status: "active", user_id: currentUser.id });
        const inactiveResult = await apiCall("/getItems_action.php", "GET", { status: "inactive", user_id: currentUser.id });

        if (Number(activeResult.status) === 200) {
            Object.values(activeResult.data).forEach(renderTask);
        }
        if (Number(inactiveResult.status) === 200) {
            Object.values(inactiveResult.data).forEach(renderTask);
        }
    } catch (err) {
        console.error("STATUS:", err.status, "RESPONSE:", err.responseText);
    }
}

$("#add-task-form").submit(async function (e) {
    e.preventDefault();

    const name = $("#task-name").val();
    const description = $("#task-description").val();
    const errorMsg = $("#addErrorMsg");

    try {
        const result = await apiCall("/addItem_action.php", "POST", {
            item_name: name,
            item_description: description,
            user_id: currentUser.id
        });

        if (Number(result.status) === 200) {
            renderTask(result.data);
            $("#add-task-form")[0].reset();
        } else {
            errorMsg.text(result.message);
        }
    } catch (err) {
        console.error("STATUS:", err.status, "RESPONSE:", err.responseText);
        errorMsg.text("Something went wrong. Please try again.");
    }
});

$("#task-list").on("click", ".delete-btn", async function () {
    const li = $(this).closest("tr");
    const itemId = li.data("id");

    try {
        const result = await apiCall("/deleteItem_action.php", "POST", { item_id: itemId }, true);

        if (Number(result.status) === 200) {
            li.remove();
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
    }
});

$("#task-list").on("click", ".status-btn", async function () {
    const li = $(this).closest("tr");
    const itemId = li.data("id");
    const task = li.data("task");
    const newStatus = task.status === "active" ? "inactive" : "active";

    try {
        // Changed from "PUT" to "POST" -- the server's CORS policy blocks PUT
        // at the preflight stage, so PUT never reaches the server from a browser.
        const result = await apiCall("/statusItem_action.php", "POST", {
            item_id: itemId,
            status: newStatus
        });

        if (Number(result.status) === 200) {
            task.status = newStatus;
            li.data("task", task);
            li.toggleClass("done");
            $(this).text(newStatus === "active" ? "Mark Done" : "Mark Active");
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
    }
});

$("#task-list").on("click", ".edit-btn", function () {
    const li = $(this).closest("tr");
    const task = li.data("task");

    $("#edit-item-id").val(task.item_id);
    $("#edit-task-name").val(task.item_name);
    $("#edit-task-description").val(task.item_description);
    $("#edit-modal").show();
});

$("#cancel-edit-btn").click(function () {
    $("#edit-modal").hide();
});

$("#edit-task-form").submit(async function (e) {
    e.preventDefault();

    const itemId = $("#edit-item-id").val();
    const newName = $("#edit-task-name").val();
    const newDescription = $("#edit-task-description").val();

    try {
        const result = await apiCall("/editItem_action.php", "POST", {
            item_id: itemId,
            item_name: newName,
            item_description: newDescription
        });

        if (Number(result.status) === 200) {
            const li = $(`tr[data-id="${itemId}"]`);
            li.find(".task-name").text(newName);
            li.find(".task-desc").text(newDescription);

            const task = li.data("task");
            task.item_name = newName;
            task.item_description = newDescription;
            li.data("task", task);

            $("#edit-modal").hide();
        } else {
            alert(result.message);
        }
    } catch (err) {
    console.error("STATUS:", err.status, "RESPONSE:", err.responseText);
    alert("Something went wrong. Please try again.");
    }
});

loadTasks();