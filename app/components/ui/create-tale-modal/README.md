## select-data-modal


To include this modal in a template.hbs file:

```html
{{ui/create-tale-modal computeEnviroments=model.computeEnvironments queryParams=model.queryParams}}
```

computeEnvironments must be an object with these properties:

```
{
  officialEnvironments: [ ... ],
  nonOfficialEnvironments: [ ... ]
}
```

Environments are images fetched from girder using `GET api/v1/images/`

A note from Kacper in #core-dev: \
"accessLevel and public flag can be used to differentiate between official and non-official environments"

Open the modal with the script:

```js
$('.ui.modal.create-tale').modal('show');
```