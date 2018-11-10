"use strict";
var searchField = $("#searchField");
var tooltip = new Tooltip(searchField, "Please enter at least<br><u><b>2</b> Characters</u>");
var allPlaylists = [];
Playlist.getAllPlaylists(allPlaylists);
console.log(allPlaylists);
var player = Player.getInstance();
//filter playlists by search
function search(e) {
    var inputValue = e.target.value;
    var filteredArr = allPlaylists.filter(function (album) { return album.name.indexOf(inputValue) != -1; });
    var allPlContainter = $("#albums_list");
    if (inputValue.length > 1) {
        if (filteredArr.length != 0) {
            tooltip.dispose();
            allPlContainter.children().remove();
            filteredArr.sort(function (a, b) {
                return a.name.indexOf(inputValue) - b.name.indexOf(inputValue);
            });
            filteredArr.forEach(function (album) {
                album.drawPlaylist();
            });
        }
        else {
            allPlContainter.children().remove();
            tooltip.editTitle("<u><b>Not Found 404!</b></u>");
        }
    }
    else if (allPlContainter.children().length < allPlaylists.length &&
        inputValue.length < 1) {
        tooltip.editTitle("Please enter at least<br><u><b>2</b> Characters</u>");
        allPlContainter.children().remove();
        allPlaylists.forEach(function (album) {
            album.drawPlaylist();
        });
    }
    else {
        tooltip.editTitle("Please enter at least<br><u><b>2</b> Characters</u>");
    }
}
function returnPlById(id) {
    var temp = allPlaylists.filter(function (album) { return album.id.indexOf(id) != -1; });
    return temp[0];
}
// build and loads player --- player is singletone
function loadPlayer(id) {
    var waitingForDataToUpdate = $.Deferred();
    // const playlistToPlay = allPlaylists[Number(id)];
    var playlistToPlay = returnPlById(id);
    if (playlistToPlay.songs[0]) {
        waitingForDataToUpdate.resolve();
    }
    else {
        playlistToPlay.getSongs(waitingForDataToUpdate);
    }
    $.when(waitingForDataToUpdate).done(function () {
        player.id = id;
        player.image = playlistToPlay.image;
        player.name = playlistToPlay.name;
        player.songs = playlistToPlay.songs;
        player.buildPlayer();
        player.pause();
        $("#playerContainer").removeClass("displayNone");
        $("#albums_list").addClass("moreMargin");
        player.play();
    });
}
//loads step one modal
function loadStepOneModal(id) {
    if (player.id == id) {
        player.pause();
    }
    $("#step_one_modal .modal-footer button:nth-child(2)").trigger("click");
    var loadSteoTwoBtn = $("#loadStepTwoModalBtn");
    var stepOneModalTitle = $("#stepOneModalTitle");
    var stepTwoModalTitle = $("#stepTwoModalTitle");
    var finishAndSaveBtn = $("#finishAndSaveBtn");
    var playListToLoad = returnPlById(id);
    if (id != "0") {
        $("#playlist_name").val(playListToLoad.name);
        $("#playlist_url").val(playListToLoad.image);
        $("#step_one_modal_img").attr("src", playListToLoad.image);
        stepOneModalTitle.html("Edit Playlist");
        loadSteoTwoBtn.html("Update&Next");
        finishAndSaveBtn.html("Update&Save");
        stepTwoModalTitle.html("Edit Playlist Songs");
    }
    else {
        stepOneModalTitle.html("Add New Playlist");
        loadSteoTwoBtn.html("Next");
        finishAndSaveBtn.html("Finish&Save");
        stepTwoModalTitle.html("Add Playlist Songs");
    }
    loadSteoTwoBtn.attr("onclick", "loadStepTwoModal(event," + id + ")");
    finishAndSaveBtn.attr("onclick", "validateModalStepTwo(event," + id + ")");
    $("#step_one_modal").modal("show");
}
// before load step two modal validate if inputs are not empty
function loadStepTwoModal(e, id) {
    var playlistName = $(e.toElement)
        .parents(".modal-content")
        .find("#playlist_name");
    var playlistUrl = $(e.toElement)
        .parents(".modal-content")
        .find("#playlist_url");
    if (playlistName.val() == "") {
        playlistName.focus();
    }
    else if (!checkUrlExtension(String(playlistUrl.val()), "img")) {
        playlistUrl.focus();
    }
    else {
        var waitingForDataToUpdate = $.Deferred();
        if (id != "0") {
            var plToUpdate = returnPlById(id);
            plToUpdate.name = String(playlistName.val());
            plToUpdate.image = String(playlistUrl.val());
            plToUpdate.updatePlaylist();
            plToUpdate.getSongs(waitingForDataToUpdate);
            if (player.id == id) {
                player.image = plToUpdate.image;
                player.name = plToUpdate.name;
                player.buildPlayer();
            }
        }
        else {
            waitingForDataToUpdate.resolve();
        }
        $.when(waitingForDataToUpdate).done(function () {
            if (id != "0") {
                var songRows = $("#step_two_modal .row");
                songRows.remove();
                var thisPlSongs = returnPlById(id).songs;
                for (var i = 0; i < (thisPlSongs.length > 3 ? thisPlSongs.length : 3); i++) {
                    var name_1 = thisPlSongs[i] ? thisPlSongs[i].name : "";
                    var url = thisPlSongs[i] ? thisPlSongs[i].url : "";
                    addAnotherSong(name_1, url);
                }
            }
            $("#step_one_modal").modal("hide");
            $("#step_two_modal").modal("show");
        });
    }
}
// changes image preview on step one modal
// @this = #playlist_url input
$("#playlist_url").on("input", function () {
    var playlistUrl = String($(this).val());
    var imgPreviewSrc = $(this)
        .parents(".modal-body")
        .find("img");
    if (checkUrlExtension(playlistUrl, "img")) {
        $(this).removeClass("inputRedWarning");
        imgPreviewSrc.attr("src", playlistUrl);
    }
    else {
        $(this).addClass("inputRedWarning");
        imgPreviewSrc.attr("src", "images/preview.jpg");
    }
});
//step one modal reset fields btn (also reset step 2 fields)
function resetFields(e) {
    var playlistName = $(e.target)
        .parents(".modal-content")
        .find("#playlist_name");
    var playlistUrl = $(e.target)
        .parents(".modal-content")
        .find("#playlist_url");
    var imgPreviewSrc = $(e.target)
        .parents(".modal-content")
        .find("img");
    var stepTwoModal = $("#modals_container")
        .find("#step_two_modal")
        .find(".modal-body");
    var songRows = stepTwoModal.find(".row");
    songRows.remove();
    for (var numOfRowsSoFar = 0; numOfRowsSoFar < 3; numOfRowsSoFar++) {
        var newRowTemplate = "\n  <div class=\"form-group row my-1\">\n    <label for=\"song_url_" + numOfRowsSoFar + "\" class=\"col-sm-2 col-form-label col-form-label-sm\">SongURL</label>\n    <div class=\"col-sm-5\">\n      <input type=\"text\" class=\"form-control form-control-sm\" id=\"song_url_" + numOfRowsSoFar + "\" oninput=\"validateExt(event)\">\n    </div>\n    <label for=\"song_name_" + numOfRowsSoFar + "\" class=\"col-sm-1 col-form-label col-form-label-sm\">Name</label>\n    <div class=\"col-sm-4\">\n      <input type=\"text\" class=\"form-control form-control-sm\" id=\"song_name_" + numOfRowsSoFar + "\">\n    </div>\n  </div>\n";
        stepTwoModal.append(newRowTemplate);
    }
    playlistName.val("");
    playlistUrl.val("");
    playlistUrl.removeClass("inputRedWarning");
    imgPreviewSrc.attr("src", "images/preview.jpg");
}
//step two modal - > adds new row (to be able to add more songs)
function addAnotherSong(name, url) {
    if (name === void 0) { name = ""; }
    if (url === void 0) { url = ""; }
    var modalBody = $("#step_two_modal .modal-body");
    var numOfRowsSoFar = modalBody.children().length;
    var newRowTemplate = "\n  <div class=\"form-group row my-1\">\n    <label for=\"song_url_" + numOfRowsSoFar + "\" class=\"col-sm-2 col-form-label col-form-label-sm\">SongURL</label>\n    <div class=\"col-sm-5\">\n      <input value=\"" + url + "\" type=\"text\" class=\"form-control form-control-sm\" id=\"song_url_" + numOfRowsSoFar + "\" oninput=\"validateExt(event)\">\n    </div>\n    <label for=\"song_name_" + numOfRowsSoFar + "\" class=\"col-sm-1 col-form-label col-form-label-sm\">Name</label>\n    <div class=\"col-sm-4\">\n      <input value=\"" + name + "\" type=\"text\" class=\"form-control form-control-sm\" id=\"song_name_" + numOfRowsSoFar + "\">\n    </div>\n  </div>\n";
    modalBody.append(newRowTemplate);
}
//validate mp3 ext on songsURL
// e is declared as any because typescript does not have inputEvent -- > will be fixed latter
function validateExt(e) {
    var thisSongInput = e.target;
    var thisSongInputVal = String($(thisSongInput).val());
    if (checkUrlExtension(thisSongInputVal, "mp3") || thisSongInputVal == "") {
        $(thisSongInput).removeClass("inputRedWarning");
    }
    else {
        $(thisSongInput).addClass("inputRedWarning");
    }
}
//validate modal step two to make sure each row was inserted as needed.
function validateModalStepTwo(e, id) {
    var isValid = true;
    var isThereIsAtLeastOneRow = false;
    var inputs = $(e.toElement)
        .parents("#step_two_modal")
        .find("input");
    for (var i = 0; i < inputs.length - 1; i = i + 2) {
        var songUrlInput = $(inputs[i]);
        var nameInput = $(inputs[i + 1]);
        var songUrlVal = String(songUrlInput.val());
        var nameVal = String(nameInput.val());
        if (songUrlVal != "" || nameVal != "") {
            isThereIsAtLeastOneRow = true;
        }
        if (songUrlVal != "" && !checkUrlExtension(songUrlVal, "mp3")) {
            songUrlInput.focus();
            isValid = false;
            break;
        }
        else if (songUrlVal == "" && nameVal != "") {
            songUrlInput.addClass("inputRedWarning");
            songUrlInput.focus();
            isValid = false;
            break;
        }
        else if (songUrlVal != "" && nameVal == "") {
            nameInput.addClass("inputRedWarning");
            nameInput.on("input", function () {
                $(this).removeClass("inputRedWarning");
            });
            nameInput.focus();
            isValid = false;
            break;
        }
    }
    if (isValid && isThereIsAtLeastOneRow) {
        $("#step_two_modal").modal("hide");
        createNewPlaylistOrUpdateExistingPlaylist(id);
        $("#step_one_modal .modal-footer button:nth-child(2)").trigger("click");
    }
    else if (!isThereIsAtLeastOneRow) {
        $(inputs[0]).focus();
    }
}
function createNewPlaylistOrUpdateExistingPlaylist(id) {
    var name = String($("#playlist_name").val());
    var image = String($("#playlist_url").val());
    var rowsOfSongs = $("#step_two_modal .row");
    var songs = [];
    rowsOfSongs.each(function () {
        var inputs = $(this).find("input");
        if ($(inputs[0]).val() != "") {
            songs.push({
                name: String($(inputs[1]).val()),
                url: String($(inputs[0]).val())
            });
        }
    });
    if (id != "0") {
        var plToUpdate = returnPlById(id);
        plToUpdate.songs = songs;
        plToUpdate.updateSongs();
        if (player.id == id) {
            player.songs = plToUpdate.songs;
            player.buildPlayer();
        }
    }
    else {
        var newPlaylist = new Playlist(id, name, image, songs);
        Playlist.createNewPlaylist(newPlaylist, allPlaylists);
    }
}
function deletePlaylist(event, id) {
    var deleteModal = $("#delete_modal");
    deleteModal
        .find("#deleteBtn")
        .attr("onclick", "Playlist.deletePlaylist(event," + id + ")");
    var plId = deleteModal.find("#playlist_id_for_modal_body");
    plId.html(returnPlById(id).name);
    deleteModal.modal("show");
}
//# sourceMappingURL=main_page.js.map