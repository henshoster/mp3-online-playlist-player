//Capitalize First Letter of string
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

//Checks for string extension
//@typeOfExt must be string: 'img' or 'mp3'
function checkUrlExtension(url: string, typeOfExt: string): boolean {
  const arr: string[] =
    typeOfExt == "img" ? ["jpeg", "jpg", "gif", "png"] : ["mp3"];
  const ext: string =
    url.indexOf(".") != -1 ? url.substring(url.lastIndexOf(".") + 1) : "";
  if ($.inArray(ext, arr) == -1) {
    return false;
  } else {
    return true;
  }
}
