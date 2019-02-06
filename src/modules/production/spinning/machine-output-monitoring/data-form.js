import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service } from './service';
import moment from 'moment';

var LotLoader = require('../../../../loader/lot-configuration-for-machine-output-loader');
var MaterialTypeLoader = require('../../../../loader/material-types-loader');
var UnitLoader = require('../../../../loader/unit-azure-loader');

@inject(Service, BindingEngine)
export class DataForm {
    @bindable title;
    @bindable readOnly;

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah",
    };

    processTypeList = [
        "",
        "Blowing",
        "Carding",
        "Pre-Drawing",
        "Finish Drawing",
        "Flyer",
        "Ring Spinning",
        "Winding"
    ];

    shiftList = [
        "",
        "Shift 1 06:00 - 14:00",
        "Shift 2 14:00 - 22:00",
        "Shift 3 22:00 - 06:00"
    ];

    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    spinningFilter = {"DivisionName.toUpper()":"SPINNING"};

    constructor(service, bindingEngine) {
        this.service = service;
        this.bindingEngine = bindingEngine
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;

        this.isItem = false;
        console.log(this.data)
        this.check=false;
        if(!this.data.ProcessType || this.data.ProcessType == ""){
            console.log(this.data.ProcessType)
            this.isItem = false;
        } else {
            this.isItem = true;
        }
        this.isMaterial = false;
        // this.data.machine = selectedProcess;
        if(!this.data.MaterialTypeId || this.data.MaterialTypeId == ""){
            this.isMaterial = false;
        } else {
            this.isMaterial = true;
        }
        console.log(this.isItem)
        // this.cancelCallback = this.context.cancelCallback;
        // this.deleteCallback = this.context.deleteCallback;
        // this.editCallback = this.context.editCallback;
        // this.saveCallback = this.context.saveCallback;
    }

    items ={
        columns : [
            "Nomor Mesin",
            "Nama Mesin",
            "Output (Counter)",
            "UOM",
            "Bale",
            "Total Delivery",
            "Spindle Kosong (Flyer)",
            "Bad Cone (Winder)",
            "Eff%"],
        onRemove: function () {
            this.bind();
        }
    };
    

    // get addItems() {
    //     return (event) => {
    //         this.data.Items.push({})
    //     };
    // }

    processTypeChanged(e) {
        var selectedProcess = e.srcElement.value;
        this.error=this.context.error;
        this.check=false;
        this.data.ProcessType = null;
        if (selectedProcess) {
            this.check=true;
            this.data.ProcessType = selectedProcess;
        }
        this.data.items = [];
        //     if (this.data.ProcessType == "Finish Drawing") {
        //         this.ProcessType = true;
        //     }
        //     if (this.data.ProcessType == "Blowing" || 
        //         this.data.ProcessType == "Carding" || 
        //         this.data.ProcessType == "Pre-Drawing" || 
        //         this.data.ProcessType == "Finishing-Drawing")  {
        //             this.finishingDrawing = false;
        //     } else {
        //         this.finishingDrawing = true;
        //     }
        // }
    }

    materialTypeChanged(e){
        var selectedProcess = e.srcElement.value;
        console.log(e.srcElement.value)
        this.data.MaterialTypeId = selectedProcess;
        if(!this.data.MaterialTypeId || this.data.MaterialTypeId == ""){
            this.isMaterial = false;
        } else {
            this.isMaterial = true;
        }
        console.log(this.isMaterial)
    }

    mockLotLoader = (keyword, filter) => {

        return Promise.resolve([{ Name: "Lot 1" }, { Name: "Lot 2" }]);
    }

    get lotLoader() {
        //return LotLoader;
        return LotLoader;
    }

    get materialTypeLoader() {
        return MaterialTypeLoader;
    }

    mockProcessLoader = (keyword, filter) => {

        return Promise.resolve([{ Name: "Process Type 1" }, { Name: "Process Type 2" }]);
    }

    get processLoader() {
        //return ProcessLoader;
        return this.mockProcessLoader;
    }

    get grandTotal() {
        let result = 0;
        if (this.data.Items && this.data.Items.length > 0) {
            for (let item of this.data.Items) {
                if (item.Ball)
                    result += item.Ball;
            }
        }
        return result;
    }    
    
    get unitLoader() {
        return UnitLoader;
    }

    // unitView = (unit) => {
    //     return `${unit.Division.Name}`;
    // }
}
