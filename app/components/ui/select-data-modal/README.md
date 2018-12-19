## select-data-modal

Usage:

Define a function called `updateSessionData` inside your component.js file. (You can name this something different if you want). This function will have the selected items passed in from the modal. 

Example component.js:

```js
updateSessionData(listOfSelectedItems) {
  // NOTE: Structure of the list looks like this:

  /*
    [
      {
        "id": "59aeb3f246a83d0001ab6777",
        "name": "us85co.xls",
        "_modelType": "item"
      },
      {
        "id": "59aeb3f246a83d0001ab6775",
        "name": "usco2000.xls",
        "_modelType": "item"
      },
      {
        "id": "59aeb3f246a83d0001ab677b",
        "name": "datadict2005.html",
        "_modelType": "item"
      }
    ]
  */

  // do something with selected items here ...
}
```

Example template.hbs:

```html
{{ui/select-data-modal updateSessionData=updateSessionData}}
```

Open the modal with the script:

```js
$('.ui.modal.selectdata').modal('show');
```