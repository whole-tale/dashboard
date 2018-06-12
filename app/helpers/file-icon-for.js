import Ember from 'ember';

function iconTemplate(iconName) {
  return '<img class="ui tiny image" style="margin-top: 0; float:left; padding-top: 0; margin-right: 4px; width: 25px" src="' + iconName + '" width="25px">';
}
export function fileIconFor(params/*, hash*/) {
  let [filename] = params;
  console.log(filename);
  //console.log("Filename being passed in is");
  //console.log(filename);

  if (filename.length==1) { // array - this is a hack, need to figure this out...
    filename = filename[0];
  }

  if ((filename == null) || (typeof filename  == 'undefined')) {
    return '<i class="large file outline icon"></i>';
  }

  var res = filename.split(".");

  if (res.length < 2 ) return '<i class="large file outline icon"></i>';

  var suffix = res[1].toLowerCase();

  if ((suffix === "ppt") || (suffix === "pptx")) {
    return iconTemplate("/icons/ppt.jpg");
  } else if ((suffix === "xls") || (suffix === "xlsx")) {
    return iconTemplate("/icons/excel.jpg");
  } else if (suffix === "pdf") {
    return iconTemplate("/icons/pdf.jpg");
  } else if ((suffix === "doc") || (suffix === "docx")) {
    return iconTemplate("/icons/word.jpg");
  } else if (suffix === "html") {
    return iconTemplate("/icons/html.png");
  }

  // images

  else if (suffix === "png") {
    return iconTemplate("/icons/png.png");
  } else if ((suffix === "tif") || (suffix === "tiff")) {
    return iconTemplate("/icons/tiff.png");
  } else if ((suffix === "jpg") || (suffix === "jpeg")) {
    return iconTemplate("/icons/jpg.png");
  } else if (suffix === "tgz")  {
    return iconTemplate("/icons/tgz.png");
  } else if (suffix === "zip") {
    return iconTemplate("/icons/zip.png");
  } else if ((suffix === "hdf") || (suffix === "h5") || (suffix === "h5m")) { 
    return iconTemplate("/icons/hdf.png");
  }

  // don;t know it
  return `<i class="fas fa-file fa-2x"></i><span style="
    color: white;
    position: absolute;
    left: 1px;
    right: 0;
    bottom: 0;
    top: 4px;
    margin:auto;
    font-size: .8em;
    font-weight: bolder;">${res[1].substr(0,3)}</span>`;
}
  
  // border: 1.5px solid white;
  // border-radius: 15%;
export default Ember.Helper.helper(fileIconFor);
