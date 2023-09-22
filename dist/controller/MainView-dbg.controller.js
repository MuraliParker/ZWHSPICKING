sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel,MessageBox) {
        "use strict";

        return Controller.extend("com.sap.parker.zwmpicking.controller.MainView", {
            onInit: function () {
                this.oDataModel = this.getOwnerComponent().getModel();
                this.currentStep="";
                this.wareHouseNumber="";
                this.resourceGrp="";
                this.handlerNumber="";
                this.userloginId= this._getUserID();
                if(this.userloginId === "DEFAULT_USER"){
                    this.userloginId ="";
                }
                this.getView().byId("inpMat").setValue(this.userloginId);
                this.getView().byId("inpMat").fireChange();
                var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteMainView").attachPatternMatched(this._onObjectMatched,this);
            },
            _getUserID: function(){
                if (sap.ushell) {
                    return sap.ushell.Container.getService ("UserInfo").getId();
                }
                return "";
            },
            _onObjectMatched: function(){
                // this.userloginId=sap.ushell.Container.getService ("UserInfo").getId();
                this.userloginId= this._getUserID();
                if(this.userloginId === "DEFAULT_USER"){
                    this.userloginId ="";
                }
                this.getView().byId("inpMat").setValue(this.userloginId);
            },
            onMaterialHandlerChange: function(){
                var that = this;
                this.getView().setBusy(true);
                this.handlerNumber = this.getView().byId("inpMat").getValue();
                if (!this.handlerNumber) {
                    console.log("Handler Name Not Found : ",this.handlerNumber);
                    that.getView().setBusy(false);
                    return;
                }
                this.getPrinterDetails(this.handlerNumber);
                this.oDataModel.read("/HandlerDetailSet('" + this.handlerNumber + "')" , {
                    
                    success: function (oData) {
                        console.log(oData);
                        that.getView().setBusy(false);
                        that.getView().byId("inpCurrQ").setValue(oData.Queue);
                        that.wareHouseNumber=oData.Lgnum;
                        that.resourceGrp=oData.Rsrcgrp;
                        that.getView().byId("lblCurrQ").setVisible(true);
                        that.getView().byId("inpCurrQ").setVisible(true);
                        that.getView().byId("lblnewQ").setVisible(true);
                        that.getView().byId("inpnewQ").setVisible(true);
                        that.getView().byId("changeQbtn").setVisible(true);
                        that.getView().byId("execbtn").setVisible(true);
                        if((oData.Lgnum) == "1000" || (oData.Lgnum) == "1002")
                        {
                            that.getView().byId("setPrinterbtn").setVisible(true);
                            that.getView().byId("lblPrinter").setVisible(true);
                            that.getView().byId("inpPrinter").setVisible(true);
                        }
                        else{
                        that.getView().byId("setPrinterbtn").setVisible(false);
                        that.getView().byId("lblPrinter").setVisible(false);
                        that.getView().byId("inpPrinter").setVisible(false);
                        }
                        

                        
    
                    },
                    error: function (oError) {
                        console.log(oError);
                        sap.m.MessageToast.show("Material handler is not found");
                        that.getView().setBusy(false);
                        that.getView().byId("execbtn").setVisible(false);
    
                    }
                });

            },
            getPrinterDetails: function(handlerNumber){
                var that = this;
                this.oDataModel.read("/PrinterDetailSet('" + this.handlerNumber + "')" , {
                    
                    success: function (oData) {
                        console.log(oData);
                        that.getView().byId("inpPrinter").setValue(oData.Spld);
                        
                    },
                    error: function (oError) {
                        console.log(oError);
    
                    }
                });
            },
          
            onExecutePress: function(){
                var that = this;
                var queue=this.getView().byId("inpCurrQ").getValue()
                this.oDataModel.read("/ConfirmWarehouseTaskSet", {
                    urlParameters: {
                        "$filter": "Lgnum eq '" + this.wareHouseNumber + "' and Queue eq '" + queue + "' and Prsrc eq '" + this.handlerNumber + "'",
                        "$expand": "CWTtoSer"
                    },
                    success: function (oData) {
                        console.log(oData);
                        if(oData.results.length > 0){
                        var wareHouseTaskModel = new JSONModel();
                        wareHouseTaskModel.setData(oData.results[0]);
                        that.itemData = oData.results[0];
                        that.getOwnerComponent().setModel(wareHouseTaskModel, "WarehouseTaskModel");
                        that.getOwnerComponent().getRouter().navTo("TaskView");
                        // that.getView().byId("warehouseHdrForm").setModel(wareHouseTaskModel, "WarehouseTaskModel");
                        // that.getView().byId("warehouseDetailForm").setModel(wareHouseTaskModel, "WarehouseTaskModel");
                        // that.getView().byId("inpSerialNumber").setValue(oData.results[0].CWTtoSer.results[0].Serid);
                        }
                        else{
                            MessageBox.information("No WareHouse Task Found");
                        }




                    },
                    error: function (oError) {
                        MessageBox.error("Error while fetching Warehouse Task");
                        console.log(oError);

                    }
                });



                // this.getOwnerComponent().getRouter().navTo("TaskView",{
                //     WarehouseNumber:this.wareHouseNumber,
                //     ResourceNumber:this.handlerNumber,
                //     Queue:this.getView().byId("inpCurrQ").getValue()
                // });
            },
            showNewQueueValueHelp: function(){
                var that = this;
                this._queueHelpDialog = null;
			    this._queueHelpDialog = sap.ui.xmlfragment(
				"com.sap.parker.zwmpicking.view.NewQueue",
				this
			);
            
            this.getView().addDependent(this._queueHelpDialog);
            this.oDataModel.read("/HandlerDetailSet", {
				urlParameters: {
					"$filter": "Lgnum eq '" + this.wareHouseNumber + "' and Rsrcgrp eq '" + this.resourceGrp +"'"
				},
				success: function (oData) {
					console.log(oData);
                    var dataModel = new JSONModel();
                    dataModel.setData({
                        QueueModelSet: oData.results
                    });
                    sap.ui.getCore().byId("idSearchNewQueue").setModel(dataModel, "QueueModel")
                    that._queueHelpDialog.open();

				},
				error: function (oError) {
					console.log(oError);

				}
			});
            },
            showPrinterValueHelp: function(oEvent){
                var that = this;
                this._valueHelpDialog = null;
			    this._valueHelpDialog = sap.ui.xmlfragment(
				"com.sap.parker.zwmpicking.view.printer",
				this
			);
    
			this.getView().addDependent(this._valueHelpDialog);
			// sap.ui.getCore().byId("idSearchPrinter").setModel(this.oDataModel, "PrinterModel");
            this.oDataModel.read("/PrinterDetailSet", {
				urlParameters: {
					"$filter": "Bname eq '" + this.handlerNumber + "'"
				},
				success: function (oData) {
					console.log(oData);
                    var dataModel = new JSONModel();
                    dataModel.setData({
                        PrinterModelSet: oData.results
                    });
                    sap.ui.getCore().byId("idSearchPrinter").setModel(dataModel, "PrinterModel")
                    that._valueHelpDialog.open();

				},
				error: function (oError) {
					console.log(oError);

				}
			});
			
            
            },
            handlePrinterSelClose: function(oEvent){
                this.SelectedPrinter = oEvent.getParameter("selectedItems")[0].getAggregation("cells")[0].getProperty("text");
                this.getView().byId("inpPrinter").setValue(this.SelectedPrinter);
                if (this._valueHelpDialog) {
                    this._valueHelpDialog.destroy(true);
                    this._valueHelpDialog = null;
                }
            },
            onPressOkButton: function(oEvent){
                this.SelectedPrinter= sap.ui.getCore().byId("idSearchPrinter").getSelectedItem().getAggregation("cells")[0].getProperty("text")
                this.getView().byId("inpPrinter").setValue(this.SelectedPrinter);
                if (this._valueHelpDialog) {
                    this._valueHelpDialog.destroy(true);
                    this._valueHelpDialog = null;
                }
            },
            onPressCancelButton: function(oEvent){
                if (this._valueHelpDialog) {
                    this._valueHelpDialog.destroy(true);
                    this._valueHelpDialog = null;
                }
            },
            onPressOkQueueButton: function(oEvent){
                this.setQueue= sap.ui.getCore().byId("idSearchNewQueue").getSelectedItem().getAggregation("cells")[0].getProperty("text")
                this.getView().byId("inpnewQ").setValue(this.setQueue);
                if (this._queueHelpDialog) {
                    this._queueHelpDialog.destroy(true);
                    this._queueHelpDialog = null;
                }
            },
            onPressCancelQueueButton: function(oEvent){
                if (this._queueHelpDialog) {
                    this._queueHelpDialog.destroy(true);
                    this._queueHelpDialog = null;
                }
            },
            onSetPrinter: function(){
                var that = this;
                this.getView().setBusy(true);
                this.requestBody = {};
                this.requestBody.Bname=this.handlerNumber;
                this.requestBody.Spld = this.getView().byId("inpPrinter").getValue();
                this.oDataModel.update("/PrinterDetailSet('" + this.handlerNumber + "')", this.requestBody, {
                    success: function (oData, oResponse) {
                        console.log("success");
                        that.getView().setBusy(false);
                        MessageBox.information("Printer has been Updated Successfully");
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        console.log("error");
                        MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                    
                    }
                });
            },
            onChangeQueue: function(){
                this.getView().setBusy(true);
                var that = this;
                this.requestBody = {};
                this.requestBody.Uname=this.handlerNumber;
                this.requestBody.Lgnum=this.wareHouseNumber;
                this.requestBody.Rsrc=this.handlerNumber;
                this.requestBody.Rsrcgrp=this.resourceGrp;
                this.requestBody.Seqno="";
                this.requestBody.Queue = this.getView().byId("inpnewQ").getValue();
                this.oDataModel.update("/HandlerDetailSet('" + this.handlerNumber + "')", this.requestBody, {
                    success: function (oData, oResponse) {
                        that.getView().setBusy(false);
                        console.log("success");
                        that.getView().byId("inpCurrQ").setValue(that.getView().byId("inpnewQ").getValue());
                        MessageBox.information("Queue has been Updated Successfully");
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        console.log("error");
                        MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                    
                    }
                });
            }
            
            
        });
    });
