import { inject, bindable, computedFrom } from 'aurelia-framework';
import { SalesService } from "../service";
var CostCalculationLoader = require("../../../../loader/cost-calculation-garment-loader");
var UomLoader = require("../../../../loader/uom-loader");

@inject(SalesService)
export class Item {
    @bindable selectedRO;

    constructor(salesService) {
        this.salesService = salesService;
    }

    get filter() {
        var filter = {
            // BuyerCode:this.data.BuyerCode,
            // Section: this.data.Section,
            "SCGarmentId!=null": true
        };
        return filter;
    }

    detailsColumns = [
        { header: "Carton 1" },
        { header: "Carton 2" },
        { header: "Style" },
        { header: "Colour" },
        { header: "Jml Carton" },
        { header: "Qty" },
        { header: "Total Qty" },
        { header: "GW" },
        { header: "NW" },
        { header: "NNW" },
        { header: "" },
    ];

    get roLoader() {
        return CostCalculationLoader;
    }

    get uomLoader() {
        return UomLoader;
    }

    uomView = (uom) => {
        return `${uom.Unit || uom.unit}`
    }

    roView = (costCal) => {
        return `${costCal.RO_Number}`
    }

    toggle() {
        if (!this.isShowing)
            this.isShowing = true;
        else
            this.isShowing = !this.isShowing;
    }

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.options = context.options;
        this.readOnly = this.options.readOnly;
        this.isCreate = context.context.options.isCreate;
        this.isEdit = context.context.options.isEdit;
        this.itemOptions = {
            error: this.error,
            isCreate: this.isCreate,
            readOnly: this.readOnly,
            isEdit: this.isEdit,
            header: context.context.options.header
        };
        if (this.data.roNo) {
            this.selectedRO = {
                RO_Number: this.data.RONo || this.data.roNo
            };
        }
        this.isShowing = false;
        if (this.data.details) {
            if (this.data.details.length > 0) {
                this.isShowing = true;
            }
        }
    }

    get addDetails() {
        return (event) => {
            const i = this.context.context.items.indexOf(this.context);

            let lastDetail;
            if (this.data.details.length > 0) {
                lastDetail = this.data.details[this.data.details.length - 1];
            } else if (i > 0) {
                const lastItem = this.context.context.items[i - 1];
                lastDetail = lastItem.data.details[lastItem.data.details.length - 1];
            }

            this.data.details.push({
                carton1: lastDetail ? lastDetail.carton2 + 1 : 0
            });
        };
    }

    get removeDetails() {
        return (event) => {
            this.error = null;
        };
    }

    get totalQty() {
        let qty = 0;
        if (this.data.details) {
            for (var detail of this.data.details) {
                if (detail.cartonQuantity && detail.quantityPCS) {
                    qty += detail.cartonQuantity * detail.quantityPCS;
                }
            }
        }
        return qty;
    }

    get totalCtn() {
        let qty = 0;
        if (this.data.details) {
            for (var detail of this.data.details) {
                if (detail.cartonQuantity) {
                    qty += detail.cartonQuantity;
                }
            }
        }
        return qty;
    }

    get amount() {
        this.data.amount = 0;
        if (this.data.quantity && this.data.priceFOB) {
            this.data.amount = this.data.quantity * this.data.priceFOB
        }
        return this.data.amount;
    }

    get subGrossWeight() {
      return this.data.details.reduce((acc, cur) => acc += cur.grossWeight, 0);
    }
  
    get subNetWeight() {
      return this.data.details.reduce((acc, cur) => acc += cur.netWeight, 0);
    }
  
    get subNetNetWeight() {
      return this.data.details.reduce((acc, cur) => acc += cur.netNetWeight, 0);
    }
}
