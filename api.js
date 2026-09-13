const API_ROOT = "https://todo-list.dcism.org";

function apiCall(path, method, data, sendAsQuery) {
    const asQuery = sendAsQuery !== undefined ? sendAsQuery : (method === "GET" || method === "DELETE");

    if (asQuery) {
        const query = data ? "?" + $.param(data) : "";

        return $.ajax({
            type: method,
            url: API_ROOT + path + query,
            dataType: "json"
        });
    }

        return $.ajax({
            type: method,
            url: API_ROOT + path,
            data: JSON.stringify(data),
            dataType: "json"
        });
}