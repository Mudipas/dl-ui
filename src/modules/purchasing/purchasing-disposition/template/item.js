import { inject, bindable } from 'aurelia-framework';
import { Service } from '../service';
const ProductLoader = require('../../../../loader/product-loader');
const EPOLoader = require('../../../../loader/purchase-order-external-all-loader');

var moment = require('moment');

@inject(Service)
export class PurchasingDispositionItem {
    @bindable selectedEPO;
    @bindable vatValue;
    @bindable incomeTaxValue;

    //itemsColumns = ["PRNo", "Category", "Product", "DealQuantity", "DealUom", "PaidQuantity", "PricePerDealUnit", "PriceTotal", "PaidPrice"];
    itemsColumns = {
        columns: ["PRNo", "Unit", "Kategori", "Barang", "Jumlah Dipesan", "Satuan", "Jumlah Dibayar", "Harga Satuan", "Harga Total", "Harga Dibayar"],
        onRemove: function () {
            this.bind();
        }
    };
    
    constructor(service) {
        this.service = service;
    }

    activate(context) {
        this.context=context;
        this.items = context.context.items;
        this.data = context.data;
        this.error = context.error;
        this.options = context.context.options;
        this.readOnly = context.options.readOnly;
        this.filter = this.options.supplierId && this.options.currencyId ? { "supplierId": this.options.supplierId, "currencyId":this.options.currencyId, } : {};
        
        if(this.data.EPONo){
            this.selectedEPO=this.data;
        }

        if(this.data.Details){
            this.isShowing=true;
        }
        if(this.data.UseIncomeTax){
            this.incomeTax=`${this.data.IncomeTax.name} - ${this.data.IncomeTax.rate}`;
        }
        this.GetTax();
    }
    // @computedFrom("data.EPONo")
    // get incomeTax() {
    //     if(this.data.UseIncomeTax){
    //         return `${this.data.IncomeTax.name}-${this.data.IncomeTax.rate}`;
    //     }
    //     else{
    //         return "-";
    //     }
    // }
    
    async selectedEPOChanged(newValue) {
        if (newValue) {
            this.selectedEPO=newValue;
            
            if(newValue._id || newValue.EPOId){
                this.data.EPOId=newValue._id || this.data.EPOId;
                this.data.EPONo= newValue._id ? newValue.no : this.data.EPONo;
                this.data.UseVat= newValue._id ?newValue.useIncomeTax : this.data.UseVat;
                this.data.UseIncomeTax=newValue._id ? newValue.useVat : this.data.UseIncomeTax;
                if(this.data.UseIncomeTax){
                    this.data.IncomeTax=newValue.vat ? newValue.vat : this.data.IncomeTax;
                    this.data.IncomeTax.Name=newValue.vat.name;
                    this.data.IncomeTax.Id=newValue.vat._id;
                    this.data.IncomeTax.Rate=newValue.vat.rate;
                    this.incomeTax=`${this.data.IncomeTax.name} - ${this.data.IncomeTax.rate}`;
                    
                }
                else{
                    this.data.IncomeTax={};
                    this.data.IncomeTax.name="";
                    this.data.IncomeTax._id="";
                    this.data.IncomeTax.rate=0;
                    this.incomeTax="-";
                }
                var arg = {
                    epoId:this.data.EPOId
                }
                var dataDisposition=await this.service.getDispositions(arg);
                var details=[];
                for(var item of newValue.items){
                    for(var detail of item.items){
                        var qty=detail.dealQuantity;
                        if(dataDisposition.info.count>0){
                            for(var DispoData of dataDisposition.data){
                                for(var dispoItem of DispoData.Items){
                                    for(var dispoDetail of dispoItem.Details){
                                        if(dispoDetail.PRId==item.purchaseRequest._id && dispoDetail.Product._id==detail.product._id){
                                            qty-=dispoDetail.PaidQuantity;
                                        }
                                    }
                                }
                            }
                        }
                        //var qty=detail.dealQuantity-detail.dispositionQuantity;
                        // this.data.Unit=newValue.unit;
                        // this.data.Unit.Id=newValue.unit._id;
                        // this.data.Unit.Name=newValue.unit.name;
                        // this.data.Unit.Division=newValue.unit.division;
                        // this.data.Unit.Division.Name=newValue.unit.division.name;
                        details.push({
                            PRNo: item.purchaseRequest.no,
                            UnitId:item.unitId,
                            Unit:item.unit,
                            PRId: item.purchaseRequest._id,
                            Product:detail.product,
                            DealQuantity:qty,
                            DealUom:detail.dealUom,
                            Category: item.category,
                            CategoryId:item.categoryId,
                            PricePerDealUnit: detail.pricePerDealUnit,
                            PaidQuantity: qty,
                            PaidPrice: detail.pricePerDealUnit*qty
                        })
                    }
                    // if(this.data.UseIncomeTax){
                    //     this.incomeTaxValue+=
                    // }
                    var ppn=0;
                    var pph=0;
                    if(this.data.UseIncomeTax){
                        pph= detail.pricePerDealUnit*qty*this.data.IncomeTax.Rate;
                    }
                    if(this.data.UseVat){
                        ppn= detail.pricePerDealUnit*qty*0.01;
                    }
                    this.incomeTaxValue+=pph;
                    this.vatValue+=ppn;
                }
                this.data.Details=details;
            }
            this.isShowing =true;
        }
    }

    // @computedFrom("selectedEPO._id")
    // get incomeTax() {
    //     return `${this.data.IncomeTax.Name} - ${this.data.IncomeTax.Rate}`;
    // }
    toggle() {
        this.isShowing = !this.isShowing;
    }

    get epoLoader() {
        return EPOLoader;
    }

    epoView = (epo) => {
        var no= epo.no || this.data.EPONo;
        return `${no}`;
    }

    GetTax(){
        console.log(this.data)
        this.incomeTaxValue=0;
        this.vatValue=0;
        if(this.data.Details){
            for(var detail of this.data.Details){
                var ppn=0;
                var pph=0;
                if(this.data.UseIncomeTax){
                    pph= detail.PaidPrice*this.data.IncomeTax.rate;
                }
                if(this.data.UseVat){
                    ppn= detail.PaidPrice*0.01;
                }
                this.incomeTaxValue+=pph;
                this.vatValue+=ppn;
            }

        }
    }

    detailChanged(e){
        this.GetTax();
    }
}