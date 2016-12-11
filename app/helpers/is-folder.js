import Ember from 'ember';

export function isFolder(fileOrFolderName/*, hash*/) {
  return (fileOrFolderName.indexOf(".") == -1);
}


export default Ember.Helper.helper(isFolder);
