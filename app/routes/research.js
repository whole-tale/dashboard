import Ember from 'ember';

let frontends = [
  {
    id: 1,
    name: 'Jupyter Notebook',
    image: 'frontends/jupyter.png',
    description: 'The Jupyter Notebook is a web application that allows you to create and share documents that contain live code, equations, visualizations and explanatory text. Uses include: data cleaning and transformation, numerical simulation, statistical modeling, machine learning and much more.',
    date: '5/25/2016',
    active : "active",
    likes: '1143'
  },  {
    id: 1,
    name: 'Terminal',
    image: 'frontends/terminal.png',
    description: 'IPython/Jupyter supports browser-based interactive terminal sessions. You can interact with your data via the familar command line interface.',
    date: '7/24/2016',
    active : "",
    likes: '112'
  },  {
    id: 1,
    name: 'Cloud9 iDE',
    image: 'frontends/cloud9.png',
    description: 'Cloud9 IDE is an online integrated development environment, published as open source from version 3.0. It supports hundreds of programming languages, including PHP, Ruby, Perl, Python, JavaScript with Node.js, and Go.',
    date: '9/1/2016',
    active : "",
    likes: '89'
  }
];

let dataWorkspaces = [
  {
    id: 1,
    name: 'OwnCloud',
    image: 'dataworkspaces/owncloud.jpg',
    description: 'A safe home for all your data. Access & share your files, calendars, contacts, mail & more from any device, on your terms.',
    date: '8/15/2016',
    active : "active",
    likes: '155'
  },  {
    id: 1,
    name: 'Browser Upload',
    image: 'dataworkspaces/browsers.png',
    description: 'A simplified browser interface to WholeTale API.',
    date: '8/7/2016',
    active : "",
    likes: '112'
  }
];

let drives = [
  "A Global Tour of Precipitation",
  "Acidifying Oceans: Oceans and Climate Change",
  "Aerosols: Black Carbon and Sulfate",
  "Aerosols: FIM Chem Model - Real-time",
  "Atmospheric Chemistry: GEOS-5 Model",
  "Carbon Dioxide: One Year - 2012"
  ];

export default Ember.Route.extend({
  model() {
    var real=false;

    if (real) {
      return {
        frontends: this.get('store').findAll('frontend'),
        dataWorkspaces: this.get('store').findAll('data-workspace')
      };
    } else {
      return {
      frontends : frontends,
        dataWorkspaces : dataWorkspaces,
        drives : drives
    };
  }
  }
});

