import { inject, bindable, computedFrom } from 'aurelia-framework';
import { months } from '../../../../../node_modules/moment/moment';
import { Service } from './service';
let ProductionOrderLoader = require("../../../../loader/production-order-loader");
let StrikeOffLoader = require("../../../../loader/strike-off-usage-loader");
var moment = require('moment');

@inject(Service)
export class DataForm {
    @bindable title;
    @bindable readOnly;

    // itemYears = [];

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah",
    };

    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };


    get productionOrderLoader() {
        return ProductionOrderLoader;
    }


    get strikeOffLoader() {
        return StrikeOffLoader;
    }

    constructor(service) {
        this.service = service;

    }

    @computedFrom("data.Id")
    get isEdit() {
        return (this.data.Id || '').toString() != '';
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;

        this.cancelCallback = this.context.cancelCallback;
        this.deleteCallback = this.context.deleteCallback;
        this.editCallback = this.context.editCallback;
        this.saveCallback = this.context.saveCallback;

        if (this.data.StrikeOff) {
            this.selectedStrikeOff = this.data.StrikeOff;
        }

        if (this.data.ProductionOrder) {
            this.selectedProductionOrder = this.data.ProductionOrder;
        }
    }

    construction = "";
    @bindable selectedProductionOrder;
    selectedProductionOrderChanged(n, o) {
        if (this.selectedProductionOrder) {
            this.data.ProductionOrder = this.selectedProductionOrder;

            this.construction = `${this.selectedProductionOrder.Material.Name} / ${this.selectedProductionOrder.MaterialConstruction.Name} / ${this.selectedProductionOrder.MaterialWidth}`
        }
    }
    @bindable selectedStrikeOff;
    async selectedStrikeOffChanged(n, o) {
        if (this.selectedStrikeOff) {
            this.data.StrikeOff = this.selectedStrikeOff;
            var prevData = await this.service.getPrevData(this.data.StrikeOff.Id);
            if (!this.data.Id) {
                this.data.UsageReceiptItems = [];
                for (var item of this.data.StrikeOff.StrikeOffItems) {
                    var prevUsageReceipt = null;
                    if (prevData) {
                        prevUsageReceipt = prevData.UsageReceiptItems.find(s => s.ColorCode == item.ColorCode);
                    }
                    var usageReceipt = {};
                    usageReceipt.ColorCode = item.ColorCode;
                    usageReceipt.UsageReceiptDetails = [];
                    var idx = 0;
                    for (var detail of item.StrikeOffItemDetails) {
                        var prevDetail = null;
                        if (prevUsageReceipt) {
                            prevDetail = prevUsageReceipt.UsageReceiptDetails.find(s => s.Name == detail.Name);
                        }

                        var usageDetail = {};
                        usageDetail.Index = idx++;
                        usageDetail.Name = detail.Name;

                        if (prevDetail && prevDetail.Name.toLowerCase() !== "viscositas") {
                            usageDetail.ReceiptQuantity = prevDetail.ReceiptQuantity + prevDetail.Adjs1Quantity + prevDetail.Adjs2Quantity + prevDetail.Adjs3Quantity + prevDetail.Adjs4Quantity;
                        } else {
                            usageDetail.ReceiptQuantity = detail.Quantity;
                        }

                        usageReceipt.UsageReceiptDetails.push(usageDetail);
                    }
                    this.data.UsageReceiptItems.push(usageReceipt);
                }
            }
        }
        console.log(this.data.UsageReceiptItems);
    }
}