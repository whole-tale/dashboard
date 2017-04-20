import { faker } from 'ember-cli-mirage';

export default function() {
    // this.namespace = "";

    this.get('api/image', (schema, request) => {
        let fakeImages = schema.image.all();
        return (fakeImages) ? fakeImages.models : [];
    });

    this.get('api/folder/registered', (schema, request) => {
        let fakeRegistered = schema.folder.all();
        return (fakeRegistered) ? fakeRegistered.models : [];
    });

    this.get('api/tale', (schema, request) => {
        let fakeTale = schema.tale.all();
        return (fakeTale) ? fakeTale.models : [];
    });

    this.get('user/me', (schema, request) => {
        let user = schema.user.find(1);
        return (user) ? user.attrs : null;
    });

    this.get('api/user/:id', (schema, request) => {
        let user = schema.user.find(1);
        return (user) ? user.attrs : null;
    });

    this.get('oauth/provider', (schema, request) => {
        return {
            "Bitbucket": "https://bitbucket.org/blah",
            "GitHub": "https://github.com/blah",
            "Globus": "https://auth.globus.org/blah"
        };
    });

  // this.get('/frontends', function() {
  //   return {
  //     data: [{
  //         type: 'frontends',
  //         id: 1,
  //         attributes: {
  //           name: 'Jupyter Notebook',
  //           image: 'jupyter.png',
  //           description: 'The Jupyter Notebook is a web application that allows you to create and share documents that contain live code, equations, visualizations and explanatory text. Uses include: data cleaning and transformation, numerical simulation, statistical modeling, machine learning and much more.',
  //           date: '5/25/2016',
  //           active : "active",
  //           likes: '1143'
  //         }
  //       },  {
  //         type: 'frontends',
  //         id: 2,
  //         attributes: {
  //           name: 'Terminal',
  //           image: 'terminal.png',
  //           description: 'IPython/Jupyter supports browser-based interactive terminal sessions. You can interact with your data via the familar command line interface.',
  //           date: '7/24/2016',
  //           active: "",
  //           likes: '112'
  //         }
  //       },  {
  //         type: 'frontends',
  //         id: 3,
  //         attributes: {
  //           name: 'Cloud9 iDE',
  //           image: 'cloud9.png',
  //           description: 'Cloud9 IDE is an online integrated development environment, published as open source from version 3.0. It supports hundreds of programming languages, including PHP, Ruby, Perl, Python, JavaScript with Node.js, and Go.',
  //           date: '9/1/2016',
  //           active: "",
  //           likes: '89'
  //         }
  //       }]
  //   };
  // });
  //
  // this.get('/data-workspaces', function() {
  //   return {
  //     data: [
  //       {
  //         type: 'data-workspaces',
  //         id: 1,
  //         attributes: {
  //           name: 'OwnCloud',
  //           image: 'owncloud.jpg',
  //           description: 'A safe home for all your data. Access & share your files, calendars, contacts, mail & more from any device, on your terms.',
  //           date: '8/15/2016',
  //           active: "active",
  //           likes: '155'
  //         }
  //       },
  //       {
  //         type: 'data-workspaces',
  //         id: 2,
  //         attributes: {
  //           name: 'Browser Upload',
  //           image: 'browsers.png',
  //           description: 'A simplified browser interface to WholeTale API.',
  //           date: '8/7/2016',
  //           active: "",
  //           likes: '112'
  //         }
  //       }
  //     ]};
  // });

}

// These comments are here to help you get started. Feel free to delete them.

/*
 Config (with defaults).

 Note: these only affect routes defined *after* them!
 */

// this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
// this.namespace = '';    // make this `api`, for example, if your API is namespaced
// this.timing = 400;      // delay for each request, automatically set to 0 during testing

/*
 Shorthand cheatsheet:

 this.get('/posts');
 this.post('/posts');
 this.get('/posts/:id');
 this.put('/posts/:id'); // or this.patch
 this.del('/posts/:id');

 http://www.ember-cli-mirage.com/docs/v0.2.x/shorthands/
 */
