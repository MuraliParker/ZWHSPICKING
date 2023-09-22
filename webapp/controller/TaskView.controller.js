$.sap.require("com.sap.parker.zwmpicking.utils.Formatter");
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox) {
        "use strict";

        return Controller.extend("com.sap.parker.zwmpicking.controller.TaskView", {
            onInit: function () {
                this.wareHouseNumber = "";
                this.resourceGrp = "";
                this.handlerNumber = "";
                this.inputFlag = false;
                this.exceptionFlag = false;
                this.batchNumbers = [];
                this.serialNumbers = [];
                this.itemData = this.getOwnerComponent().getModel("WarehouseTaskModel").getData();
                this.serialNumbersResults = [];
                this.batchNumberResults = [];
                this.oDataModel = this.getOwnerComponent().getModel();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("TaskView").attachPatternMatched(this._onObjectMatched, this);

            },
            _onObjectMatched: function (oEvent) {
                this.batchNumbers = [];
                this.serialNumbers = [];
                this.itemData = this.getOwnerComponent().getModel("WarehouseTaskModel").getData();
                // this.wareHouseNumber = oEvent.getParameter("arguments").WarehouseNumber;
                // this.resourceGrp = oEvent.getParameter("arguments").ResourceNumber
                // this.queue = oEvent.getParameter("arguments").Queue;
                // console.log(this.wareHouseNumber + this.resourceGrp + this.queue);
                //this.getWarehouseTaskData(this.wareHouseNumber, this.resourceGrp, this.queue);
            },
            getWarehouseTaskData: function (warehouseNumber, ResourceGrp, Queue) {
                // Queue = "INBOUND"
                var that = this;
                // this.itemPath="ConfirmWarehouseTaskSet(Lgnum='"+ warehouseNumber +"',Queue='" + Queue + "',Prsrc='"  + ResourceGrp +"',Tanum='',Papos='')?$expand=CWTtoSer,CWTtoExc,CWTtoRet";
                // this.getView().byId("warehouseHdrForm").bindElement({
                //     path:"/" + this.itemPath
                // })
                // this.getView().byId("warehouseDetailForm").bindElement({
                //     path:"/" + this.itemPath
                // })

                this.oDataModel.read("/ConfirmWarehouseTaskSet", {
                    urlParameters: {
                        "$filter": "Lgnum eq '" + warehouseNumber + "' and Queue eq '" + Queue + "' and Prsrc eq '" + ResourceGrp + "'",
                        "$expand": "CWTtoSer"
                    },
                    success: function (oData) {
                        console.log(oData);
                        var wareHouseTaskModel = new JSONModel();
                        wareHouseTaskModel.setData(oData.results[0]);
                        that.itemData = oData.results[0];
                        that.getView().byId("warehouseHdrForm").setModel(wareHouseTaskModel, "WarehouseTaskModel");
                        that.getView().byId("warehouseDetailForm").setModel(wareHouseTaskModel, "WarehouseTaskModel");
                        // that.getView().byId("inpSerialNumber").setValue(oData.results[0].CWTtoSer.results[0].Serid);




                    },
                    error: function (oError) {
                        console.log(oError);

                    }
                });
                // this.oDataModel.read("/ConfirmWarehouseTaskSet(Lgnum='"+ warehouseNumber +"',Queue='" + Queue + "',Prsrc='"  + ResourceGrp +"',Tanum='',Papos='')?$expand=CWTtoSer,CWTtoExc", {

                //     success: function (oData) {
                //         console.log(oData);
                //         var dataModel = new JSONModel();
                //     dataModel.setData(oData);
                //     that.getView().setModel(dataModel, "WareHouseTaskModel")

                //     },
                //     error: function (oError) {
                //         console.log(oError);

                //     }
                // });
            },
            validateInput: function () {
                var oView = this.getView();
                this.setSourceBin = false;
                this.setScanPart = false;
                // this.setScanBatch = false;
                // this.setSerialNumber = false;
                this.setActualQty = false;
                this.setScanDestBin = false;
                if (oView.byId("inpScanSourceBin").getValue() != oView.byId("inpSourceBin").getValue()) {
                    this.setSourceBin = true;
                }

                if (oView.byId("inpScanPart").getValue() != oView.byId("inpPart").getValue()) {
                    this.setScanPart = true;
                }

                // if (oView.byId("inpScanBatch").getValue() != oView.byId("inpBatch").getValue()) {
                //     this.setScanBatch = true;
                // }

                // if (oView.byId("inpScanSerialNumber").getValue() != oView.byId("inpSerialNumber").getValue()) {
                //     this.setSerialNumber = true;
                // }

                if (parseFloat(oView.byId("inpActualQty").getValue()).toFixed(3) != parseFloat(oView.byId("inpTargetQty").getValue()).toFixed(3)) {
                    this.setActualQty = true;
                }

                if (oView.byId("inpDestinationBin").getValue().length > 0) {
                    if (oView.byId("inpScanDestinationBin").getValue() != oView.byId("inpDestinationBin").getValue()) {
                        this.setScanDestBin = true;
                    }
                }


            },
            enableExecbtn: function (oEvent) {
                if (oEvent.getSource().getId().indexOf("inpActualQty") >= 0) {
                    var targetQty = parseFloat(this.getView().byId("inpTargetQty").getValue()).toFixed(3);
                    var actQty = parseFloat(this.getView().byId("inpActualQty").getValue()).toFixed(3);
                    var diffQty = (parseFloat(targetQty) - parseFloat(actQty)).toFixed(3);
                    this.getView().byId("inpQtyDifference").setValue(diffQty);

                    if (parseInt(this.getView().byId("inpActualQty").getValue()) > 0) {

                        if (this.itemData.Sernp.length > 0) {
                            this.getView().byId("scanAddSerialBtn").setEnabled(true);
                            sap.m.MessageToast.show("Kindly Add Serial Number Number");
                        }
                        if (this.itemData.Xchpf === "X") {
                            this.getView().byId("scanAddBatchBtn").setEnabled(true);
                            sap.m.MessageToast.show("Kindly Add Batch Number Number");
                        }

                    }

                }
                if(oEvent.getSource().getId().indexOf("inpScanPart") >= 0){
                    var value = oEvent.getParameter("value");
                    if((value[0] === "p") || (value[0] === "P")){
                        this.getView().byId("inpScanPart").setValue(value.substring(1));
                    }
                }
                this.validateInput();

                if (!(this.setSourceBin) && !(this.setScanPart) && !(this.setActualQty) && !(this.setScanDestBin)) {
                    this.inputFlag = false;
                }
                else {
                    this.inputFlag = true;
                }

                if (this.inputFlag) {
                    if (this.exceptionFlag) {
                        this.getView().byId("execbtn").setEnabled(true);
                    }
                    else {
                        this.getView().byId("execbtn").setEnabled(false);
                    }
                }
                else if (!(this.inputFlag) && !(this.exceptionFlag)) {
                    this.getView().byId("execbtn").setEnabled(true);
                }
                else if (this.exceptionFlag) {
                    this.getView().byId("execbtn").setEnabled(true);

                }
                else {
                    this.getView().byId("execbtn").setEnabled(false);
                }
            },
            onPressBatchNumber: function () {
                this.getActualQty = parseInt(this.getView().byId("inpActualQty").getValue());
                this._addBatchNumberDialog = null;
                this._addBatchNumberDialog = sap.ui.xmlfragment(
                    "com.sap.parker.zwmpicking.view.AddBatchNumber",
                    this
                );
                for (var i = 1; i < this.getActualQty; i++) {
                    this.handleAddWorkOrder("idBatchNumber");
                }
                var oTable = sap.ui.getCore().byId("idBatchNumber").getItems();
                if (this.batchNumbers.length > 0) {
                    for (var i = 0; i < this.batchNumbers.length; i++) {
                        oTable[i].getAggregation("cells")[0].setProperty("value", this.batchNumbers[i]);
                    }
                }
                this._addBatchNumberDialog.open();
            },
            onPressSerialNumber: function () {
                this.getActualQty = parseInt(this.getView().byId("inpActualQty").getValue());
                this._addSerialNumberDialog = null;
                this._addSerialNumberDialog = sap.ui.xmlfragment(
                    "com.sap.parker.zwmpicking.view.AddSerialNumber",
                    this
                );
                for (var i = 1; i < this.getActualQty; i++) {
                    this.handleAddWorkOrder("idSerNumber");
                }
                var oTable = sap.ui.getCore().byId("idSerNumber").getItems();
                if (this.serialNumbers.length > 0) {
                    for (var i = 0; i < this.serialNumbers.length; i++) {
                        oTable[i].getAggregation("cells")[0].setProperty("value", this.serialNumbers[i]);
                    }
                }
                this._addSerialNumberDialog.open();
            },
            handleAddWorkOrder: function (tableId) {

                var columnListItemNewLine = new sap.m.ColumnListItem({
                    type: sap.m.ListType.Inactive,
                    cells: [
                        // add created controls to item
                        new sap.m.Input({
                            value: ""

                        })

                    ]
                });
                sap.ui.getCore().byId(tableId).addItem(columnListItemNewLine);

            },
            onPressBatchOkButton: function () {
                if (this._addBatchNumberDialog) {
                    this._addBatchNumberDialog.destroy(true);
                    this._addBatchNumberDialog = null;
                }
            },
            onPressBatchCancelButton: function () {
                if (this._addBatchNumberDialog) {
                    this._addBatchNumberDialog.destroy(true);
                    this._addBatchNumberDialog = null;
                }
            },
            onBatchValidateButton: function () {
                var that = this;
                this.batchNumbers = [];
                var oTable = sap.ui.getCore().byId("idBatchNumber").getItems();
                for (var i = 0; i < oTable.length; i++) {
                    this.batchNumbers.push(oTable[i].getAggregation("cells")[0].getProperty("value"));
                }
                this.prepareSerValPayload("Batch");
                this.oDataModel.create("/ConfirmWarehouseTaskSet", this.reqSerNumbersPayload, {

                    success: function (oData) {
                        console.log(oData);
                        that.checkBatchIdValid = [];
                        if (oData.CWTtoBat.results.length > 0) {
                            for (var counter = 0; counter < oData.CWTtoBat.results.length; counter++) {
                                that.checkBatchIdValid.push(oData.CWTtoBat.results[counter].Valid);
                            }
                        }
                        that.showValidateResultsBatchId(that.checkBatchIdValid);

                    },
                    error: function (oError) {
                        console.log(oError);


                    }
                });
            },
            onSerValidateButton: function () {
                var that = this;
                this.serialNumbers = [];
                var oTable = sap.ui.getCore().byId("idSerNumber").getItems();
                for (var i = 0; i < oTable.length; i++) {
                    this.serialNumbers.push(oTable[i].getAggregation("cells")[0].getProperty("value"));
                }
                this.prepareSerValPayload("Serial");
                this.oDataModel.create("/ConfirmWarehouseTaskSet", this.reqSerNumbersPayload, {

                    success: function (oData) {
                        console.log(oData);
                        that.checkSerialNumberValid = [];
                        if (oData.CWTtoSer.results.length > 0) {
                            for (var counter = 0; counter < oData.CWTtoSer.results.length; counter++) {
                                that.checkSerialNumberValid.push(oData.CWTtoSer.results[counter].Valid);
                            }
                        }
                        that.showValidateResultsSrNumber(that.checkSerialNumberValid);

                    },
                    error: function (oError) {
                        console.log(oError);


                    }
                });

            },
            showValidateResultsBatchId: function (resArray) {
                var getTableItem = sap.ui.getCore().byId("idBatchNumber").getItems();
                var bcheckValidFlag = true;

                for (var counter = 0; counter < getTableItem.length; counter++) {

                    if (resArray[counter] == "I") {
                        getTableItem[counter].getAggregation("cells")[0].setValueState("Error");
                        getTableItem[counter].getAggregation("cells")[0].setValueStateText("Invalid Batch Id");

                    }
                    else {
                        getTableItem[counter].getAggregation("cells")[0].setValueState("Success");
                        getTableItem[counter].getAggregation("cells")[0].setValueStateText("");
                    }
                }

                for (var count = 0; count < resArray.length; count++) {

                    if (resArray[count] == "I") {
                        bcheckValidFlag = false;
                        break;

                    }
                }
                if (bcheckValidFlag) {
                    sap.ui.getCore().byId("idBatchNumber").getParent().getEndButton().setEnabled(true);
                }
            },
            showValidateResultsSrNumber: function (resArray) {
                var getTableItem = sap.ui.getCore().byId("idSerNumber").getItems();
                var bcheckValidFlag = true;

                for (var counter = 0; counter < getTableItem.length; counter++) {

                    if (resArray[counter] == "I") {
                        getTableItem[counter].getAggregation("cells")[0].setValueState("Error");
                        getTableItem[counter].getAggregation("cells")[0].setValueStateText("Invalid Serial Number");

                    }
                    else {
                        getTableItem[counter].getAggregation("cells")[0].setValueState("Success");
                        getTableItem[counter].getAggregation("cells")[0].setValueStateText("");
                    }
                }

                for (var count = 0; count < resArray.length; count++) {

                    if (resArray[count] == "I") {
                        bcheckValidFlag = false;
                        break;

                    }
                }
                if (bcheckValidFlag) {
                    sap.ui.getCore().byId("idSerNumber").getParent().getEndButton().setEnabled(true);
                }


            },
            prepareSerValPayload: function (checkValidCase) {
                this.serialNumbersResults = [];
                this.batchNumberResults = [];
                if (this.serialNumbers.length > 0) {
                    for (var counter = 0; counter < this.serialNumbers.length; counter++) {
                        this.serialNumbersResults.push({
                            "Serid": this.serialNumbers[counter]

                        })
                    }
                }
                //batchNumbers
                if (this.batchNumbers.length > 0) {
                    for (var counter = 0; counter < this.batchNumbers.length; counter++) {
                        this.batchNumberResults.push({
                            "Batchid": this.batchNumbers[counter]

                        })
                    }
                }
                var actqty,diffqty;
                if(this.getView().byId("inpActualQty").getValue() === ""){
                    actqty = "0.000";
                }
                else{
                    actqty = this.getView().byId("inpActualQty").getValue();
                }
                if(this.getView().byId("inpQtyDifference").getValue() === ""){
                    diffqty = "0.000";
                }
                else{
                    diffqty = this.getView().byId("inpQtyDifference").getValue();
                }


                this.reqSerNumbersPayload = {
                    "Lgnum": this.itemData.Lgnum,
                    "Queue": this.itemData.Queue,     //this.getView().byId("whQueuedisplay").getText(),
                    "Prsrc": this.itemData.Prsrc,
                    "Vltyp": this.itemData.Vltyp,
                    "Nltyp": this.itemData.Nltyp,
                    "Who": this.itemData.Who,
                    "Tanum": this.itemData.Tanum, //this.getView().byId("whTaskdisplay").getText(),
                    "Papos": "0000",
                    "Squit": false,
                    "Vlpla": this.getView().byId("inpSourceBin").getValue(),
                    "Svlpla": this.getView().byId("inpScanSourceBin").getValue(),
                    "Matid": this.getView().byId("inpPart").getValue(),
                    "Smatid": this.getView().byId("inpScanPart").getValue(),
                    "Maktx": this.itemData.Maktx,
                    "Vsolm": this.getView().byId("inpTargetQty").getValue(),
                    "Meins": this.getView().byId("uom").getText(),
                    "Nista": actqty,
                    "Ndifa": diffqty,
                    "Batchid": this.itemData.Batchid, //this.getView().byId("inpBatch").getValue(),
                    "Sbatchid": "", //this.getView().byId("inpScanBatch").getValue(),
                    "Nlpla": this.getView().byId("inpDestinationBin").getValue(),
                    "Snlpla": this.getView().byId("inpScanDestinationBin").getValue(),
                    "Chksernum": "",
                    "Chkbatch": "",
                    "Sernp": "",
                    "Xchpf": "",
                    "Rdocid": this.itemData.Rdocid,
                    "Ritmid": this.itemData.Ritmid,
                    "Rdoccat": this.itemData.Rdoccat,
                    "CWTtoSer": this.serialNumbersResults,
                    "CWTtoExc": [],
                    "CWTtoRet": [],
                    "CWTtoBat": this.batchNumberResults
                };

                if (checkValidCase === "Batch") {
                    this.reqSerNumbersPayload.Chksernum = "";
                    this.reqSerNumbersPayload.Chkbatch = "X";
                }
                if (checkValidCase === "Serial") {
                    this.reqSerNumbersPayload.Chksernum = "X";
                    this.reqSerNumbersPayload.Chkbatch = "";
                }

            },
            onPressCancelButton: function () {
                if (this._addSerialNumberDialog) {
                    this._addSerialNumberDialog.destroy(true);
                    this._addSerialNumberDialog = null;
                }
            },
            onCloseSerValidateButton: function () {
                if (this._addSerialNumberDialog) {
                    this._addSerialNumberDialog.destroy(true);
                    this._addSerialNumberDialog = null;
                }
            },
            onException: function () {
                var that = this;
                this._dialogTable = null;
                this._dialogTable = sap.ui.xmlfragment(
                    "com.sap.parker.zwmpicking.view.Exception",
                    this
                );

                this.getView().addDependent(this._dialogTable);
                // sap.ui.getCore().byId("idSearchPrinter").setModel(this.oDataModel, "PrinterModel");
                this.oDataModel.read("/ExceptionList1Set", {
                    urlParameters: {
                        "$filter": "Lgnum eq '"+this.itemData.Lgnum+"'"
                    },
                    success: function (oData) {
                        console.log(oData);
                        var dataModel = new JSONModel();
                        dataModel.setData({
                            ExceptionModelSet: oData.results
                        });
                        sap.ui.getCore().byId("exceptionTable").setModel(dataModel, "ExceptionModel")
                        that._dialogTable.open();

                    },
                    error: function (oError) {
                        console.log(oError);

                    }
                });
            },
            onChangeQueue: function () {
                this.getOwnerComponent().getRouter().navTo("RouteMainView");
            },
            onPressOkButton: function (oEvent) {
                this.exceptionCode = [];
                this.busnContext = [];
                this.prmCode = [];
                if (sap.ui.getCore().byId("exceptionTable").getSelectedItems().length > 0) {
                    this.exceptionFlag = true;
                    //[0].mAggregations.cells[0].mProperties.text
                    var selectedItemsLength = sap.ui.getCore().byId("exceptionTable").getSelectedItems().length;
                    var selectedItem = sap.ui.getCore().byId("exceptionTable").getSelectedItems();

                    for (var counter = 0; counter < selectedItemsLength; counter++) {
                        this.exceptionCode.push(selectedItem[counter].getAggregation("cells")[0].getProperty("text"));
                        this.busnContext.push(selectedItem[counter].getAggregation("cells")[2].getProperty("text"));
                        this.prmCode.push(selectedItem[counter].getAggregation("cells")[3].getProperty("text"));
                    }

                }
                else {
                    this.exceptionFlag = false;
                }
                if (this._dialogTable) {
                    this._dialogTable.destroy(true);
                    this._dialogTable = null;
                }
                this.enableExecbtn(oEvent);

            },
            onExecutePress: function () {
                var that = this;
                this.onexecuteConfirmTask();
                // MessageBox.warning("If you want to take Print. Kindly Click on Print button or Click Execute button to continue", {
                //     actions: ["Print", "Execute"],
                //     onClose: function (sAction) {
                //         if (sAction == "Print") {
                //             that.onPrintLabels();
                //         }
                //         else {
                //             that.onexecuteConfirmTask();
                //         }

                //     }

                // });

            },
            preparePayload: function () {
                // this.results={};
                // this.results= this.exceptionResults;
                var that = this;
                var printFlag = "";
                if (this.getView().byId("printFlagCheckBox").getSelected()) {
                    printFlag = "X";
                }
                this.exceptionResults = [];
                this.SerialNumber = [];
                this.SerialNumber.push({
                    "Tanum": this.itemData.Tanum, //this.getView().byId("whTaskdisplay").getText(),
                    "Lscheck": false,
                    "Papos": "0000",
                    //  "Exccode" : this.exceptionCode[counter]
                    "Serid": "" //this.getView().byId("inpScanSerialNumber").getValue()
                })
                if (this.exceptionCode === undefined) {

                } else {
                    if (this.exceptionCode.length > 0) {
                        for (var counter = 0; counter < this.exceptionCode.length; counter++) {
                            this.exceptionResults.push({
                                "Tanum": this.itemData.Tanum, //this.getView().byId("whTaskdisplay").getText(),
                                "Papos": "0000",
                                "Exccode": this.exceptionCode[counter],
                                "Buscon": this.busnContext[counter],
                                "Prmode": this.prmCode[counter]
                            })
                        }
                    }
                }
                var actqty,diffqty;
                if(this.getView().byId("inpActualQty").getValue() === ""){
                    actqty = "0.000";
                }
                else{
                    actqty = this.getView().byId("inpActualQty").getValue();
                }
                if(this.getView().byId("inpQtyDifference").getValue() === ""){
                    diffqty = "0.000";
                }
                else{
                    diffqty = this.getView().byId("inpQtyDifference").getValue();
                }

                this.requestBody = {
                    "Lgnum": this.itemData.Lgnum,
                    "Queue": this.itemData.Queue, //this.getView().byId("whQueuedisplay").getText(),
                    "Prsrc": this.itemData.Prsrc,
                    "Vltyp": this.itemData.Vltyp,
                    "Nltyp": this.itemData.Nltyp,
                    "Who": this.itemData.Who, //this.getView().byId("whOrderdisplay").getText(),
                    "Tanum": this.itemData.Tanum,        //this.getView().byId("whTaskdisplay").getText(),
                    "Papos": "0000",
                    "Squit": false,
                    "Vlpla": this.getView().byId("inpSourceBin").getValue(),
                    "Svlpla": this.getView().byId("inpScanSourceBin").getValue(),
                    "Matid": this.getView().byId("inpPart").getValue(),
                    "Smatid": this.getView().byId("inpScanPart").getValue(),
                    "Maktx": this.itemData.Maktx,
                    "Vsolm": this.getView().byId("inpTargetQty").getValue(),
                    "Meins": this.getView().byId("uom").getText(),
                    "Nista": actqty,
                    "Ndifa": diffqty,
                    "Batchid": this.itemData.Batchid, //this.getView().byId("inpBatch").getValue(),
                    "Sbatchid": "",// this.getView().byId("inpScanBatch").getValue(),
                    "Nlpla": this.getView().byId("inpDestinationBin").getValue(),
                    "Snlpla": this.getView().byId("inpScanDestinationBin").getValue(),
                    "Sernp": "",
                    "Xchpf": "",
                    "Chksernum": "",
                    "Chkbatch": "",
                    "Rdocid": this.itemData.Rdocid,
                    "Ritmid": this.itemData.Ritmid,
                    "Rdoccat": this.itemData.Rdoccat,
                    "CWTtoSer": this.serialNumbersResults,
                    "CWTtoExc": this.exceptionResults,
                    "CWTtoRet": [],
                    "CWTtoBat": this.batchNumberResults,
                    "HUList": this.HUList,
                    "PrintHUList": printFlag


                };
                //    this.requestBody.CWTtoExc=this.exceptionResults;
                //    this.requestBody.CWTtoSer={};
                //    this.requestBody.CWTtoRet={};
            },

            fetchNextTask: function (warehouseNu, queue, resource, who) {
                var that = this;
                this.oDataModel.read("/ConfirmWarehouseTaskSet", {
                    urlParameters: {
                        "$filter": "Lgnum eq '" + warehouseNu + "' and Queue eq '" + queue + "' and Prsrc eq '" + resource + "' and Who eq '" + who + "'",
                        "$expand": "CWTtoSer"
                    },
                    success: function (oData) {
                        console.log(oData);
                        that.exceptionCode = [];
                        that.getView().byId("printFlagCheckBox").setSelected(false);
                        if (oData.results.length > 0) {
                            var wareHouseTaskModel = new JSONModel();
                            wareHouseTaskModel.setData(oData.results[0]);
                            that.itemData = oData.results[0];
                            that.getOwnerComponent().setModel(wareHouseTaskModel, "WarehouseTaskModel");

                        }
                        else {
                            MessageBox.information("No WareHouse Task Found");
                            that.getOwnerComponent().getRouter().navTo("RouteMainView");
                        }




                    },
                    error: function (oError) {
                        MessageBox.error("Error while fetching Warehouse Task");
                        console.log(oError);

                    }
                });
            }, onPressCreatePickHU: function () {
                var that = this;
                var destinationBin = this.getView().byId("inpScanDestinationBin").getValue();
                var actQty = this.getView().byId("inpActualQty").getValue();
                this.createPickHU = null;
                this.createPickHU = sap.ui.xmlfragment(
                    "com.sap.parker.zwmpicking.view.CreatePickHU",
                    this
                );
                if ((destinationBin.length > 0) && (actQty.length > 0) && (parseInt(actQty) > 0)) {
                    this.getView().addDependent(this.createPickHU);
                    this.createPickHU.open();
                }
                else {
                    MessageBox.alert(" Destination and Quantity should be filled");
                }

            },
            onPressBackButton: function () {
                this.createPickHU.close();
                // if (this._valueHelpDialog) {
                //     this._valueHelpDialog.destroy(true);
                //     this._valueHelpDialog = null;
                // }
            },
            onPressCreateHU: function (oEvent) {
                var that = this;
                this.HUList = "";
                var actqty;
                if(this.getView().byId("inpActualQty").getValue() === ""){
                    actqty = "0.000";
                }
                else{
                    actqty = this.getView().byId("inpActualQty").getValue();
                }
                this.dataPayload = {
                    "Lgnum": this.itemData.Lgnum,
                    "Who": this.itemData.Who,
                    "Tanum": this.itemData.Tanum, //this.getView().byId("whTaskdisplay").getText(),
                    "Nista": actqty,
                    "Meins": this.getView().byId("uom").getText(),
                    "HQty": this.boxNumber,
                    "Snlpla": this.getView().byId("inpScanDestinationBin").getValue(),
                    "Prsrc": this.itemData.Prsrc,
                    "Matid": this.getView().byId("inpPart").getValue(),
                    "HUList": ""
                }
                this.oDataModel.create("/PickHUSet", this.dataPayload, {
                    success: function (oData) {
                        sap.m.MessageToast.show("HU Created Successfully");
                        that.HUList = oData.HUList;
                        that.createPickHU.close();
                    },
                    error: function (oError) {
                        MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                    }
                })
            },
            onEnterBoxesInput: function (oEvent) {
                var that = this;
                this.boxNumber = oEvent.getParameter("value");
                if (parseInt(this.boxNumber) > parseInt(this.getView().byId("inpActualQty").getValue())) {
                    MessageBox.error("Boxes Quantity should not be more than Actual Quantity");
                    oEvent.getSource().getParent().getEndButton().setEnabled(false);
                }
                else {
                    oEvent.getSource().getParent().getEndButton().setEnabled(true);
                }


            },
            
            onexecuteConfirmTask: function () {
                var that = this;
                this.preparePayload();

                this.oDataModel.create("/ConfirmWarehouseTaskSet", this.requestBody, {


                    success: function (oData) {
                        console.log(oData);
                        var message;
                        if (that.getView().byId("printFlagCheckBox").getSelected()){
                            message = "Task Confirmed and Printed Successfully ";
                        }
                        else{
                            message = "Task Confirmed Successfully ";
                        }
                        MessageBox.information(message, {
                            action: [MessageBox.Action.OK],
                            onClose: function (sAction) {
                                // that.getOwnerComponent().getRouter().navTo("RouteMainView");

                                that.fetchNextTask(that.itemData.Lgnum, that.itemData.Queue, that.itemData.Prsrc, that.itemData.Who);
                            }

                        });

                    },
                    error: function (oError) {
                        console.log(oError);
                        MessageBox.error(JSON.parse(oError.responseText).error.message.value, {
                            action: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
                            onClose: function (sAction) {
                                // do nothing

                            }

                        });

                    }
                });
            }

        });
    });
