import { helper } from '@ember/component/helper';

    /**
    * Takes a list of authors from the backend and returns a string of first
    * and last names that can be shown in the UI.
    * 
    * The names are added to a string that should look like
    * Craig Willis, Root VonKlomph, Mike Lambert
    * 
    * Note that the last user doesn't have a comma at the end, and that if
    * the Tale only has a single author, there shouldn't be a comma. This can
    * be achieved by checking the size of the tale['authors'] array and keeping
    * track of the current position.
    * 
    * @method taleAuthorsToStr
    * @param params A list of JSON Tale authors [{author1}, {author2}, etc]
    */
export function taleAuthorsToStr(params/*, hash*/) {
  // String that will be shown to the UI.
  let allAuthors = String();
  params = params[0]
  if(params) {
    for(let position=0; position<params.length; position++) {
      let author = params[position];
      if (position>=1 && position<params.length) {
        // If there are more than one authors and we aren't at the last one
        allAuthors += ', '
      }
    allAuthors += author.firstName + ' ' + author.lastName;
    }
  }
  return allAuthors;
}

export default helper(taleAuthorsToStr);
