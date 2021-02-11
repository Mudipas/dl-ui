import { inject } from "aurelia-framework";
import moment from "moment";
import numeral from "numeral";
import XLSX from "xlsx";
import { Service } from "./service";
const SupplierLoader = require("../../../../loader/supplier-loader");
const DivisionLoader = require("../../../../loader/division-loader");

@inject(Service)
export class List {
  itemYears = [];
  supplierQuery = { Import: false };
  columns = [
    {
      field: "CustomsArrivalDate",
      title: "Tanggal Bon",
      formatter: function (value, data, index) {
        return value ? numeral(value).format("0,000.00") : "0";
      },
      align: "right",
    },
    { field: "SupplierName", title: "Supplier" },
    { field: "ProductName", title: "Keterangan" },
    { field: "DeliveryOrderNo", title: "No Surat Jalan" },
    { field: "BillNo", title: "No BP Besar" },
    { field: "PaymentBill", title: "No BP Kecil" },
    { field: "InvoiceNo", title: "No Invoice" },
    { field: "VATNo", title: "No Faktur Pajak" },
    { field: "InternalNoteNo", title: "No NI" },
    { field: "PurchasingCategoryName", title: "Kategori Pembelian" },
    { field: "AccountingCategoryName", title: "Kategori Pembukuan" },
    { field: "InternalNoteQuantity", title: "Quantity" },
    { field: "CurrencyCode", title: "Mata Uang" },
    { field: "DPPAmount", title: "DPP" },
    { field: "VATAmount", title: "PPN" },
    { field: "IncomeTaxAmount", title: "PPh" },
    { field: "Total", title: "Total(IDR)" }
  ];

  controlOptions = {
    label: {
      length: 4,
    },
    control: {
      length: 4,
    },
  };

  tableOptions = {
    showColumns: false,
    search: false,
    showToggle: false,
    sortable: false,
    pagination: false,
  };

  constructor(service) {
    this.service = service;
    this.info = {};
    this.error = {};
    this.data = [];

    this.itemMonths = [
      { text: "January", value: 1 },
      { text: "February", value: 2 },
      { text: "March", value: 3 },
      { text: "April", value: 4 },
      { text: "May", value: 5 },
      { text: "June", value: 6 },
      { text: "July", value: 7 },
      { text: "August", value: 8 },
      { text: "September", value: 9 },
      { text: "October", value: 10 },
      { text: "November", value: 11 },
      { text: "Desember", value: 12 },
    ];
    this.currentYear = moment().format("YYYY");

    for (var i = parseInt(this.currentYear); i >= 2018; i--) {
      this.itemYears.push(i.toString());
    }
  }

  supplierView = (supplier) => {
    return supplier.name;
  };

  divisionView = (division) => {
    return division.Name;
  };

  loader = (info) => {
    let order = {};
    if (info.sort) order[info.sort] = info.order;

    let arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      order: order,
      select: [],
      isImport: false,
      isForeignCurrency: true,
    };

    if (this.info.supplier && this.info.supplier.name)
      arg.supplierName = this.info.supplier.name;

    if (this.info.division && this.info.division.Id)
      arg.divisionId = this.info.division.Id;

    if (this.info.month && this.info.month.value)
      arg.month = this.info.month.value;

    if (this.info.year) arg.year = this.info.year;

    return this.flag
      ? this.service.search(arg).then((result) => {
        // let before = {};

        // if (result.data.length != 0) {
        //     for (let i in result.data) {
        //         if (result.data[i].Currency != before.Currency) {
        //             before = result.data[i];
        //             before._Currency_rowspan = 1;
        //         } else {
        //             before._Currency_rowspan++;

        //             result.data[i].Currency = undefined;
        //         }
        //         result.data[i].Products = result.data[i].Products || "";
        //     }
        // }
        // setTimeout(() => {
        //     $('#credit-balance-table td').each(function () {
        //         if ($(this).html() === '-')
        //             $(this).hide();
        //     })
        // }, 10);

        return {
          total: result.info.Count,
          data: result.data,
        };
      })
      : { total: 0, data: [] };
  };

  search() {
    this.error = {};
    this.flag = true;
    this.tableList.refresh();
  }

  excel() {
    if (this.info.supplier && this.info.supplier.name)
      this.info.supplierName = this.info.supplier.name;
    else this.info.supplierName = null;

    if (this.info.division && this.info.division.Id)
      this.info.divisionId = this.info.division.Id;
    else this.info.divisionId = null;

    // this.flag = true;
    // this.tableList.refresh();

    let params = {
      supplierName: this.info.supplierName,
      divisionId: this.info.divisionId,
      month: this.info.month.value,
      year: this.info.year,
      isImport: false,
    };

    this.service.getXls(params);

    // this.getExcelData();
  }

  pdf() {
    if (this.info.supplier && this.info.supplier.name)
      this.info.supplierName = this.info.supplier.name;
    else this.info.supplierName = null;

    if (this.info.division && this.info.division.Id)
      this.info.divisionId = this.info.division.Id;
    else this.info.divisionId = null;

    // this.flag = true;
    // this.tableList.refresh();

    let params = {
      supplierName: this.info.supplierName,
      divisionId: this.info.divisionId,
      month: this.info.month.value,
      year: this.info.year,
      isImport: false,
    };

    this.service.getPdf(params);

    // this.getExcelData();
  }

  reset() {
    this.flag = false;
    this.info.supplier = null;
    this.info.division = null;
    this.error = {};
    this.info.year = moment().format("YYYY");
    this.info.month = { text: "January", value: 1 };
    this.tableList.refresh();
  }

  get supplierLoader() {
    return SupplierLoader;
  }

  get divisionLoader() {
    return DivisionLoader;
  }
}
