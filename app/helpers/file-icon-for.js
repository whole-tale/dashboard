import Ember from 'ember';

function iconTemplate(iconName) {
  return '<img class="ui tiny image" style="margin-top: 0; float:left; padding-top: 0; margin-right: 4px; width: 25px" src="' + iconName + '" width="25px">';
}
export function fileIconFor(filename/*, hash*/) {

  //console.log("Filename being passed in is");
  //console.log(filename);

  if (filename.length=1) // array - this is a hack, need to figure this out...
    filename = filename[0];

  if ((filename == null) || (typeof filename  == 'undefined')) return '<i class="large file outline icon"></i>';

  var res = filename.split(".");

  if (res.length <2 ) return '<i class="large file outline icon"></i>';

  var suffix = res[1].toLowerCase();

  if ((suffix === "ppt") || (suffix === "pptx")) return iconTemplate("/icons/ppt.jpg");
  if ((suffix === "xls") || (suffix === "xlsx")) return iconTemplate("/icons/excel.jpg");
  if (suffix === "pdf") return iconTemplate("/icons/pdf.jpg");
  if ((suffix === "doc") || (suffix === "docx")) return iconTemplate("/icons/word.jpg");

  // images

  if (suffix === "png")  return iconTemplate("/icons/png.png");
  if ((suffix === "tif") || (suffix === "tiff")) return iconTemplate("/icons/tiff.png");
  if ((suffix === "jpg") || (suffix === "jpeg")) return iconTemplate("/icons/jpg.png");

  if (suffix === "tgz")  return iconTemplate("/icons/tgz.png");
  if (suffix === "zip")  return iconTemplate("/icons/zip.png");

  if ((suffix === "hdf") || (suffix === "h5") || (suffix === "h5m"))  return iconTemplate("/icons/hdf.png");

  // don;t know it
  return '<i class="large file outline icon"></i>';
}

export default Ember.Helper.helper(fileIconFor);
