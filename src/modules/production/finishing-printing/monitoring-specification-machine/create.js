import {inject, Lazy} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Service} from './service';



@inject(Router, Service)
export class Create {
    constructor(router, service) {
        this.router = router;
        this.service = service;
        this.data = { "import": true };

    }

    activate(params) {

    }

    list() {
        // alert("Data berhasil dibuat");
        // this.router.navigateToRoute('create', { replace: true, trigger: true });
        this.router.navigateToRoute('list');
    }

    save() {
        var hours = new Date(this.data.time).getHours() ? new Date(this.data.time).getHours() : "";
        var minutes = new Date(this.data.time).getMinutes() ? new Date(this.data.time).getMinutes() : "";
        var date = this.data.date.toString();

        var dateTime = date + ":" + hours + ":" + "" + minutes;

        this.data.time = new Date(dateTime);
        this.data.date = new Date(this.data.date);

        this.service.create(this.data)
            .then(result => {
                this.data = {};
                this.error = {};
                alert("Data berhasil dibuat");
                this.router.navigateToRoute('create', { replace: true, trigger: true });
            })
            .catch(e => {
                this.error = e;
            })
    }

}