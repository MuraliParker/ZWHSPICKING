sap.ui.define(["sap/ui/test/Opa5"],function(e){"use strict";var i="MainView";e.createPageObjects({onTheAppPage:{actions:{},assertions:{iShouldSeeTheApp:function(){return this.waitFor({id:"app",viewName:i,success:function(){e.assert.ok(true,"The "+i+" view is displayed")},errorMessage:"Did not find the "+i+" view"})}}}})});