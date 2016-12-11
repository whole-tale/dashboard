import Ember from 'ember';

export function isNotFolder(fileOrFolderName/*, hash*/) {
  return (fileOrFolderName.indexOf(".") !== -1);
}


export default Ember.Helper.helper(isNotFolder);
