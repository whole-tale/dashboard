import Route from '@ember/routing/route';

export default Route.extend({

    setupController(controller, model) {
        this._super(controller, model);

        controller.closeWindow();
    }
});
