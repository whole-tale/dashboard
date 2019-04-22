import { helper } from '@ember/component/helper';

const authorToStr = function (author) {
  return `${author.firstName} ${author.lastName}`;
};

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
    * @param param0 A list of JSON Tale authors [{author1}, {author2}, etc]
    * @param param1 A user to display by default if no authors are present (e.g. creator)
    */
export function taleAuthorsToStr(params/*, hash*/) {
  // String that will be shown to the UI.
  let allAuthors = '';
  const authors = params[0];
  const creator = params[1];
  if (authors && authors.length) {
    for (let i = 0; i < authors.length; i++) {
      if (i > 0) {
         allAuthors += ', ';
      }
      allAuthors += authorToStr(authors[i]);
    }
  } else if (creator) {
    allAuthors = authorToStr(creator);
  }
  return allAuthors;
}

export default helper(taleAuthorsToStr);
