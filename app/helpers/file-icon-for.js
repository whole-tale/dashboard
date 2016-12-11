import Ember from 'ember';

function iconTemplate(iconName) {
  return '<img class="ui avatar image" style="float:right; margin-top: -8px; padding-top: 0;" src="' + iconName + '" width="25px">';
}
export function fileIconFor(filename/*, hash*/) {

  console.log("Filename being passed in is");
  console.log(filename);

  if (filename.length=1) // array - this is a hack, need to figure this out...
    filename = filename[0];

  if (filename == null) return '<i class="large file outline icon"></i>';

  var res = filename.split(".");
  var suffix = res[1];

  if ((suffix === "ppt") || (suffix === "pptx")) return iconTemplate("ppt.jpg");
  if ((suffix === "xls") || (suffix === "xlsx")) return iconTemplate("excel.jpg");
  if (suffix === "pdf") return iconTemplate("pdf.jpg");
  if ((suffix === "doc") || (suffix === "docx")) return iconTemplate("word.jpg");

  // don;t know it
  return '<i class="large file outline icon"></i>';
}

export default Ember.Helper.helper(fileIconFor);
