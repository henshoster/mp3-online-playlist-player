"use strict";
//Capitalize First Letter of string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
//Checks for string extension
//@typeOfExt must be string: 'img' or 'mp3'
function checkUrlExtension(url, typeOfExt) {
    var arr = typeOfExt == "img" ? ["jpeg", "jpg", "gif", "png"] : ["mp3"];
    var ext = url.indexOf(".") != -1 ? url.substring(url.lastIndexOf(".") + 1) : "";
    if ($.inArray(ext, arr) == -1) {
        return false;
    }
    else {
        return true;
    }
}
//# sourceMappingURL=assistance_functions.js.map