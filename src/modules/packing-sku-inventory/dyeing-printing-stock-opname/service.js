import { inject, Lazy } from "aurelia-framework";
import { HttpClient } from "aurelia-fetch-client";
import { RestService } from "../../../utils/rest-service";
import { Container } from 'aurelia-dependency-injection';
import { Config } from "aurelia-api";

const serviceUri = "stock-opname-warehouse";
const uomServiceUri = 'master/uoms';

 class Service extends RestService {
    constructor(http, aggregator, config, api) {
        super(http, aggregator, config, "packing-inventory");
    }

    search(info) {
        var endpoint = `${serviceUri}`;
        return super.list(endpoint, info);
    }

    
    getProductionOrderOutput(bonId) {
        var endpoint = `${serviceUri}/stock-opname-production-orders/${bonId}`;
        return super.get(endpoint);
    }

    create(data) {
        var endpoint = `${serviceUri}`;
        console.log(data);
        return super.post(endpoint, data);
        
    }

    getById(id) {
        var endpoint = `${serviceUri}/${id}`;
        return super.get(endpoint);
    }

    update(data) {
        var endpoint = `${serviceUri}/${data.id}`;
        return super.put(endpoint, data);
    }

    delete(data) {
        var endpoint = `${serviceUri}/${data.id}`;
        return super.delete(endpoint, data);
    }

    searchMonitoring(info) {
        var endpoint = `${serviceUri}/monitoring-so`;
        return super.list(endpoint, info);
    }

    generateExcel(info) {
        var endpoint = `${serviceUri}/monitoring-so-xls?dateFrom=${info.dateFrom}&dateTo=${info.dateTo}&productionOrderId=${info.productionOrderId}&track=${info.track}`;       
        return super.getXls(endpoint);
    }

    


}

class CoreService extends RestService {
    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "core");
    }

    getUom(info) {
        var endpoint = `${uomServiceUri}`;
        return super.list(endpoint, info);
    }

    
}

export {Service, CoreService}
